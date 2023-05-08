import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { TextInputHighlightComponent } from './text-input-highlight.component';

describe('TextInputHighlightComponent', () => {
  let component: TextInputHighlightComponent;
  let fixture: ComponentFixture<TextInputHighlightComponent>;

  beforeEach(waitForAsync(() => {
    TestBed.configureTestingModule({
      declarations: [ TextInputHighlightComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TextInputHighlightComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
