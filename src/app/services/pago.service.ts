import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Pago } from '../model/pago';
import { ApiResourceService } from './api-resource.service';

@Service()
export class PagoService extends ApiResourceService<Pago> {
  constructor() {
    super(inject(HttpClient), 'pagos');
  }
}
