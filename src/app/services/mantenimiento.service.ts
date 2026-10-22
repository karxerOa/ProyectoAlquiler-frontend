import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { Mantenimiento } from '../model/mantenimiento';
import { environment } from '../../environments/environment';

type MantenimientoData = Omit<Mantenimiento, 'idMantenimiento'>;

@Service()
export class MantenimientoService {
  private readonly apiUrl = `${environment.apiUrl}/mantenimientos`;
  private readonly http = inject(HttpClient);

  findAll(): Observable<Mantenimiento[]> {
    return this.http.get<Mantenimiento[]>(this.apiUrl);
  }

  findById(id: number): Observable<Mantenimiento> {
    return this.http.get<Mantenimiento>(`${this.apiUrl}/${id}`);
  }

  create(mantenimiento: MantenimientoData): Observable<Mantenimiento> {
    return this.http.post<Mantenimiento>(this.apiUrl, mantenimiento);
  }

  update(id: number, mantenimiento: MantenimientoData): Observable<Mantenimiento> {
    return this.http.put<Mantenimiento>(`${this.apiUrl}/${id}`, mantenimiento);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
