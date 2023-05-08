import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NgxMentionsComponent } from './ngx-mentions.component';

describe('NgxMentionsComponent', () => {
  let component: NgxMentionsComponent;
  let fixture: ComponentFixture<NgxMentionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ NgxMentionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NgxMentionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
