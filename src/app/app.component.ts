import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  template: `
    <router-outlet></router-outlet>
    <div class="github-repo">
        <a href="https://github.com/abhijit-chikane/ngx-mentions">Github Repo</a>
    </div>
    <div class="demo-container">
        <div>
            <app-overview-a></app-overview-a>
        </div>
        <div>
            <app-overview-b></app-overview-b>
        </div>
    </div>
  `,
  styles: [`
  .github-repo {
    text-align: center;
    margin-top: 1rem;
  }
  
  .demo-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 2rem;
    padding: 2rem;
  }
  `]
})
export class AppComponent {

}
