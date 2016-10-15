import { NgModule, Directive, Injectable, ElementRef, Input, Output, EventEmitter, OnDestroy, OnInit, OnChanges, SimpleChanges, NgZone } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/observable/timer';
import 'rxjs/add/operator/throttle';
import 'rxjs/add/operator/filter';

@Injectable()
export class AxisResolver {
  private vertical: boolean; // else horizontal

  constructor() {
    this.setVertical(true);
  }

  setVertical(vertical: boolean = true) {
    this.vertical = vertical;
  }

  clientHeightKey() {return this.vertical ? 'clientHeight' : 'clientWidth'}
  offsetHeightKey() {return this.vertical ? 'offsetHeight' : 'offsetWidth'}
  scrollHeightKey() {return this.vertical ? 'scrollHeight' : 'scrollWidth'}
  pageYOffsetKey()  {return this.vertical ? 'pageYOffset'  : 'pageXOffset'}
  offsetTopKey()    {return this.vertical ? 'offsetTop'    : 'offsetLeft'}
  scrollTopKey()    {return this.vertical ? 'scrollTop'    : 'scrollLeft'}
  topKey()          {return this.vertical ? 'top'          : 'left'}
}

export class Scroller {
  public scrollDownDistance: number;
  public scrollUpDistance: number;
  public scrollEnabled: boolean;
  public checkWhenEnabled: boolean;
  public container: Window | ElementRef | any;
  public immediateCheck: boolean;
  public useDocumentBottom: boolean;
  public checkInterval: number;
  private documentElement: Window | ElementRef | any;
  private isContainerWindow: boolean;
  private disposeScroll: Subscription;
  public lastScrollPosition: number = 0;
  // private axis: AxisResolver;

  constructor(
    private windowElement: Window | ElementRef | any,
    private $interval: Function,
    private $elementRef: ElementRef,
    private infiniteScrollDownCallback: Function,
    private infiniteScrollUpCallback: Function,
    infiniteScrollDownDistance: number,
    infiniteScrollUpDistance: number,
    infiniteScrollParent: Window | ElementRef | any,
    private infiniteScrollThrottle: number,
    private isImmediate: boolean,
    private horizontal: boolean = false,
    private alwaysCallback: boolean = false,
    private scrollDisabled: boolean = false,
    private axis: AxisResolver
  ) {
    this.isContainerWindow = Object.prototype.toString.call(this.windowElement).includes('Window');
    this.documentElement = this.isContainerWindow ? this.windowElement.document.documentElement : null;
    this.handleInfiniteScrollDistance(infiniteScrollDownDistance, infiniteScrollUpDistance);

    // if (attrs.infiniteScrollParent != null) {
    //   attachEvent(angular.element(elem.parent()));
    // }
    this.handleInfiniteScrollDisabled(scrollDisabled);
    this.defineContainer();
    this.createInterval();
    this.axis.setVertical(!this.horizontal);
  }

  defineContainer () {
    if (this.isContainerWindow) {
      this.container = this.windowElement;
    } else {
      this.container = this.windowElement.nativeElement;
    }
    this.attachEvent(this.container);
  }

  createInterval () {
    if (this.isImmediate) {
      this.checkInterval = this.$interval(() => {
        return this.handler();
      }, 0);
    }
  }

  height (elem: any) {
    let offsetHeight = this.axis.offsetHeightKey();
    let clientHeight = this.axis.clientHeightKey();

    // elem = elem.nativeElement;
    if (isNaN(elem[offsetHeight])) {
      return this.documentElement[clientHeight];
    } else {
      return elem[offsetHeight];
    }
  }

  offsetTop (elem: any) {
    let top = this.axis.topKey();

    // elem = elem.nativeElement;
    if (!elem.getBoundingClientRect) { // || elem.css('none')) {
      return;
    }
    return elem.getBoundingClientRect()[top] + this.pageYOffset(elem);
  }

  pageYOffset (elem: any) {
    let pageYOffset = this.axis.pageYOffsetKey();
    let scrollTop   = this.axis.scrollTopKey();
    let offsetTop   = this.axis.offsetTopKey();

    // elem = elem.nativeElement;
    if (isNaN(window[pageYOffset])) {
      return this.documentElement[scrollTop];
    } else if (elem.ownerDocument) {
      return elem.ownerDocument.defaultView[pageYOffset];
    } else {
      return elem[offsetTop];
    }
  }

