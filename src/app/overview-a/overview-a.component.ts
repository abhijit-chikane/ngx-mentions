import { Component, OnInit } from '@angular/core';

import { ChoiceWithIndices } from 'ngx-mentions';

interface User {
  id: string;
  name: string;
}

@Component({
  selector: 'app-overview-a',
  templateUrl: './overview-a.component.html',
  styleUrls: ['./overview-a.component.scss'],
})
export class OverviewAComponent implements OnInit {
  text = ``;
  loading = false;
  choices: User[] = [];
  mentions: ChoiceWithIndices[] = [];
  searchRegexp = new RegExp('^([-&.\\w]+ *){0,3}$');
  constructor() {}

  ngOnInit() {}

  async loadChoices(searchTerm: string): Promise<User[]> {
    const users = await this.getUsers();

    this.choices = users.filter((user) => {
      // const alreadyExists = this.mentions.some((m) => m.choice.name === user.name);
      return user.name.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1
      // && !alreadyExists;
    });

    return this.choices;
  }

  getChoiceLabel = (user: User): string => {
    return `@${user.name}`;
  };

  getDisplayLabel = (user: User): string => {
    return user.name;
  };

  getDisplayLabelAdditionalInfo = (user: User): string => {
    return `id: ${user.id}`;
  };

  onSelectedChoicesChange(choices: ChoiceWithIndices[]): void {
    this.mentions = choices;
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
      }, 600);
    });
  }
}
