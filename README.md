Infinite scroll and IntelliSense!
===================


To use infinite scroll in angular 2. please add below mentioned file to ur source or somewhere into ur project.

**./src/app/infinite-scroll/infinite-scroll.ts**

in ur main module add like below

**import { InfiniteScrollModule } from './infinite-scroll/infinite-scroll';**

Where ever u want to access add into elemement like below,

```
<div class="search-results"
	infinite-scroll
	[infiniteScrollDistance]="5"
	[infiniteScrollThrottle]="500"
    (scrolled)="onScroll()"
    [scrollWindow]="false">
    <h1 *ngFor="let data of sampleData">{{data}}</h1>
</div>
```

```
 infinite-scroll // directive name
 infiniteScrollDistance // scroll limit to load further data
 infiniteScrollThrottle // debounce time
 scrolled // callback function to make any changes
 scrollWindow // if true it will be depends on viewport or it will be depends on element size.
```
 > **Note:**

> - apply "overflow: true" style into that particular element if you use "scrollWindow: false"
 