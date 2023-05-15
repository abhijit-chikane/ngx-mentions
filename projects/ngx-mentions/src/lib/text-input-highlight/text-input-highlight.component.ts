import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  Renderer2,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';

import { HighlightTag } from './highlight-tag.interface';

const styleProperties = Object.freeze([
  'direction', // RTL support
  'boxSizing',
  'width', // on Chrome and IE, exclude the scrollbar, so the mirror div wraps exactly as the textarea does
  'height',
  'overflowX',
  'overflowY', // copy the scrollbar for IE

  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'borderStyle',

  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',

  // https://developer.mozilla.org/en-US/docs/Web/CSS/font
  'fontStyle',
  'fontVariant',
  'fontWeight',
  'fontStretch',
  'fontSize',
  'fontSizeAdjust',
  'lineHeight',
  'fontFamily',

  'textAlign',
  'textTransform',
  'textIndent',
  'textDecoration', // might not make a difference, but better be safe

  'letterSpacing',
  'wordSpacing',

  'tabSize',
  'MozTabSize',
]);

const tagIndexIdPrefix = 'ngx-text-highlight-tag-id-';

function indexIsInsideTag(index: number, tag: HighlightTag) {
  return tag.indices.start < index && index < tag.indices.end;
}

function overlaps(tagA: HighlightTag, tagB: HighlightTag) {
  return indexIsInsideTag(tagB.indices.start, tagA) || indexIsInsideTag(tagB.indices.end, tagA);
}

function isCoordinateWithinRect(rect: ClientRect, x: number, y: number) {
  return rect.left < x && x < rect.right && rect.top < y && y < rect.bottom;
}

