import { HttpClient } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import type { DetalleAlquiler } from '../model/detalle-alquiler';
import { Observable } from 'rxjs';

@Service()
export class DetalleAlquilerService {
  private readonly apiUrl = 'http://localhost:9494/v1/detalles-alquiler';
  private readonly http = inject(HttpClient);

  readonly $detallesChange = signal<DetalleAlquiler[]>([]);
  readonly $messageChange = signal('');

  findAll(): Observable<DetalleAlquiler[]> {
    return this.http.get<DetalleAlquiler[]>(this.apiUrl);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  setDetalleChange(detalles: DetalleAlquiler[]): void {
    this.$detallesChange.set(detalles);
  }

  setMessageChange(message: string): void {
    this.$messageChange.set(message);
  }
}
