import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LoaderService {
  constructor() {
    this.appendLoaderStyles();
  }

  appendLoaderStyles(): void {
    const styleElem = document.createElement('style');
    styleElem.innerHTML = this.getStylesAsString();
    document.head.appendChild(styleElem);
  }

  appendLoader(hostElem: HTMLElement): HTMLElement {
    const loaderElem = document.createElement('div');
    loaderElem.className = 'ngx-loader';

    loaderElem.style['display'] = 'none';

    // TODO: if appending to button add min-height?

    const hostBorderRadius = getComputedStyle(hostElem)['border-radius'];
    if (parseInt(hostBorderRadius, 10)) {
      loaderElem.style['border-radius'] = hostBorderRadius;
    }

    loaderElem.innerHTML = `
      <span class="ngx-spinner"></span>
    `;

    hostElem.appendChild(loaderElem);

    return loaderElem;
  }

  getStylesAsString(): string {
    return `
      [ngxLoader] {
        position: relative;
      }

      .ngx-loader {
        position: absolute;
        top: 6px; // some room between the trigger character and the loader
        left: 0;
        width: 100%;
        height: 100%;
        background: #fff;
        z-index: 999;
        border: 1px solid #ccc;
        border-radius: 4px;
        display: flex;
        justify-content: center;
        align-items: center;
      }

      .ngx-spinner {
        display: inline-block;
        width: 25px;
        height: 25px;
        border: 3px solid rgba(255, 255, 255, 0.3);
        border-radius: 50%;
        border-top-color: lightgray;
        animation: ngx-spin 1s ease-in-out infinite;
      }

      @-webkit-keyframes ngx-spin {
        to {
          -webkit-transform: rotate(360deg);
        }
      }
    `;
  }
}
