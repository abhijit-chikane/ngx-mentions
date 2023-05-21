import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'ngx-text-input-autocomplete-menu',
  templateUrl: './text-input-autocomplete-menu.html',
  styleUrls: ['./text-input-autocomplete-menu.scss']
})
export class TextInputAutocompleteMenuComponent {
  @Input() choices: any[];
  @Input() getDisplayLabel: (choice: any) => string;
  @Output() selectChoice = new EventEmitter<any>();

  position: { top: number; left: number } | undefined;
  activeChoice: any;
  // choiceLoadError: any;
  // choiceLoading = false;

  constructor() { }

  trackById = (index: number, choice: any) => (typeof choice.id !== 'undefined' ? choice.id : choice);
}
