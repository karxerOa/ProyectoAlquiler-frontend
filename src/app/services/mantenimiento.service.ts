import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Mantenimiento } from '../model/mantenimiento';
import { ApiResourceService } from './api-resource.service';

@Service()
export class MantenimientoService extends ApiResourceService<Mantenimiento> {
  constructor() {
    super(inject(HttpClient), 'mantenimientos');
  }
}
