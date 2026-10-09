import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Penalidad } from '../model/penalidad';
import { ApiResourceService } from './api-resource.service';

@Service()
export class PenalidadService extends ApiResourceService<Penalidad> {
  constructor() {
    super(inject(HttpClient), 'penalidades');
  }
}
