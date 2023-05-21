import { Directive, HostListener, Input, ElementRef, Renderer2, EventEmitter, Output } from '@angular/core';

@Directive({
  selector: '[ngxKbListNavigation]'
})
export class KbListNavigationDirective {
  @Input() set choices(choices: any[]) {
    this._choices = choices;
    if (choices.indexOf(this.activeChoice) === -1 && choices.length > 0) {
      this.activeChoice = choices[0];
      this.applyActiveClass(0);
    }
  }
  @Output() selectChoice: EventEmitter<any> = new EventEmitter<any>();

  _choices: any[];
  activeChoice: any;
  constructor(private elementRef: ElementRef, private renderer: Renderer2) { }

  get choices() {
    return this._choices;
  }

  @HostListener('document:keydown.ArrowDown', ['$event'])
  onArrowDown(event: KeyboardEvent) {
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
    const dropdownMenu = this.elementRef.nativeElement;
    const ulPosition = dropdownMenu.getBoundingClientRect();
    const li = dropdownMenu.children[index];
    const liPosition = li.getBoundingClientRect();
    this.applyActiveClass(index);

    if (liPosition.top < ulPosition.top || liPosition.bottom > ulPosition.bottom) {
      li.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }

  applyActiveClass(index: number) {
    setTimeout(() => {
      const dropdownMenu = this.elementRef.nativeElement;
      const li = dropdownMenu.children[index];
      Array.from(dropdownMenu.children).forEach((li: Element) => {
        this.renderer.removeClass(li, 'active');
      });
      this.renderer.addClass(li, 'active')
    }, 0);
  }
}
