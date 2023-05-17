# NgxMentions

## Installation Guide for Angular NgxMentions
This guide provides instructions for installing and using the NGX Mentions library in an Angular project.

### Prerequisites

Make sure you have the following dependencies installed on your system:

- Node.js (version X)
- npm (Node Package Manager)

Angular Version and Node.js Compatibility
The NGX Mentions library has different versions compatible with specific Angular and Node.js versions. Use the appropriate version based on your requirements:

branch => node version

```bash
ngx-mentions_v16 → v16.14.0
ngx-mentions_v15 → v16.13.0
ngx-mentions_v14 → v16.10.0
ngx-mentions_v13 → v16.10.0
ngx-mentions_v12 → v14.15.0
ngx-mentions_v11 → v12.11.0
```

Please note that you should replace X with the compatible Node.js version and V with the desired Angular version when following the installation steps.

### Installation

To install the required Node.js version, use nvm (Node Version Manager):

```bash
nvm uninstall X
nvm install X
nvm use X
```

Once you have the correct Node.js version installed, you can proceed with the following steps:

1. Install the Angular CLI globally:
```bash
npm i -g @angular/cli@V
```
2. Install project dependencies:
```bash
npm i
```

### Build and serve
1. To build the NGX Mentions library with the specified Angular version configuration, run the following command:
```bash
ng build ngx-mentions --configuration production
```
2. To serve the Angular application, use the following command:
```bash
ng serve --open
```

---

## Code scaffolding

Run `ng generate component component-name --project ngx-mentions` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module --project ngx-mentions`.
> Note: Don't forget to add `--project ngx-mentions` or else it will be added to the default project in your `angular.json` file. 

## Build

Run `ng build ngx-mentions` to build the project. The build artifacts will be stored in the `dist/` directory.

## Publishing

After building your library with `ng build ngx-mentions`, go to the dist folder `cd dist/ngx-mentions` and run `npm publish`.

## Running unit tests

Run `ng test ngx-mentions` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
