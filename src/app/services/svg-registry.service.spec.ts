import { TestBed } from '@angular/core/testing';

import { SvgRegistryService } from './svg-registry.service';

describe('SvgRegistryService', () => {
  let service: SvgRegistryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SvgRegistryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
