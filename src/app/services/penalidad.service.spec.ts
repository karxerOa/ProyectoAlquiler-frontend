import { TestBed } from '@angular/core/testing';
import { PenalidadService } from './penalidad.service';

describe('PenalidadService', () => {
  let service: PenalidadService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PenalidadService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
