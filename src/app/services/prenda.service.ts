import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Prenda } from '../model/prenda';
import { ApiResourceService } from './api-resource.service';

@Service()
export class PrendaService extends ApiResourceService<Prenda> {
  constructor() {
    super(inject(HttpClient), 'prendas');
  }
}
