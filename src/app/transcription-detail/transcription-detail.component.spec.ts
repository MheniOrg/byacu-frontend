import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TranscriptionDetailComponent } from './transcription-detail.component';

describe('TranscriptionDetailComponent', () => {
  let component: TranscriptionDetailComponent;
  let fixture: ComponentFixture<TranscriptionDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TranscriptionDetailComponent]
    });
    fixture = TestBed.createComponent(TranscriptionDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
