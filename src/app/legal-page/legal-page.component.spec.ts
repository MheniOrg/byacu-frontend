import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LegalPageComponent } from './legal-page.component';

describe('LegalPageComponent', () => {
  let component: LegalPageComponent;
  let fixture: ComponentFixture<LegalPageComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LegalPageComponent]
    });
    fixture = TestBed.createComponent(LegalPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
