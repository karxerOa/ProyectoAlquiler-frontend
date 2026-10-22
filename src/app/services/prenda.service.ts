import { HttpClient } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { Prenda } from '../model/prenda';
import { environment } from '../../environments/environment';

type PrendaData = Omit<Prenda, 'idPrenda' | 'categoriaNombre'>;

@Service()
export class PrendaService {
  private readonly apiUrl = `${environment.apiUrl}/prendas`;
  private readonly http = inject(HttpClient);
  private readonly _prendas = signal<Prenda[]>([]);

  readonly $prendasChange = this._prendas.asReadonly();

  findAll() {
    return this.http.get<Prenda[]>(this.apiUrl);
  }

  findById(id: number) {
    return this.http.get<Prenda>(`${this.apiUrl}/${id}`);
  }

  create(prenda: PrendaData) {
    return this.http.post<Prenda>(this.apiUrl, prenda);
  }

  update(id: number, prenda: PrendaData) {
    return this.http.put<Prenda>(`${this.apiUrl}/${id}`, prenda);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  setPrendasChange(data: Prenda[]): void {
    this._prendas.set(data);
  }
}
