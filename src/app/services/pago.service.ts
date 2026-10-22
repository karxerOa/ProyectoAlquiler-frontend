import { HttpClient } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { Pago } from '../model/pago';
import { environment } from '../../environments/environment';

type PagoData = Omit<Pago, 'idPago'>;

@Service()
export class PagoService {
  private readonly apiUrl = `${environment.apiUrl}/pagos`;
  private readonly http = inject(HttpClient);
  private readonly _pagos = signal<Pago[]>([]);

  readonly $pagosChange = this._pagos.asReadonly();

  findAll() {
    return this.http.get<Pago[]>(this.apiUrl);
  }

  findById(id: number) {
    return this.http.get<Pago>(`${this.apiUrl}/${id}`);
  }

  create(pago: PagoData) {
    return this.http.post<Pago>(this.apiUrl, pago);
  }

  update(id: number, pago: PagoData) {
    return this.http.put<Pago>(`${this.apiUrl}/${id}`, pago);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  setPagosChange(data: Pago[]): void {
    this._pagos.set(data);
  }
}
