import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';

import { ChoiceWithIndices } from 'ngx-mentions';
import { getFormattedHighlightText, parentCommentStatusBasedStyles } from '../shared/styles/util';

interface User {
  id: string;
  name: string;
}
interface Tag {
  id: string;
  tag: string;
}

@Component({
  selector: 'app-overview-c',
  templateUrl: './overview-c.component.html',
  styleUrls: ['./overview-c.component.scss'],
})
export class OverviewCComponent implements OnInit {
  textCtrl: FormControl = new FormControl(
    '@Amelia #machine-learning tag with customize styling'
  );
  loading = false;
  choices: (User | Tag)[] = [];
  mentions: ChoiceWithIndices[] = [];
  searchRegexp = new RegExp('^([-&.\\w]+ *){0,3}$');

  formattedText: string;

  selectedChoices: ChoiceWithIndices[] = [
    {
      choice: {
        id: '1001',
        name: 'Amelia',
      },
      indices: {
        start: 0,
        end: 7,
        triggerCharacter: '@'
      },
      cssClass: ''
    },
    {
      choice: {
        id: '1014',
        tag: 'machine-learning',
      },
      indices: {
        start: 8,
        end: 25,
        triggerCharacter: '#'
      },
      cssClass: 'hash-highlight-tag'
    },
  ];

  mentionsConfig = [
    {
      triggerCharacter: '@',
      getChoiceLabel: (user: User): string => {
        return `@${user.name}`;
      },
    },
    {
      triggerCharacter: '#',
      getChoiceLabel: (tag: Tag): string => {
        return `#${tag.tag}`;
      },
    }
  ]

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

  async loadChoices({ searchText, triggerCharacter }: { searchText: string, triggerCharacter: string }): Promise<(User | Tag)[]> {
    let searchResults
    if (triggerCharacter === '@') {
      searchResults = await this.getUsers();
      this.choices = searchResults.filter((user) => {
        // const alreadyExists = this.mentions.some((m) => m.choice.name === user.name);
        return user.name.toLowerCase().indexOf(searchText.toLowerCase()) > -1
        // && !alreadyExists;
      });
    } else {
      searchResults = await this.getTags();
      this.choices = searchResults.filter((item) => {
        return item.tag.toLowerCase().indexOf(searchText.toLowerCase()) > -1
      });
    }
    return this.choices;
  }

  getDisplayLabel = (item: (User | Tag)): string => {
    if (item.hasOwnProperty('name')) {
      return (item as User).name
    }
    return (item as Tag).tag
  };

  getDisplayLabelAdditionalInfo = (item: (User | Tag)): string => {
    return `id: ${item.id}`;
  };

  onSelectedChoicesChange(choices: ChoiceWithIndices[]): void {
    this.mentions = choices.map(choice => ({
      ...choice,
      cssClass: choice.indices.triggerCharacter === '#' ? 'hash-highlight-tag' : ''
    }));
    this.formattedText = getFormattedHighlightText(
      this.textCtrl.value,
      this.mentions,
      parentCommentStatusBasedStyles,
      this.sanitizer
    )
    console.log('this.mentions', this.mentions);
  }

  onMenuShow(): void {
    console.log('Menu show!');
  }

  onMenuHide(): void {
    console.log('Menu hide!');
    this.choices = [];
  }

  async getTags(): Promise<Tag[]> {
    this.loading = true;
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        this.loading = false;
        resolve([
          {
            id: '1001',
            tag: 'programming',
          },
          {
            id: '1002',
            tag: 'technology',
          },
          {
            id: '1003',
            tag: 'web-development',
          },
          {
            id: '1004',
            tag: 'javascript',
          },
          {
            id: '1005',
            tag: 'frontend',
          },
          {
            id: '1006',
            tag: 'backend',
          },
          {
            id: '1007',
            tag: 'database',
          },
          {
            id: '1008',
            tag: 'design',
          },
          {
            id: '1009',
            tag: 'mobile-apps',
          },
          {
            id: '1010',
            tag: 'artificial-intelligence',
          },
          {
            id: '1011',
            tag: 'data-science',
          },
          {
            id: '1012',
            tag: 'cybersecurity',
          },
          {
            id: '1013',
            tag: 'cloud-computing',
          },
          {
            id: '1014',
            tag: 'machine-learning',
          },
        ]);
      }, 600);
    });
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
      }, 600);
    });
  }
}
