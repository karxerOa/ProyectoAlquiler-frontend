import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { DetalleAlquiler } from '../model/detalle-alquiler';
import { environment } from '../../environments/environment';

type DetalleAlquilerData = Omit<DetalleAlquiler, 'idDetalle'>;

@Service()
export class DetalleAlquilerService {
  private readonly apiUrl = `${environment.apiUrl}/detalles-alquiler`;
  private readonly http = inject(HttpClient);

  findAll(): Observable<DetalleAlquiler[]> {
    return this.http.get<DetalleAlquiler[]>(this.apiUrl);
  }

  findById(id: number): Observable<DetalleAlquiler> {
    return this.http.get<DetalleAlquiler>(`${this.apiUrl}/${id}`);
  }

  create(detalle: DetalleAlquilerData): Observable<DetalleAlquiler> {
    return this.http.post<DetalleAlquiler>(this.apiUrl, detalle);
  }

  update(id: number, detalle: DetalleAlquilerData): Observable<DetalleAlquiler> {
    return this.http.put<DetalleAlquiler>(`${this.apiUrl}/${id}`, detalle);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
