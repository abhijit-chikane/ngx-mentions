import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  SimpleChanges,
  TemplateRef,
  ViewChild,
} from '@angular/core';

import { getCaretCoordinates } from './textarea-caret-position';
// @ts-ignore
// import toPX from 'to-px';

export interface ChoiceWithIndices {
  choice: any;
  indices: {
    start: number;
    end: number;
    triggerCharacter: string
  };
  cssClass?: string;
}

@Component({
  selector: 'ngx-text-input-autocomplete',
  templateUrl: './text-input-autocomplete.component.html',
  styleUrls: ['./text-input-autocomplete.component.scss'],
})
export class TextInputAutocompleteComponent implements OnChanges, OnInit, OnDestroy {
  @Input() mentionsConfig: {
    /**
    * The character that will trigger the menu to appear
    */
    triggerCharacter: string,
    /**
    * A function that formats the selected choice once selected.
    * The result (label) is also used as a choice identifier (e.g. when editing choices)
    */
    getChoiceLabel: (choice: any) => string
  }[];

  @ViewChild('dropdownMenu', { read: ElementRef }) dropdownMenu: ElementRef;

  /**
   * Reference to the text input element.
   */
  @Input() textInputElement: HTMLTextAreaElement | HTMLInputElement;

  /**
   * Reference to the menu template (used to display the search results).
   */
  @Input() menuTemplate: TemplateRef<any>;

  /**
   * The regular expression that will match the search text after the trigger character.
   * No match will hide the menu.
   */
  @Input() searchRegexp = /^\w*$/;

  /**
   * Whether to close the menu when the host textInputElement loses focus.
   */
  @Input() closeMenuOnBlur = false;

  /**
   * Whether to remove whole tag on backspace
   */
  @Input() removeWholeTagOnBackspace = false;

  /**
   * Pre-set choices for edit text mode, or to select/mark choices from outside the mentions component.
   */
  @Input() selectedChoices: any[] = [];

  /**
   * Called when the choices menu is shown.
   */
  @Output() menuShow = new EventEmitter();

  /**
   * Called when the choices menu is hidden.
   */
  @Output() menuHide = new EventEmitter();

  /**
   * Called when a choice is selected.
   */
  @Output() choiceSelected = new EventEmitter<ChoiceWithIndices>();

  /**
   * Called when a choice is removed.
   */
  @Output() choiceRemoved = new EventEmitter<ChoiceWithIndices>();

  /**
   * Called when a choice is selected, removed, or if any of the choices' indices change.
   */
  @Output() selectedChoicesChange = new EventEmitter<ChoiceWithIndices[]>();

  /**
   * Called on user input after entering trigger character. Emits search term to search by.
   */
  @Output() search = new EventEmitter<{ searchText: string; triggerCharacter: string }>();

  private _eventListeners: Array<() => void> = [];

  private _selectedCwis: ChoiceWithIndices[] = [];
  private _dumpedCwis: ChoiceWithIndices[] = [];
  private _editingCwi: ChoiceWithIndices;
  private _cursorPosition: number;
  private _cursorSelectionEnd: number;
  private _matchMention: { triggerCharacter: string; getChoiceLabel: (choice: any) => string; };

  menuCtrl?: {
    template: TemplateRef<any>;
    context: any;
    position: {
      top: number;
      left: number;
    };
    triggerCharacterPosition: number;
    lastCaretPosition?: number;
  };

