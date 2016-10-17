import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule, JsonpModule } from '@angular/http';
import { InfiniteScrollModule } from './infinite-scroll/infinite-scroll';
import { MultiselectDropdownModule } from './typeahead/typeahead';
import { NgTypeAheadModule } from './typeahead/ng-typeahead';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    JsonpModule,
    InfiniteScrollModule,
    MultiselectDropdownModule,
    NgTypeAheadModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
