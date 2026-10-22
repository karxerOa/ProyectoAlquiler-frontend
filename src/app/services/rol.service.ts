import { HttpClient } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { Rol } from '../model/rol';
import { environment } from '../../environments/environment';

type RolData = Omit<Rol, 'idRol'>;

@Service()
export class RolService {
  private readonly apiUrl = `${environment.apiUrl}/roles`;
  private readonly http = inject(HttpClient);
  private readonly _roles = signal<Rol[]>([]);

  readonly $rolesChange = this._roles.asReadonly();

  findAll() {
    return this.http.get<Rol[]>(this.apiUrl);
  }

  findById(id: number) {
    return this.http.get<Rol>(`${this.apiUrl}/${id}`);
  }

  create(rol: RolData) {
    return this.http.post<Rol>(this.apiUrl, rol);
  }

  update(id: number, rol: RolData) {
    return this.http.put<Rol>(`${this.apiUrl}/${id}`, rol);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  setRolesChange(data: Rol[]): void {
    this._roles.set(data);
  }
}
