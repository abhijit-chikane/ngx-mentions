import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'ngx-text-input-autocomplete-menu',
  templateUrl: './text-input-autocomplete-menu.html',
  styleUrls: ['./text-input-autocomplete-menu.scss']
})
export class TextInputAutocompleteMenuComponent {
  /**
   * Pre-set choices to show in dropdown.
   */
  @Input() choices: any[];
  /**
   * A flag indicating whether a loader should be displayed.
   */
  @Input() ngxLoader: boolean;
  /**
   * A function that returns the display label for a given choice to display in the dropdown.
   */
  @Input() getDisplayLabel: (choice: any) => string;
  /**
   * A function that returns additional information for the display label of a choice to show below the display label as additional text in dropdown.
   */
  @Input() getDisplayLabelAdditionalInfo: (choice: any) => string;
  /**
   * Event emitted when a choice is selected.
   */
  @Output() selectChoice = new EventEmitter<any>();
}
