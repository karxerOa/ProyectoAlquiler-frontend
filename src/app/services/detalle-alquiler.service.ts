import { HttpClient } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { DetalleAlquiler } from '../model/detalle-alquiler';
import { environment } from '../../environments/environment';

type DetalleAlquilerData = Omit<DetalleAlquiler, 'idDetalle'>;

@Service()
export class DetalleAlquilerService {
  private readonly apiUrl = `${environment.apiUrl}/detalles-alquiler`;
  private readonly http = inject(HttpClient);
  private readonly _detalles = signal<DetalleAlquiler[]>([]);

  readonly $detallesChange = this._detalles.asReadonly();

  findAll() {
    return this.http.get<DetalleAlquiler[]>(this.apiUrl);
  }

  findById(id: number) {
    return this.http.get<DetalleAlquiler>(`${this.apiUrl}/${id}`);
  }

  create(detalle: DetalleAlquilerData) {
    return this.http.post<DetalleAlquiler>(this.apiUrl, detalle);
  }

  update(id: number, detalle: DetalleAlquilerData) {
    return this.http.put<DetalleAlquiler>(`${this.apiUrl}/${id}`, detalle);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  setDetallesChange(data: DetalleAlquiler[]): void {
    this._detalles.set(data);
  }
}
