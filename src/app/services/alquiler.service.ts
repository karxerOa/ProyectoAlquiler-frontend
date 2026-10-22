import { HttpClient } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import type { Alquiler } from '../model/alquiler';
import { Observable } from 'rxjs';

@Service()
export class AlquilerService {
  private readonly apiUrl = 'http://localhost:9494/v1/alquileres';
  private readonly http = inject(HttpClient);

  readonly $alquileresChange = signal<Alquiler[]>([]);
  readonly $messageChange = signal('');

  findAll(): Observable<Alquiler[]> {
    return this.http.get<Alquiler[]>(this.apiUrl);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  setAlquilerChange(alquileres: Alquiler[]): void {
    this.$alquileresChange.set(alquileres);
  }

  setMessageChange(message: string): void {
    this.$messageChange.set(message);
  }
}