function escapeHtml(str: string): string {
  return str.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export interface TagMouseEvent {
  tag: HighlightTag;
  target: HTMLElement;
  event: MouseEvent;
}

@Component({
  selector: 'ngx-text-input-highlight',
  templateUrl: './text-input-highlight.component.html',
  styleUrls: ['./text-input-highlight.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TextInputHighlightComponent implements OnInit, OnChanges, OnDestroy {
  /**
   * An array of indices of the textarea value to highlight.
   */
  @Input() tags: HighlightTag[] = [];

  /**
   * The textarea to highlight.
   */
  @Input() textInputElement: HTMLTextAreaElement | HTMLInputElement;

  /**
   * The textarea value, in not provided will fall back to trying to grab it automatically from the textarea.
   */
  @Input() textInputValue: string;

  /**
   * The CSS class to add to highlighted tags.
   */
  @Input() tagCssClass = '';

  /**
   * Called when the area over a tag is clicked.
   */
  @Output() tagClick = new EventEmitter<TagMouseEvent>();

  /**
   * Called when the area over a tag is moused over.
   */
  @Output() tagMouseEnter = new EventEmitter<TagMouseEvent>();

  /**
   * Called when the area over the tag has the mouse removed from it.
   */
  @Output() tagMouseLeave = new EventEmitter<TagMouseEvent>();

  @ViewChild('highlightElement', { static: true }) private highlightElement: ElementRef;

  highlightElementContainerStyle: { [key: string]: string } = {};
  highlightedText: string;

  private textareaEventListeners: Array<() => void> = [];
  private highlightTagElements: Array<{
    element: HTMLElement;
    clientRect: DOMRect;
  }>;
  private hoveredTag: TagMouseEvent | undefined;
  private isDestroyed = false;

  constructor(private renderer: Renderer2, private ngZone: NgZone, private cdr: ChangeDetectorRef) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['textInputElement']) {
      this.textInputElementChanged();
    }

    if (changes['tags'] || changes['tagCssClass'] || changes['textInputValue']) {
      this.addTags();
    }
  }

  ngOnInit(): void {
    // TODO: ngxRelativeContainer directive (wrapping component) instead?
    this.textInputElement.parentElement!.style['position'] = 'relative';
    if (getComputedStyle(this.textInputElement.parentElement!).display === 'inline') {
      // If textarea is direct child of a component (no DIV container)
      this.textInputElement.parentElement!.style['display'] = 'block';
    }

    this.textInputElement.style['background'] = 'none';
    this.textInputElement.style['position'] = 'relative';
    // @ts-ignore
    this.textInputElement.style['z-index'] = '2';
  }

  ngOnDestroy(): void {
    this.isDestroyed = true;
    this.textareaEventListeners.forEach((unregister) => unregister());
  }

  @HostListener('window:resize')
  onWindowResize() {
    this.refresh();
  }

  /**
   * Manually call this function to refresh the highlight element if the textarea styles have changed
   */
  refresh() {
    const computed: any = getComputedStyle(this.textInputElement);
    styleProperties.forEach((prop) => {
      this.highlightElementContainerStyle[prop] = computed[prop];
    });
  }

  private textInputElementChanged() {
    const elementType = this.textInputElement.tagName.toLowerCase();
    if (elementType !== 'textarea') {
      throw new Error(
        'The text-input-highlight component must be passed ' +
        'a textarea to the `textInputElement` input. Instead received a ' +
        elementType
      );
    }

    setTimeout(() => {
      // in case the element was destroyed before the timeout fires
      if (this.isDestroyed) {
        return;
      }

      this.refresh();

      this.textareaEventListeners.forEach((unregister) => unregister());
      this.textareaEventListeners = [];

      const onInput = this.renderer.listen(this.textInputElement, 'input', () => {
        this.addTags();
      });
      this.textareaEventListeners.push(onInput);

      const onScroll = this.renderer.listen(this.textInputElement, 'scroll', () => {
        this.highlightElement.nativeElement.scrollTop = this.textInputElement.scrollTop;
        this.highlightTagElements = this.highlightTagElements.map((tag) => {
          tag.clientRect = tag.element.getBoundingClientRect();
          return tag;
        });
      });
      this.textareaEventListeners.push(onScroll);

      const onMouseUp = this.renderer.listen(this.textInputElement, 'mouseup', () => {
        this.refresh();
      });
      this.textareaEventListeners.push(onMouseUp);

      // only add event listeners if the host component actually asks for it
      if (this.tagClick.observers.length > 0) {
        const onClick = this.renderer.listen(this.textInputElement, 'click', (event) => {
          this.handleTextareaMouseEvent(event, 'click');
        });
        this.textareaEventListeners.push(onClick);
      }

      // only add event listeners if the host component actually asks for it
      if (this.tagMouseEnter.observers.length > 0) {
        const onMouseMove = this.renderer.listen(this.textInputElement, 'mousemove', (event) => {
          this.handleTextareaMouseEvent(event, 'mousemove');
        });
        this.textareaEventListeners.push(onMouseMove);

        const onMouseLeave = this.renderer.listen(this.textInputElement, 'mouseleave', (event) => {
          if (this.hoveredTag) {
            this.onMouseLeave(this.hoveredTag, event);
          }
        });
        this.textareaEventListeners.push(onMouseLeave);
      }

      this.addTags();
    });
  }

  private addTags() {
    const textInputValue =
      typeof this.textInputValue !== 'undefined' ? this.textInputValue : this.textInputElement.value;

    const prevTags: HighlightTag[] = [];
    const parts: string[] = [];

    [...this.tags]
      .sort((tagA, tagB) => {
        return tagA.indices.start - tagB.indices.start;
      })
      .forEach((tag) => {
        if (tag.indices.start > tag.indices.end) {
          throw new Error(
            `Highlight tag with indices [${tag.indices.start}, ${tag.indices.end}] cannot start after it ends.`
          );
        }

        prevTags.forEach((prevTag) => {
          if (overlaps(prevTag, tag)) {
            throw new Error(
              `Highlight tag with indices [${tag.indices.start}, ${tag.indices.end}] overlaps with tag [${prevTag.indices.start}, ${prevTag.indices.end}]`
            );
          }
        });

        // TODO - implement this as an ngFor of items that is generated in the template for a cleaner solution

        const expectedTagLength = tag.indices.end - tag.indices.start;
        const tagContents = textInputValue.slice(tag.indices.start, tag.indices.end);
        if (tagContents.length === expectedTagLength) {
          const previousIndex = prevTags.length > 0 ? prevTags[prevTags.length - 1].indices.end : 0;
          const before = textInputValue.slice(previousIndex, tag.indices.start);
          parts.push(escapeHtml(before));
          const cssClass = tag.cssClass || this.tagCssClass;
          const tagId = tagIndexIdPrefix + this.tags.indexOf(tag);
          // ngx-text-highlight-tag-id-${id} is used instead of a data attribute to prevent an angular sanitization warning
          parts.push(`<span class="ngx-text-highlight-tag ${tagId} ${cssClass}">${escapeHtml(tagContents)}</span>`);
          prevTags.push(tag);
        }
      });
    const remainingIndex = prevTags.length > 0 ? prevTags[prevTags.length - 1].indices.end : 0;
    const remaining = textInputValue.slice(remainingIndex);
    parts.push(escapeHtml(remaining));
    parts.push(' ');
    this.highlightedText = parts.join('');
    this.cdr.detectChanges();

    this.highlightTagElements = Array.from(this.highlightElement.nativeElement.getElementsByTagName('span')).map(
      // @ts-ignore
      (element: HTMLElement) => {
        return { element, clientRect: element.getBoundingClientRect() };
      }
    );
  }

  private handleTextareaMouseEvent(event: MouseEvent, eventName: 'click' | 'mousemove') {
    const matchingTagIndex = this.highlightTagElements.findIndex((elm) =>
      isCoordinateWithinRect(elm.clientRect, event.clientX, event.clientY)
    );

    if (matchingTagIndex > -1) {
      const target = this.highlightTagElements[matchingTagIndex].element;
      const tagClass = Array.from(target.classList).find((className) => className.startsWith(tagIndexIdPrefix));
      if (tagClass) {
        const tagId = tagClass.replace(tagIndexIdPrefix, '');
        const tag: HighlightTag = this.tags[Number(tagId)];
        const tagMouseEvent = { tag, target, event };

        if (eventName === 'click') {
          this.tagClick.emit(tagMouseEvent);
        } else {
          if (this.hoveredTag) {
            if (this.hoveredTag.target !== tagMouseEvent.target) {
              this.onMouseLeave(this.hoveredTag, event);
              this.onMouseEnter(tagMouseEvent, event);
            }
          } else {
            this.onMouseEnter(tagMouseEvent, event);
          }
        }
      }
    } else if (eventName === 'mousemove' && this.hoveredTag) {
      this.onMouseLeave(this.hoveredTag, event);
    }
  }

  private onMouseEnter(tag: TagMouseEvent, event: MouseEvent): void {
    tag.event = event;
    tag.target.classList.add('ngx-text-highlight-tag-hovered');
    this.hoveredTag = tag;
    this.tagMouseEnter.emit(tag);
  }

  private onMouseLeave(tag: TagMouseEvent, event: MouseEvent): void {
    tag.event = event;
    tag.target.classList.remove('ngx-text-highlight-tag-hovered');
    this.hoveredTag = undefined;
    this.tagMouseLeave.emit(tag);
  }
}