  constructor(private ngZone: NgZone, private renderer: Renderer2, private changeDetectorRef: ChangeDetectorRef) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['selectedChoices']) {
      if (Array.isArray(this.selectedChoices)) {
        /**
         * Timeout needed since ngOnChanges is fired before the textInputElement value is updated.
         * The problem is specific to publisher.landing component implementation, i.e. single
         * textarea element is used for each account, only text changes..
         * Use ngZone.runOutsideAngular to optimize the timeout so it doesn't fire
         * global change detection events continuously..
         */
        // this.ngZone.runOutsideAngular(() => {
        setTimeout(() => {
          const selectedCwisPrevious = JSON.stringify(this._selectedCwis);

          this._selectedCwis = this.selectedChoices.map((c) => {
            return c;
          });
          this.updateIndices();

          // Remove choices that index couldn't be found for
          this._selectedCwis = this._selectedCwis.filter((cwi) => cwi.indices.start > -1);

          if (JSON.stringify(this._selectedCwis) !== selectedCwisPrevious) {
            // TODO: Should check for indices change only (ignoring the changes inside choice object)
            // this.ngZone.run(() => {
            this.selectedChoicesChange.emit(this._selectedCwis);
            // });
          }
        });
        // });
      }
    }
  }

  ngOnInit() {
    // virtual/mobile keyboards, formally known as IME does not support keydown and keyup events
    // so listen to beforeinput event instead
    const isMobileKeyboardUsed = window.navigator.maxTouchPoints > 0;

    if (isMobileKeyboardUsed) {
      const onBeforeInput = this.renderer.listen(this.textInputElement, 'beforeinput', (event) => this.onBeforeInput(event));
      this._eventListeners.push(onBeforeInput);
    }

    const onKeydown = this.renderer.listen(this.textInputElement, 'keydown', (event) => this.onKeydown(event));
    this._eventListeners.push(onKeydown);

    const onInput = this.renderer.listen(this.textInputElement, 'input', (event) => this.onInput(event));
    this._eventListeners.push(onInput);

    const onBlur = this.renderer.listen(this.textInputElement, 'blur', (event) => this.onBlur(event));
    this._eventListeners.push(onBlur);

    const onClick = this.renderer.listen(this.textInputElement, 'click', (event) => this.onClick(event));
    this._eventListeners.push(onClick);
  }

  ngOnDestroy() {
    this.hideMenu();
    this._eventListeners.forEach((unregister) => unregister());
  }

  onBeforeInput(event: any): void {
    const cursorPosition = this.textInputElement.selectionStart;
    const precedingChar = this.textInputElement.value.charAt(cursorPosition! - 1);
    const key = event.data;
    const matchMention = this.mentionsConfig.find(item => item.triggerCharacter === key);

    if (key === matchMention?.triggerCharacter && precedingCharValid(precedingChar)) {
      this._matchMention = matchMention;
      this.showMenu();
      return;
    }
    // TODO: remaining functionality of keydown event 
    // so that we can skip keydown event and will remove the isMobileKeyboardUsed check 
  }

  onKeydown(event: KeyboardEvent): void {
    this._cursorPosition = this.textInputElement.selectionStart!;
    this._cursorSelectionEnd = this.textInputElement.selectionEnd!;
    const precedingChar = this.textInputElement.value.charAt(this._cursorPosition - 1);
    const key = event.key;
    const matchMention = this.mentionsConfig.find(item => item.triggerCharacter === key);

    if (!event.shiftKey) {
      this.moveCursorToTagBoundaryIfWithinTag(key, this._cursorPosition);
    }

    if (key === matchMention?.triggerCharacter && precedingCharValid(precedingChar)) {
      this._matchMention = matchMention;
      this.showMenu();
      return;
    }

    if (key === 'Backspace' || key === 'Delete') {
      if (this._cursorPosition !== this._cursorSelectionEnd) {
        // remove selected text and choices
        this._selectedCwis.forEach((cwi) => {
          if (this.isCwiWithinSelection(cwi.indices)) {
            this.removeFromSelected(cwi);
          }
        });
        this.selectedChoicesChange.emit(this._selectedCwis);
      } else {
        // backspace or delete
        const cwiToEdit = this._selectedCwis.find((cwi) => {
          return (
            cwi.indices.start <= this._cursorPosition && cwi.indices.end >= this._cursorPosition
          );
        });

        if (cwiToEdit) {
          this.editChoice(cwiToEdit);
        }
      }
    }
  }

  onInput(event: any): void {
    const value = event.target.value;
    const selectedCwisPrevious = JSON.stringify(this._selectedCwis);

    if (!this.menuCtrl) {
      // dump choices that are removed from the text (e.g. select all + paste),
      // and/or retrieve them if user e.g. UNDO the action
      // BUG: if text that contains mentions is selected and deleted using trigger char, no choices will be dumped (this.menuCtrl will be defined)!
      this.dumpNonExistingChoices();
      this.retrieveExistingChoices();
      this.updateIndices();
      if (JSON.stringify(this._selectedCwis) !== selectedCwisPrevious) {
        // TODO: Should probably check for indices change only (ignoring the changes inside choice object)
        this.selectedChoicesChange.emit(this._selectedCwis);
      }
      return;
    }

    this.updateIndices();
    if (JSON.stringify(this._selectedCwis) !== selectedCwisPrevious) {
      this.selectedChoicesChange.emit(this._selectedCwis);
    }

    if (value[this.menuCtrl.triggerCharacterPosition] !== this._matchMention?.triggerCharacter) {
      this.hideMenu();
      return;
    }

    const cursorPosition = this.textInputElement.selectionStart;
    if (cursorPosition! < this.menuCtrl.triggerCharacterPosition) {
      this.hideMenu();
      return;
    }

    const searchText = value.slice(this.menuCtrl.triggerCharacterPosition + 1, cursorPosition);
    if (!searchText.match(this.searchRegexp)) {
      this.hideMenu();
      return;
    }

    this.search.emit({ searchText, triggerCharacter: this._matchMention.triggerCharacter });
  }

  onBlur(event: FocusEvent): void {
    if (!this.menuCtrl) {
      return;
    }

    this.menuCtrl.lastCaretPosition = this.textInputElement.selectionStart!;

    if (this.closeMenuOnBlur) {
      setTimeout(() => this.hideMenu(), 250);
    }
  }

  onClick(event: MouseEvent): void {
    if (!this.menuCtrl) {
      return;
    }

    const cursorPosition = this.textInputElement.selectionStart;
    if (cursorPosition! <= this.menuCtrl.triggerCharacterPosition) {
      this.hideMenu();
      return;
    }

    const searchText = this.textInputElement.value.slice(this.menuCtrl.triggerCharacterPosition + 1, cursorPosition!);
    if (!searchText.match(this.searchRegexp)) {
      this.hideMenu();
      return;
    }
  }

  private hideMenu() {
    if (!this.menuCtrl) {
      return;
    }

    this.menuCtrl = undefined;
    this.menuHide.emit();

    if (this._editingCwi) {
      // If user didn't make any changes to it, add it back to the selected choices
      const label = this.getChoiceLabel(this._editingCwi.indices.triggerCharacter, this._editingCwi.choice);
      const labelExists = this.getChoiceIndex(label + ' ') > -1;
      const choiceExists = this._selectedCwis.find((cwi) => this.getChoiceLabel(cwi.indices.triggerCharacter, cwi.choice) === label);
      if (labelExists && !choiceExists) {
        this.addToSelected(this._editingCwi);
        this.updateIndices();
        this.selectedChoicesChange.emit(this._selectedCwis);
      }
    }
    this._editingCwi = undefined!;
  }

  private showMenu() {
    if (this.menuCtrl) {
      return;
    }

    const lineHeight = this.getLineHeight(this.textInputElement);
    let { top, left } = getCaretCoordinates(this.textInputElement, this.textInputElement.selectionStart);

    // to position the list correctly
    top = Math.min(top, this.textInputElement.clientHeight - 20);
    this.menuCtrl = {
      template: this.menuTemplate,
      context: {
        selectChoice: this.selectChoice,
        // $implicit: {
        //   selectChoice: this.selectChoice
        // },
      },
      position: {
        top: top + lineHeight,
        left,
      },
      triggerCharacterPosition: this.textInputElement.selectionStart!,
    };

    this.menuShow.emit();

    setTimeout(() => {
      if (this.dropdownMenu && this.dropdownMenu.nativeElement) {
        const bounds: DOMRect = this.dropdownMenu.nativeElement.getBoundingClientRect();
        // if off right of page, align right
        if (bounds.left + bounds.width + 25 > window.innerWidth) {
          left -= bounds.left + bounds.width - window.innerWidth + 20;
          this.menuCtrl.position.left = left;
          this.changeDetectorRef.detectChanges();
        }
      }
    }, 0);
  }

  private isCwiWithinSelection({ start, end }: { start: number; end: number }): boolean {
    return (
      (start >= this._cursorPosition && start <= this._cursorSelectionEnd) ||
      (end >= this._cursorPosition && end <= this._cursorSelectionEnd)
    );
  }

  selectChoice = (choice: any) => {
    const label = this._matchMention?.getChoiceLabel(choice);
    const startIndex = this.menuCtrl!.triggerCharacterPosition;
    const start = this.textInputElement.value.slice(0, startIndex);
    const caretPosition = this.menuCtrl!.lastCaretPosition || this.textInputElement.selectionStart;
    const end = this.textInputElement.value.slice(caretPosition!);
    const insertValue = label + ' ';
    this.textInputElement.value = start + insertValue + end;
    // force ng model / form control to update
    this.textInputElement.dispatchEvent(new Event('input'));

    const setCursorAt = (start + insertValue).length;
    this.textInputElement.setSelectionRange(setCursorAt, setCursorAt);
    this.textInputElement.focus();

    const choiceWithIndices = {
      choice,
      indices: {
        start: startIndex,
        end: startIndex + label.length,
        triggerCharacter: this._matchMention.triggerCharacter
      },
    };

    this.addToSelected(choiceWithIndices);
    this.updateIndices();
    this.selectedChoicesChange.emit(this._selectedCwis);

    this.hideMenu();
  };

  editChoice(choiceWithIndices: ChoiceWithIndices): void {
    const label = this.getChoiceLabel(choiceWithIndices.indices.triggerCharacter, choiceWithIndices.choice);
    const occurence = this.getOccurrenceBasedOnCursorPos();
    const startIndex = this.getChoiceIndex(label, occurence);
    const endIndex = startIndex + label.length;

    this._editingCwi = this._selectedCwis.find((cwi) =>
      this.getChoiceLabel(cwi.indices.triggerCharacter, cwi.choice) === label
      && cwi.indices.start <= this._cursorPosition && cwi.indices.end >= this._cursorPosition
    )!;

    if (this._editingCwi) {
      this.removeFromSelected(this._editingCwi);
      this.selectedChoicesChange.emit(this._selectedCwis);
    }

    this.textInputElement.focus();

    if (this.removeWholeTagOnBackspace) {
      this.textInputElement.setSelectionRange(startIndex, endIndex);
      return;
    }

    this.textInputElement.setSelectionRange(endIndex, endIndex);

    this.showMenu();
    this.menuCtrl!.triggerCharacterPosition = startIndex;

    // TODO: editValue to be provided externally?
    const editValue = label.replace(this._matchMention?.triggerCharacter, '');
    this.search.emit({ searchText: editValue, triggerCharacter: this._matchMention?.triggerCharacter });
  }

  moveCursorToTagBoundaryIfWithinTag(key: string, cursorPosition: number) {
    const choiceExists = this._selectedCwis.find((cwi) => {
      return cwi.indices.start < cursorPosition! + 1 && cwi.indices.end > cursorPosition! - 1;
    });

    if (choiceExists) {
      // put the cursor at the start or end of the tag while moving cursor
      if ((key === 'ArrowLeft' && choiceExists.indices.end === cursorPosition) ||
        (key === 'ArrowRight' && choiceExists.indices.start === cursorPosition)) {
        this.textInputElement.setSelectionRange(choiceExists.indices.start, choiceExists.indices.end);
      }
    }
  }

  dumpNonExistingChoices(): void {
    const choicesToDump = this._selectedCwis.filter((cwi) => {
      const label = this.getChoiceLabel(cwi.indices.triggerCharacter, cwi.choice);
      return this.getChoiceIndex(label) === -1;
    });

    if (choicesToDump.length) {
      choicesToDump.forEach((cwi) => {
        this.removeFromSelected(cwi);
        this._dumpedCwis.push(cwi);
      });
    }
  }

  retrieveExistingChoices(): void {
    const choicesToRetrieve = this._dumpedCwis.filter((dcwi) => {
      const label = this.getChoiceLabel(dcwi.indices.triggerCharacter, dcwi.choice);
      const labelExists = this.getChoiceIndex(label) > -1;
      const choiceExists = this._selectedCwis.find((scwi) => this.getChoiceLabel(scwi.indices.triggerCharacter, scwi.choice) === label);
      return labelExists && !choiceExists;
    });

    if (choicesToRetrieve.length) {
      choicesToRetrieve.forEach((c) => {
        this.addToSelected(c);
        this._dumpedCwis.splice(this._dumpedCwis.indexOf(c), 1);
      });
    }
  }

  addToSelected(cwi: ChoiceWithIndices): void {
    this._selectedCwis.push(cwi);
    this.choiceSelected.emit(cwi);
  }

  removeFromSelected(cwi: ChoiceWithIndices): void {
    const exists = this._selectedCwis.some(
      (scwi) => this.getChoiceLabel(scwi.indices.triggerCharacter, scwi.choice) === this.getChoiceLabel(cwi.indices.triggerCharacter, cwi.choice)
    );

    if (exists) {
      this._selectedCwis.splice(this._selectedCwis.indexOf(cwi), 1);
      this.choiceRemoved.emit(cwi);
    }
  }

  getLineHeight(elm: HTMLElement): number {
    const lineHeightStr = getComputedStyle(elm).lineHeight || '';
    const lineHeight = parseFloat(lineHeightStr);
    const normalLineHeight = 1.2;

    const fontSizeStr = getComputedStyle(elm).fontSize || '';
    // const fontSize = +toPX(fontSizeStr);
    const fontSize = parseFloat(fontSizeStr);

    if (lineHeightStr === lineHeight + '') {
      return fontSize * lineHeight;
    }

    if (lineHeightStr.toLowerCase() === 'normal') {
      return fontSize * normalLineHeight;
    }

    // return toPX(lineHeightStr);
    return parseFloat(lineHeightStr);
  }

  getChoiceIndex(label: string, occurence?: number): number {
    const text = this.textInputElement && this.textInputElement.value;
    const labels = this._selectedCwis.map((cwi) => this.getChoiceLabel(cwi.indices.triggerCharacter, cwi.choice));

    return getChoiceIndex(text, label, labels, occurence);
  }

  updateIndices(): void {
    const occOfUniqueLabels: Record<string, number> = {};
    this._selectedCwis = this._selectedCwis.map((cwi) => {
      const label = this.getChoiceLabel(cwi.indices.triggerCharacter, cwi.choice);
      if (!occOfUniqueLabels[label]) {
        occOfUniqueLabels[label] = 1;
      } else {
        occOfUniqueLabels[label]++;
      }
      const index = this.getChoiceIndex(label, occOfUniqueLabels[label]);
      return {
        choice: cwi.choice,
        indices: {
          start: index,
          end: index + label.length,
          triggerCharacter: cwi.indices.triggerCharacter
        },
      };
    });
  }

  getChoiceLabel(triggerCharacter: string, choice: any): string {
    if (this.mentionsConfig.length === 1) {
      return this.mentionsConfig[0].getChoiceLabel(choice);
    }
    return this.mentionsConfig.find(item => item.triggerCharacter === triggerCharacter).getChoiceLabel(choice);
  }

  getOccurrenceBasedOnCursorPos(): number {
    // Sort the choices array in descending order of start index
    let choices = this._selectedCwis.slice().sort((a, b) => b.indices.start - a.indices.start);
    // Iterate over the sorted choices array
    for (let i = 0; i < choices.length; i++) {
      const choice = choices[i];
      // Check if the start index of the current choice is less than or equal to the cursor position
      if (choice.indices.start <= this._cursorPosition) {
        let occurrenceCount = 1;
        // Iterate over the remaining choices in the array and count occurrences of the current choice
        for (let j = i + 1; j < choices.length; j++) {
          if (this.getChoiceLabel(choices[j].indices.triggerCharacter, choices[j].choice) === this.getChoiceLabel(choice.indices.triggerCharacter, choice.choice)) {
            occurrenceCount++;
          }
        }
        // Return the occurrence count
        return occurrenceCount;
      }
    }
    // If no match is found, return 0
    return 0;
  }
}

