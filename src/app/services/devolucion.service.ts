import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Devolucion } from '../model/devolucion';
import { ApiResourceService } from './api-resource.service';

@Service()
export class DevolucionService extends ApiResourceService<Devolucion> {
  constructor() {
    super(inject(HttpClient), 'devoluciones');
  }
}
