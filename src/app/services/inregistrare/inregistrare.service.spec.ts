import { TestBed } from '@angular/core/testing';

import { InregistrareService } from './inregistrare.service';

describe('InregistrareService', () => {
  let service: InregistrareService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InregistrareService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
