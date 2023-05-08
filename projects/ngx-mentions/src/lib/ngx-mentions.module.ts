import { NgModule } from '@angular/core';
import { NgxMentionsComponent } from './ngx-mentions.component';
import { TextInputAutocompleteModule } from './text-input-autocomplete';
import { TextInputHighlightModule } from './text-input-highlight';

@NgModule({
  declarations: [
    NgxMentionsComponent
  ],
  imports: [
    TextInputAutocompleteModule, 
    TextInputHighlightModule
  ],
  exports: [
    NgxMentionsComponent, 
    TextInputAutocompleteModule,
    TextInputHighlightModule
  ],
})
export class NgxMentionsModule { }
