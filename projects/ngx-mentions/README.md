
# Angular @Mentions Component
**ngx-mentions**

Flexible, lightweight, easy-to-use, without external dependencies - Mentions component for Angular.

## Docs and demo
**[Click here for a Demo](https://abhijit-chikane.github.io/ngx-mentions/)**

**[Stackblitz working example](https://stackblitz.com/edit/ngx-mentions?file=src/main.ts)**

**[Github Repo](https://github.com/abhijit-chikane/ngx-mentions)**

![Mentions GIF](https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMzNiOTY2YTNlY2U4NjI1NjQ2ODk0ZDMwNDQxMjg5NWFiZGIyZDM5MSZlcD12MV9pbnRlcm5hbF9naWZzX2dpZklkJmN0PWc/tobJO5cS7ERoAOoLNz/giphy.gif)


## Getting Started
Installation:
```bash
$ npm i ngx-mentions
```

After importing the module the lib is ready to use:
```typescript
import { NgxMentionsModule } from 'ngx-mentions';

@NgModule({
  imports: [NgxMentionsModule],
  declarations: [],
})

export class DemoModule {}
```

## Compatibility

Latest version available for each version of Angular

| ngx-mentions | Angular       |
| ------------ | -----------   |
| 9.x          | >=9           |
| 10.x         | >=10          |
| 11.x         | >=11          |
| 12.x         | >=12          |
| 13.x         | >=13          |
| 14.x         | >=14          |
| 15.x         | >=15          |
| 16.x         | >=16          |

## ngx-mentions component
### @Inputs
Name | Description | Type | Default
--- | --- | --- | ---
`textInputElement` | Reference to the text input element. | `HTMLTextAreaElement` | Required
`menuTemplate` | Reference to the menu template (used to display the search results). | `TemplateRef` | Required
| `mentionsConfig` | An array of objects representing the configuration for mentions. Each object should have the following properties:<br>---<br>`triggerCharacter`: The character that will trigger the menu to appear.<br>`getChoiceLabel`: A function that formats the selected choice and returns the label for the choice. | `Array` | Required |
`mentions` | An array of objects containing all the selected mentions | `ChoiceWithIndices[]` | Required |
`searchRegexp` | The regular expression that will match the search text after the trigger character. No match will hide the menu. | `RegExp` | `/^\w*$/`
`closeMenuOnBlur` | Whether to close the menu when the host `textInputElement` loses focus. | `boolean` | `false`
`selectedChoices` | Pre-set choices for edit text mode, or to select/mark choices from outside the mentions component. | `any[]` | `[]`
`tagCssClass` | The CSS class to add to highlighted tags. | `string` | `''`
`removeWholeTagOnBackspace` | Whether to remove whole tag on backspace. | `boolean` | `false`

### @Outputs
Name | Description | Output type
--- | --- | ---
`search` | Called on user input after entering trigger character. Emits search term to search by and the char which trigger the current mention search. | `{ searchText: string, triggerCharacter: string }`
`menuShow` | Called when the choices menu is shown. | `void`
`menuHide` | Called when the choices menu is hidden. | `void`
`choiceSelected` | Called when a choice is selected. | `ChoiceWithIndices`
`choiceRemoved` | Called when a choice is removed. | `ChoiceWithIndices`
`selectedChoicesChange` | Called when a choice is selected, removed, or if any of the choices' indices change. | `ChoiceWithIndices[]`
`tagClick` | Called when the area over a tag is clicked. | `TagMouseEvent`
`tagMouseEnter` | Called when the area over a tag is moused over. | `TagMouseEvent`
`tagMouseLeave` | Called when the area over the tag has the mouse removed from it. | `TagMouseEvent`


## ngx-text-input-autocomplete-menu

### @Inputs
Name | Description | Type | Default
--- | --- | --- | ---
`getDisplayLabel` | A function that formats the selected choice once selected. The result (label) is also used as a choice identifier (e.g. when editing choices).  | `(choice: any) => string` | Required
`choices` | Pre-set choices to show in dropdown. | `any[]` | `[]`

### @Outputs
Name | Description | Output type
--- | --- | ---
`selectChoice` | `choiceSelected` | Called when a choice is selected. | `any`

### Basic example
```html
<div class="relative-block-container">
  <textarea cols="42"
            rows="6"
            wrap="hard"
            #textareaRef
            placeholder="Enter '@' and start typing..."
            [(ngModel)]="text"></textarea>

  <ngx-mentions [textInputElement]="textareaRef"
                [menuTemplate]="menuTemplate"
                [mentionsConfig]="mentionsConfig"
                [searchRegexp]="'^([-&.\\w]+ *){0,3}$'"
                [mentions]="mentions"
                [removeWholeTagOnBackspace]="true"
                (search)="loadChoices($event)"
                (selectedChoicesChange)="onSelectedChoicesChange($event)"
                (menuShow)="onMenuShow()"
                (menuHide)="onMenuHide()"></ngx-mentions>

  <ng-template #menuTemplate
               let-selectChoice="selectChoice">
    <ngx-text-input-autocomplete-menu [choices]="choices"
            [getDisplayLabel]="getDisplayLabel"
            (selectChoice)="selectChoice($event)">
    </ngx-text-input-autocomplete-menu>
  </ng-template>
</div>
```

```html
<div class="relative-block-container">
  <textarea cols="42"
            rows="6"
            wrap="hard"
            #textareaRef
            placeholder="Enter '@' and start typing..."
            [(ngModel)]="text"></textarea>

  <ngx-mentions [textInputElement]="textareaRef"
                [menuTemplate]="menuTemplate"
                [mentionsConfig]="mentionsConfig"
                [searchRegexp]="'^([-&.\\w]+ *){0,3}$'"
                [mentions]="mentions"
                [removeWholeTagOnBackspace]="true"
                (search)="loadChoices($event)"
                (selectedChoicesChange)="onSelectedChoicesChange($event)"
                (menuShow)="onMenuShow()"
                (menuHide)="onMenuHide()"></ngx-mentions>

  <ng-template #menuTemplate
               let-selectChoice="selectChoice">
    <ul class="ngx-selectable-list"
      ngxKbListNavigation
      [choices]="choices"
      (selectChoice)="selectChoice($event)"
      [class.loader-only]="!choices.length && loading">
      <li *ngFor="let user of choices"
        class="ngx-selectable-list-item"
        (click)="selectChoice(user)">
        <span title="{{user.name}}">{{user.name}}</span>
      </li>
    </ul>
  </ng-template>
</div>
```

## Author
Abhijit Chikane

[Github](https://github.com/abhijit-chikane) | 
[LinkedIn](https://www.linkedin.com/in/abhijit-chikane/)

Sumit Basak

[Github](https://github.com/SumitB06) | 
[LinkedIn](https://www.linkedin.com/in/sumit-basak-9569156b/)

## Support
All suggestions and improvements are welcome and appreciated.


## License
The [MIT License](https://github.com/abhijitchikane/ngx-mentions/blob/master/projects/ngx-mentions/LICENSE).
