import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OverviewBComponent } from './overview-b.component';
import { NgxMentionsModule } from 'ngx-mentions';
import { FormsModule } from '@angular/forms';

describe('OverviewAComponent', () => {
  let component: OverviewBComponent;
  let fixture: ComponentFixture<OverviewBComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        OverviewBComponent,
      ],
      imports: [
        NgxMentionsModule,
        FormsModule,
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OverviewBComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
