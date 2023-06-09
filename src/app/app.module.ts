import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { AppComponent } from './app.component';
import { ReactiveFormsModule } from '@angular/forms';
import { OverviewAComponent } from './overview-a/overview-a.component';
import { OverviewBComponent } from './overview-b/overview-b.component';
import { NgxMentionsModule } from 'projects/ngx-mentions/src/public-api';
import { RouterModule } from '@angular/router';
import { OverviewCComponent } from './overview-c/overview-c.component';
@NgModule({
  declarations: [
    AppComponent,
    OverviewAComponent,
    OverviewBComponent,
    OverviewCComponent,
  ],
  imports: [
    HttpClientModule,
    BrowserModule,
    NgxMentionsModule,
    ReactiveFormsModule,
    RouterModule.forRoot([]),
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule { }
