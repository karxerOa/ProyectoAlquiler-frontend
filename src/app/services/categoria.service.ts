import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Categoria } from '../model/categoria';
import { ApiResourceService } from './api-resource.service';

@Service()
export class CategoriaService extends ApiResourceService<Categoria> {
  constructor() {
    super(inject(HttpClient), 'categorias');
  }
}
