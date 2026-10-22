import { HttpClient } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { Usuario } from '../model/usuario';
import { environment } from '../../environments/environment';

type UsuarioData = Omit<Usuario, 'idUser' | 'name' | 'password'> & { password?: string };

@Service()
export class UsuarioService {
  private readonly apiUrl = `${environment.apiUrl}/usuarios`;
  private readonly http = inject(HttpClient);
  private readonly _usuarios = signal<Usuario[]>([]);

  readonly $usuariosChange = this._usuarios.asReadonly();

  findAll() {
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  findById(id: number) {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }

  create(usuario: UsuarioData) {
    return this.http.post<Usuario>(this.apiUrl, usuario);
  }

  update(id: number, usuario: UsuarioData) {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, usuario);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  setUsuariosChange(data: Usuario[]): void {
    this._usuarios.set(data);
  }
}
