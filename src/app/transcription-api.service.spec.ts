import { TestBed } from '@angular/core/testing';

import { TranscriptionApiService } from './transcription-api.service';

describe('TranscriptionApiService', () => {
  let service: TranscriptionApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TranscriptionApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
