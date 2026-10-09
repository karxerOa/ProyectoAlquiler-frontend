import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Produccion } from '../model/produccion';
import { ApiResourceService } from './api-resource.service';

@Service()
export class ProduccionService extends ApiResourceService<Produccion> {
  constructor() {
    super(inject(HttpClient), 'producciones');
  }
}