  handler () {
    const container = this.calculatePoints();
    const scrollingDown: boolean = this.lastScrollPosition < container.scrolledUntilNow;
    this.lastScrollPosition = container.scrolledUntilNow;

    let remaining: number;
    let containerBreakpoint: number;
    if (scrollingDown) {
      remaining = container.totalToScroll - container.scrolledUntilNow;
      containerBreakpoint = container.height * this.scrollDownDistance + 1;
    } else {
      remaining = container.scrolledUntilNow;
      containerBreakpoint = container.height * this.scrollUpDistance + 1;
    }
    const shouldScroll: boolean = remaining <= containerBreakpoint;
    const triggerCallback: boolean = (this.alwaysCallback || shouldScroll) && this.scrollEnabled;
    const shouldClearInterval = !shouldScroll && this.checkInterval;
    // if (this.useDocumentBottom) {
    //   container.totalToScroll = this.height(this.$elementRef.nativeElement.ownerDocument);
    // }
    this.checkWhenEnabled = shouldScroll;

    if (triggerCallback) {
      if (scrollingDown) {
        this.infiniteScrollDownCallback({currentScrollPosition: container.scrolledUntilNow});
      } else {
        this.infiniteScrollUpCallback({currentScrollPosition: container.scrolledUntilNow});
      }
    }
    if (shouldClearInterval) {
      clearInterval(this.checkInterval);
    }
  }

  calculatePoints() {
    return this.isContainerWindow
      ? this.calculatePointsForWindow()
      : this.calculatePointsForElement();
  }

  calculatePointsForWindow () {
    // container's height
    const height = this.height(this.container);
    // scrolled until now / current y point
    const scrolledUntilNow = height + this.pageYOffset(this.documentElement);
    // total height / most bottom y point
    const totalToScroll = this.offsetTop(this.$elementRef.nativeElement) + this.height(this.$elementRef.nativeElement);
    return { height, scrolledUntilNow, totalToScroll };
  }

  calculatePointsForElement () {
    let scrollTop    = this.axis.scrollTopKey();
    let scrollHeight = this.axis.scrollHeightKey();

    const height = this.height(this.container);
    // perhaps use this.container.offsetTop instead of 'scrollTop'
    const scrolledUntilNow = this.container[scrollTop];
    let containerTopOffset = 0;
    const offsetTop = this.offsetTop(this.container);
    if (offsetTop !== void 0) {
      containerTopOffset = offsetTop;
    }
    const totalToScroll = this.container[scrollHeight];
    // const totalToScroll = this.offsetTop(this.$elementRef.nativeElement) - containerTopOffset + this.height(this.$elementRef.nativeElement);
    return { height, scrolledUntilNow, totalToScroll };
  }

  handleInfiniteScrollDistance (scrollDownDistance: number | any, scrollUpDistance: number | any) {
    this.scrollDownDistance = parseFloat(scrollDownDistance) || 0;
    this.scrollUpDistance = parseFloat(scrollUpDistance) || 0;
  }

  attachEvent (newContainer: Window | ElementRef | any) {
    this.clean();
    if (newContainer) {
      const throttle: number = this.infiniteScrollThrottle;
      this.disposeScroll = Observable.fromEvent(this.container, 'scroll')
        .throttle(ev => Observable.timer(throttle))
        .filter(ev => this.scrollEnabled)
        .subscribe(ev => this.handler())
    }
  }

  clean () {
    if (this.disposeScroll) {
      this.disposeScroll.unsubscribe();
    }
  }

  handleInfiniteScrollDisabled (scrollDisabled: boolean) {
    this.scrollEnabled = !scrollDisabled;
  }
}

@Directive({
  selector: '[infinite-scroll]'
})
export class InfiniteScroll implements OnDestroy, OnInit, OnChanges {
  public scroller: Scroller;

  @Input('infiniteScrollDistance') _distanceDown: number = 2;
  @Input('infiniteScrollUpDistance') _distanceUp: number = 1.5;
  @Input('infiniteScrollThrottle') _throttle: number = 300;
  @Input('infiniteScrollDisabled') _disabled: boolean = false;
  @Input('scrollWindow') scrollWindow: boolean = true;
  @Input('immediateCheck') _immediate: boolean = false;
  @Input('horizontal') _horizontal: boolean = false;
  @Input('alwaysCallback') _alwaysCallback: boolean = false;

  @Output() scrolled = new EventEmitter();
  @Output() scrolledUp = new EventEmitter();

  constructor(
    private element: ElementRef,
    private zone: NgZone,
    private axis: AxisResolver
  ) {}

  ngOnInit() {
    if (typeof window !== 'undefined') {
      const containerElement = this.scrollWindow ? window : this.element;
      this.scroller = new Scroller(containerElement, setInterval, this.element,
          this.onScrollDown.bind(this), this.onScrollUp.bind(this),
          this._distanceDown, this._distanceUp, {}, this._throttle,
          this._immediate, this._horizontal, this._alwaysCallback,
          this._disabled, this.axis);
    }
  }

  ngOnDestroy () {
    if (this.scroller) {
      this.scroller.clean();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes['_disabled'] && this.scroller){
      this.scroller.handleInfiniteScrollDisabled(changes['_disabled'].currentValue);
    }
  }

  onScrollDown(data = {}) {
    this.zone.run(() => this.scrolled.next(data));
  }

  onScrollUp(data = {}) {
    this.zone.run(() => this.scrolledUp.next(data));
  }
}

@NgModule({
  imports:      [  ],
  declarations: [ InfiniteScroll ],
  exports:      [ InfiniteScroll ],
  providers:    [ AxisResolver ]
})
export class InfiniteScrollModule { }
