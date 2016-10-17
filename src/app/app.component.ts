import { Component } from '@angular/core';
import { IMultiSelectOption } from './typeahead/typeahead';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  	title = 'app works!';
  	httpUrl = './test.json';
  	searchKey = 'city';
  	selectValProp = 'id';
  	displayValProp = 'city';
  	sampleData= ['TEST','TEST','TEST','TEST','TEST','TEST','TEST','TEST','TEST','TEST','TEST','TEST','TEST','TEST','TEST','TEST','TEST','TEST','TEST','TEST','TEST','TEST','TEST','TEST','TEST','TEST','TEST','TEST','TEST','TEST','TEST','TEST','TEST','TEST','TEST','TEST','TEST','TEST','TEST','TEST','TEST','TEST','TEST','TEST','TEST','TEST','TEST','TEST','TEST','TEST','TEST','TEST','TEST','TEST','TEST','TEST','TEST','TEST','TEST','TEST','TEST','TEST','TEST','TEST','TEST','TEST','TEST','TEST']
	onScroll () {
		setTimeout(() => {
			for (var i = 100; i >= 0; i--) {
				this.sampleData.push('Test'+i);
			}
		}, 2000)
	};
	myOptions: IMultiSelectOption[] = [
        { id: 1, name: 'Option 1' },
        { id: 2, name: 'Option 2' },
    ];
    onChange(event){
    	console.log(event)
    }
}
