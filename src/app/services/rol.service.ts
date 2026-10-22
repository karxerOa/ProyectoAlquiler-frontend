import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { Rol } from '../model/rol';
import { environment } from '../../environments/environment';

type RolData = Omit<Rol, 'idRol'>;

@Service()
export class RolService {
  private readonly apiUrl = `${environment.apiUrl}/roles`;
  private readonly http = inject(HttpClient);

  findAll(): Observable<Rol[]> {
    return this.http.get<Rol[]>(this.apiUrl);
  }

  findById(id: number): Observable<Rol> {
    return this.http.get<Rol>(`${this.apiUrl}/${id}`);
  }

  create(rol: RolData): Observable<Rol> {
    return this.http.post<Rol>(this.apiUrl, rol);
  }

  update(id: number, rol: RolData): Observable<Rol> {
    return this.http.put<Rol>(`${this.apiUrl}/${id}`, rol);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
