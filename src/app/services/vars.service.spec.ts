import { TestBed } from '@angular/core/testing';

import { VarsService } from './vars.service';

describe('VarsService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: VarsService = TestBed.get(VarsService);
    expect(service).toBeTruthy();
  });
});
