import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { Pago } from '../model/pago';
import { environment } from '../../environments/environment';

type PagoData = Omit<Pago, 'idPago'>;

@Service()
export class PagoService {
  private readonly apiUrl = `${environment.apiUrl}/pagos`;
  private readonly http = inject(HttpClient);

  findAll(): Observable<Pago[]> {
    return this.http.get<Pago[]>(this.apiUrl);
  }

  findById(id: number): Observable<Pago> {
    return this.http.get<Pago>(`${this.apiUrl}/${id}`);
  }

  create(pago: PagoData): Observable<Pago> {
    return this.http.post<Pago>(this.apiUrl, pago);
  }

  update(id: number, pago: PagoData): Observable<Pago> {
    return this.http.put<Pago>(`${this.apiUrl}/${id}`, pago);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
