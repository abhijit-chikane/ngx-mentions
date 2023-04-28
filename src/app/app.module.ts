import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';

import { NgxMentionsModule } from '../../projects/ngx-mentions/src/public-api';
import { FormsModule } from '@angular/forms';
import { OverviewAComponent } from './overview-a/overview-a.component';

@NgModule({
  imports: [
    HttpClientModule,
    BrowserModule,
    NgxMentionsModule,
    FormsModule,
    RouterModule.forRoot([
      {
        path: '',
        component: OverviewAComponent,
      }
    ]),
  ],
  declarations: [AppComponent, OverviewAComponent],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
