import { NgModule, Component, Input, Injectable, NgZone, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Rx';

import 'rxjs/add/operator/debounceTime';
import 'rxjs/add/operator/throttleTime';
import 'rxjs/add/observable/fromEvent';

import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

export class Option {
    constructor(
        public displayVal: string, 
        public selectVal: string
        ){}
}

@Injectable()
export class TypeAheadService {
	constructor (private http: Http) {};
	getData(url) : Observable<Option[]> {
		return this.http.get(url)
			.map((res:Response) => res.json())
			.catch((error:any) => Observable.throw(error.json().error || 'Server error'));

	}
}

@Component({
	selector: 'ng-typeahead',
	templateUrl: './ng-typeahead.html',
	styleUrls: ['./ng-typeahead.css'],
	providers: [
		TypeAheadService
	]
})

export class NgTypeAhead {
	@Input('httpUrl') givenUrl: string;
	@Input('displayValProp') displayProp: string;
	@Input('selectValProp') selectProp: string;
	@Input('searchKey') searchVal: string;
	defaultOptions = [];
	options = [];
	selectedOptions = [];
	typeaheadInputVal = '';
	typeaheadInFocus = false;
	@ViewChild('typeaheadInput') typeaheadInputElem;
	@ViewChild('typeaheadHide') typeaheadHideElem;
	@ViewChild('typeaheadContainer') typeaheadContainerElem;

  	searchFilterControl = new FormControl();


	constructor(
		private typeAheadService: TypeAheadService
	){
		document.addEventListener('click', this.offClickHandler.bind(this));
		document.addEventListener('focus', ()=> { console.log(2)});
	};

	offClickHandler(event:any) {
        if (!this.typeaheadContainerElem.nativeElement.contains(event.target)) { // check click origin
            this.focusOut();
        }
    }

	ngOnInit() {
		this.searchFilterControl.valueChanges
			.debounceTime(500)
			.subscribe(newValue => this.searchOptions(newValue));
	}

	loadData(url) {
		this.typeAheadService.getData(url)
			.subscribe(
				options => {
					this.loadValues(options)
				},
				err => {
					console.log(err);
				});
	}

	loadValues(options) {
		this.defaultOptions = options;
		this.options = [];
		for(let option of options) {
			option.isValselected = this.selectedOptions.some(selOption => selOption[this.selectProp] === option[this.selectProp]);
			this.options.push(option);
		}
	}

	searchOptions(val) {
		let url = `${this.givenUrl}?${this.searchVal}=${val}`;
		this.loadData(url);
	}

	focus() {
		this.typeaheadInputElem.nativeElement.focus();
		this.typeaheadInFocus = true;
		if(!this.typeaheadInputVal){
			this.loadData(this.givenUrl);
		}
	}

	focusOut() {
		this.typeaheadInputVal = '';
		this.typeaheadInFocus = false;
	}

	selectOption(option) {
		if(option.isValselected){
			return ;
		}
		option.isValselected = true;
		this.selectedOptions.push(option);
		
	}

	removeSelected(selectedOption) {
		for(let option of this.options) {
			if(option[this.selectProp] === selectedOption[this.selectProp]){
				option.isValselected = false;
			}
		}
		this.selectedOptions.splice(this.selectedOptions.findIndex(option => option[this.selectProp] === selectedOption[this.selectProp]), 1);
	}
}


@NgModule({
    imports: [CommonModule, FormsModule, ReactiveFormsModule],
    exports: [NgTypeAhead],
    declarations: [NgTypeAhead],
})
export class NgTypeAheadModule { }