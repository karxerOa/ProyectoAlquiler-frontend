import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Empleado } from '../model/empleado';
import { ApiResourceService } from './api-resource.service';

@Service()
export class EmpleadoService extends ApiResourceService<Empleado> {
  constructor() {
    super(inject(HttpClient), 'empleados');
  }
}
