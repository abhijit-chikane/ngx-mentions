import { Directive, ElementRef, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';

import { LoaderService } from './loader.service';

@Directive({
  selector: '[ngxLoader]',
})
export class LoaderDirective implements OnInit, OnChanges {
  /**
   * A flag indicating whether a loader should be displayed.
   */
  @Input() ngxLoader = false;

  private _loaderElem: HTMLElement;
  private _visible = false;

  constructor(protected elementRef: ElementRef, protected loaderService: LoaderService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this._loaderElem) {
      // This is also needed here as the change might happen before ngOnInit is fired
      this._loaderElem = this.loaderService.appendLoader(this.elementRef.nativeElement);
    }

    if (changes['ngxLoader']) {
      const visible = changes['ngxLoader'].currentValue;
      if (visible) {
        this.show();
      } else {
        this.hide();
      }
    }
  }

  ngOnInit(): void {
    if (!this._loaderElem) {
      this._loaderElem = this.loaderService.appendLoader(this.elementRef.nativeElement);
    }
  }

  show(): void {
    if (this._loaderElem) {
      this._loaderElem.style['display'] = 'flex';
      this._visible = true;
    }
  }

  hide(): void {
    if (this._loaderElem) {
      this._loaderElem.style['display'] = 'none';
      this._visible = false;
    }
  }

  isVisible() {
    return this._visible;
  }
}
