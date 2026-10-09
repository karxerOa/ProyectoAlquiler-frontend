import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { DetalleAlquiler } from '../model/detalle-alquiler';
import { ApiResourceService } from './api-resource.service';

@Service()
export class DetalleAlquilerService extends ApiResourceService<DetalleAlquiler> {
  constructor() {
    super(inject(HttpClient), 'detalles-alquiler');
  }
}
