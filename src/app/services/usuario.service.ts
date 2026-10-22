import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { Usuario } from '../model/usuario';
import { environment } from '../../environments/environment';

type UsuarioData = Omit<Usuario, 'idUser' | 'name' | 'password'> & { password?: string };

@Service()
export class UsuarioService {
  private readonly apiUrl = `${environment.apiUrl}/usuarios`;
  private readonly http = inject(HttpClient);

  findAll(): Observable<Usuario[]> {
    return this.http.get<Usuario[]>(this.apiUrl);
  }

  findById(id: number): Observable<Usuario> {
    return this.http.get<Usuario>(`${this.apiUrl}/${id}`);
  }

  create(usuario: UsuarioData): Observable<Usuario> {
    return this.http.post<Usuario>(this.apiUrl, usuario);
  }

  update(id: number, usuario: UsuarioData): Observable<Usuario> {
    return this.http.put<Usuario>(`${this.apiUrl}/${id}`, usuario);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