export function getChoiceIndex(text: string, label: string, labels: string[], occurence?: number): number {
  text = text || '';

  labels.forEach((l) => {
    // Mask other labels that contain given label,
    // e.g. if the given label is '@TED', mask '@TEDEducation' label
    if (l !== label && l.indexOf(label) > -1) {
      text = text.replace(new RegExp(l, 'g'), '*'.repeat(l.length));
    }
  });

  return findStringIndex(text, label, (startIndex, endIndex) => {
    // Only labels that are preceded with below defined chars are valid,
    // (avoid 'labels' found in e.g. links being mistaken for choices)
    const precedingChar = text[startIndex - 1];
    return precedingCharValid(precedingChar) || text.slice(startIndex - 4, startIndex) === '<br>';
  }, occurence);
}

export function precedingCharValid(char: string): boolean {
  return !char || char === '\n' || char === ' ' || char === '(';
}

// TODO: move to common!
export function findStringIndex(
  text: string,
  value: string,
  callback: (startIndex: number, endIndex: number) => boolean,
  occurence?: number
): number {
  let index = -1;
  if (occurence) {
    for (let i = 0; i < occurence; i++) {
      index = text.indexOf(value, index + 1);
      if (index === -1) break;
    }
  } else {
    index = text.indexOf(value);
  }
  if (index === -1) {
    return -1;
  }

  let conditionMet = callback(index, index + value.length);

  while (!conditionMet && index > -1) {
    index = text.indexOf(value, index + 1);
    conditionMet = callback(index, index + value.length);
  }

  return index;
}