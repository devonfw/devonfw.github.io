import { TestBed } from '@angular/core/testing';

import { JourneyService } from './journey.service';

describe('JourneyService', () => {
  let service: JourneyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(JourneyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
