import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Rol } from '../model/rol';
import { ApiResourceService } from './api-resource.service';

@Service()
export class RolService extends ApiResourceService<Rol> {
  constructor() {
    super(inject(HttpClient), 'roles');
  }
}
