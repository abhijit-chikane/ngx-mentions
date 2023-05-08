import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { OverviewAComponent } from './overview-a.component';
import { NgxMentionsModule } from 'ngx-mentions';
import { FormsModule } from '@angular/forms';

describe('OverviewAComponent', () => {
  let component: OverviewAComponent;
  let fixture: ComponentFixture<OverviewAComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [
        OverviewAComponent,
      ],
      imports: [
        NgxMentionsModule,
        FormsModule,
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(OverviewAComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
