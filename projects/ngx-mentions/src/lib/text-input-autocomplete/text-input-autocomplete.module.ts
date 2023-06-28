import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TextInputAutocompleteComponent } from './text-input-autocomplete.component';
import { TextInputAutocompleteMenuComponent } from './text-input-autocomplete-menu/text-input-autocomplete-menu.component';
import { KbListNavigationDirective } from './kb-list-navigation.directive';
import { LoaderDirective } from './loader.directive';

@NgModule({
  declarations: [
    TextInputAutocompleteComponent,
    TextInputAutocompleteMenuComponent,
    KbListNavigationDirective,
    LoaderDirective
  ],
  imports: [CommonModule],
  exports: [
    TextInputAutocompleteComponent,
    TextInputAutocompleteMenuComponent,
    KbListNavigationDirective,
    LoaderDirective,
  ],
})
export class TextInputAutocompleteModule { }
