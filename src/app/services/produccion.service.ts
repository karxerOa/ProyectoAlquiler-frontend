import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import type { Empleado } from '../model/empleado';
import type { Prenda } from '../model/prenda';
import type { Produccion } from '../model/produccion';

type ProduccionData = Omit<Produccion, 'idProduccion' | 'prenda' | 'empleado'> & {
  prenda: Pick<Prenda, 'idPrenda'>;
  empleado: Pick<Empleado, 'idEmpleado'>;
};

@Service()
export class ProduccionService {
  private readonly apiUrl = `${environment.apiUrl}/producciones`;
  private readonly http = inject(HttpClient);

  findAll(): Observable<Produccion[]> {
    return this.http.get<Produccion[]>(this.apiUrl);
  }

  findById(id: number): Observable<Produccion> {
    return this.http.get<Produccion>(`${this.apiUrl}/${id}`);
  }

  create(produccion: ProduccionData): Observable<Produccion> {
    return this.http.post<Produccion>(this.apiUrl, produccion);
  }

  update(id: number, produccion: ProduccionData): Observable<Produccion> {
    return this.http.put<Produccion>(`${this.apiUrl}/${id}`, produccion);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}