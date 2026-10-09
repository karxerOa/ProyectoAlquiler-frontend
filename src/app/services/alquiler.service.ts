import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Alquiler } from '../model/alquiler';
import { ApiResourceService } from './api-resource.service';

@Service()
export class AlquilerService extends ApiResourceService<Alquiler> {
  constructor() {
    super(inject(HttpClient), 'alquileres');
  }
}
