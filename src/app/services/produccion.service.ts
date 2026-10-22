import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { Produccion } from '../model/produccion';
import { environment } from '../../environments/environment';

type ProduccionData = Omit<Produccion, 'idProduccion'>;

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