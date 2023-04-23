import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';

@Component({
  selector: 'flx-text-input-autocomplete-menu',
  templateUrl: './text-input-autocomplete-menu.html',
  styleUrls: ['./text-input-autocomplete-menu.scss']
})
export class TextInputAutocompleteMenuComponent {
  @ViewChild('dropdownMenu') dropdownMenuElement: ElementRef<HTMLUListElement>;

  @Input() set choices(choices: any[]) {
    this._choices = choices;
    if (choices.indexOf(this.activeChoice) === -1 && choices.length > 0) {
      this.activeChoice = choices[0];
    }
  }
  @Input() displayLabel: (choice: any) => string;

  @Output() selectChoice = new EventEmitter<any>();

  position: { top: number; left: number };
  activeChoice: any;
  searchText: string;
  choiceLoadError: any;
  choiceLoading = false;
  private _choices: any[];

  constructor(public elementRef: ElementRef) { }

  trackById = (index: number, choice: any) => (typeof choice.id !== 'undefined' ? choice.id : choice);

  get choices() {
    return this._choices;
  }

  @HostListener('document:keydown.ArrowDown', ['$event'])
  onArrowDown(event: KeyboardEvent) {
    console.log('event', event)
    event.preventDefault();
    const index = this.choices.indexOf(this.activeChoice);
    if (this.choices[index + 1]) {
      this.scrollToChoice(index + 1);
    }
  }

  @HostListener('document:keydown.ArrowUp', ['$event'])
  onArrowUp(event: KeyboardEvent) {
    event.preventDefault();
    const index = this.choices.indexOf(this.activeChoice);
    if (this.choices[index - 1]) {
      this.scrollToChoice(index - 1);
    }
  }

  @HostListener('document:keydown.Enter', ['$event'])
  onEnter(event: KeyboardEvent) {
    if (this.choices.indexOf(this.activeChoice) > -1) {
      event.preventDefault();
      this.selectChoice.emit(this.activeChoice);
    }
  }

  private scrollToChoice(index: number) {
    this.activeChoice = this._choices[index];

    if (this.dropdownMenuElement) {
      const ulPosition = this.dropdownMenuElement.nativeElement.getBoundingClientRect();
      const li = this.dropdownMenuElement.nativeElement.children[index];
      const liPosition = li.getBoundingClientRect();

      if (liPosition.top < ulPosition.top || liPosition.bottom > ulPosition.bottom) {
        li.scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
        });
      }
    }
  }
}
