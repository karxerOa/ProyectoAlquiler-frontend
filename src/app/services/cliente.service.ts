import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Cliente } from '../model/cliente';
import { ApiResourceService } from './api-resource.service';

@Service()
export class ClienteService extends ApiResourceService<Cliente> {
  constructor() {
    super(inject(HttpClient), 'clientes');
  }
}
