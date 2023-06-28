import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';

import { ChoiceWithIndices } from 'ngx-mentions';
import { getFormattedHighlightText, parentCommentStatusBasedStyles } from '../shared/styles/util';
import { DomSanitizer } from '@angular/platform-browser';

interface User {
  id: string;
  name: string;
}

@Component({
  selector: 'app-overview-b',
  templateUrl: './overview-b.component.html',
  styleUrls: ['./overview-b.component.scss'],
})
export class OverviewBComponent implements OnInit {
  textCtrl: FormControl = new FormControl(
    '@Amelia @Fredericka Wilkie could you please review this case?'
  );
  loading = false;
  choices: User[] = [];
  mentions: ChoiceWithIndices[] = [];
  searchRegexp = new RegExp('^([-&.\\w]+ *){0,3}$');

  selectedChoices: ChoiceWithIndices[] = [
    {
      choice: {
        id: 1,
        name: 'Amelia',
      },
      indices: {
        start: 0,
        end: 7,
        triggerCharacter: '@'
      },
    },
    {
      choice: {
        id: 6,
        name: 'Fredericka Wilkie',
      },
      indices: {
        start: 8,
        end: 26,
        triggerCharacter: '@'
      },
    },
  ];

  mentionsConfig = [
    {
      triggerCharacter: '@',
      getChoiceLabel: (user: User): string => {
        return `@${user.name}`;
      },
    }
  ]
  formattedText: string;

  constructor(private sanitizer: DomSanitizer) { }

  ngOnInit() {
    this.textCtrl.valueChanges.subscribe((content) =>
      this.formattedText = getFormattedHighlightText(
        this.textCtrl.value,
        this.mentions,
        parentCommentStatusBasedStyles,
        this.sanitizer
      )
    );
  }

  async loadChoices({ searchText, triggerCharacter }: { searchText: string, triggerCharacter: string }): Promise<User[]> {
    const users = await this.getUsers();
    this.choices = users.filter((user) => {
      const alreadyExists = this.mentions.some((m) => m.choice.name === user.name);
      return !alreadyExists && user.name.toLowerCase().indexOf(searchText.toLowerCase()) > -1;
    });

    return this.choices;
  }

  onSelectedChoicesChange(choices: ChoiceWithIndices[]): void {
    this.mentions = choices;
    this.formattedText = getFormattedHighlightText(
      this.textCtrl.value,
      this.mentions,
      parentCommentStatusBasedStyles,
      this.sanitizer
    )
    console.log('mentions:', this.mentions);
  }

  onMenuShow(): void {
    console.log('Menu show!');
  }

  onMenuHide(): void {
    console.log('Menu hide!');
    this.choices = [];
  }

  async getUsers(): Promise<User[]> {
    this.loading = true;
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        this.loading = false;
        resolve([
          {
            id: '1001',
            name: 'Amelia',
          },
          {
            id: '1002',
            name: 'Doe',
          },
          {
            id: '1003',
            name: 'John Doe',
          },
          {
            id: '1004',
            name: 'John J. Doe',
          },
          {
            id: '1005',
            name: 'John & Doe',
          },
          {
            id: '1006',
            name: 'Fredericka Wilkie',
          },
          {
            id: '1007',
            name: 'Collin Warden',
          },
          {
            id: '1008',
            name: 'Hyacinth Hurla',
          },
          {
            id: '1009',
            name: 'Paul Bud Mazzei',
          },
          {
            id: '1010',
            name: 'Mamie Xander Blais',
          },
          {
            id: '1011',
            name: 'Sacha Murawski',
          },
          {
            id: '1012',
            name: 'Marcellus Van Cheney',
          },
          {
            id: '1013',
            name: 'Lamar Kowalski',
          },
          {
            id: '1014',
            name: 'Queena Gauss',
          },
        ]);
      }, 1000);
    });
  }
}
