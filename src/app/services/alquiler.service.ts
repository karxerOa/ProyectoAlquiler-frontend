import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { Alquiler } from '../model/alquiler';
import { environment } from '../../environments/environment';

type AlquilerData = Omit<Alquiler, 'idAlquiler' | 'nombreEmpleado' | 'nombreCliente' | 'apellidoCliente'>;

@Service()
export class AlquilerService {
  private readonly apiUrl = `${environment.apiUrl}/alquileres`;
  private readonly http = inject(HttpClient);

  findAll(): Observable<Alquiler[]> {
    return this.http.get<Alquiler[]>(this.apiUrl);
  }

  findById(id: number): Observable<Alquiler> {
    return this.http.get<Alquiler>(`${this.apiUrl}/${id}`);
  }

  create(alquiler: AlquilerData): Observable<Alquiler> {
    return this.http.post<Alquiler>(this.apiUrl, alquiler);
  }

  update(id: number, alquiler: AlquilerData): Observable<Alquiler> {
    return this.http.put<Alquiler>(`${this.apiUrl}/${id}`, alquiler);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
