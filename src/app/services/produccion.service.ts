import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import type { Empleado } from '../model/empleado';
import { Produccion } from '../model/produccion';
import type { Prenda } from '../model/prenda';
import { environment } from '../../environments/environment';

type ProduccionData = Omit<Produccion, 'idProduccion' | 'prenda' | 'empleado'> & {
  prenda: Pick<Prenda, 'idPrenda'>;
  empleado: Pick<Empleado, 'idEmpleado'>;
};

@Injectable({
  providedIn: 'root',
})
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