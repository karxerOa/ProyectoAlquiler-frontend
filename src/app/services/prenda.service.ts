import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { Prenda } from '../model/prenda';
import { environment } from '../../environments/environment';

type PrendaData = Omit<Prenda, 'idPrenda' | 'categoriaNombre'>;

@Service()
export class PrendaService {
  private readonly apiUrl = `${environment.apiUrl}/prendas`;
  private readonly http = inject(HttpClient);

  findAll(): Observable<Prenda[]> {
    return this.http.get<Prenda[]>(this.apiUrl);
  }

  findById(id: number): Observable<Prenda> {
    return this.http.get<Prenda>(`${this.apiUrl}/${id}`);
  }

  create(prenda: PrendaData): Observable<Prenda> {
    return this.http.post<Prenda>(this.apiUrl, prenda);
  }

  update(id: number, prenda: PrendaData): Observable<Prenda> {
    return this.http.put<Prenda>(`${this.apiUrl}/${id}`, prenda);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
