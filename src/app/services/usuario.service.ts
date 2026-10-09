import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Usuario } from '../model/usuario';
import { ApiResourceService } from './api-resource.service';

@Service()
export class UsuarioService extends ApiResourceService<Usuario> {
  constructor() {
    super(inject(HttpClient), 'usuarios');
  }
}
