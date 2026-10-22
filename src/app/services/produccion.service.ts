import { HttpClient } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { Produccion } from '../model/produccion';
import { environment } from '../../environments/environment';

type ProduccionData = Omit<Produccion, 'idProduccion'>;

@Service()
export class ProduccionService {
  private readonly apiUrl = `${environment.apiUrl}/producciones`;
  private readonly http = inject(HttpClient);
  private readonly _producciones = signal<Produccion[]>([]);

  readonly $produccionesChange = this._producciones.asReadonly();

  findAll() {
    return this.http.get<Produccion[]>(this.apiUrl);
  }

  findById(id: number) {
    return this.http.get<Produccion>(`${this.apiUrl}/${id}`);
  }

  create(produccion: ProduccionData) {
    return this.http.post<Produccion>(this.apiUrl, produccion);
  }

  update(id: number, produccion: ProduccionData) {
    return this.http.put<Produccion>(`${this.apiUrl}/${id}`, produccion);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  setProduccionesChange(data: Produccion[]): void {
    this._producciones.set(data);
  }
}