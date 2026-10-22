import { HttpClient } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { Alquiler } from '../model/alquiler';
import { environment } from '../../environments/environment';

type AlquilerData = Omit<Alquiler, 'idAlquiler' | 'nombreEmpleado' | 'nombreCliente' | 'apellidoCliente'>;

@Service()
export class AlquilerService {
  private readonly apiUrl = `${environment.apiUrl}/alquileres`;
  private readonly http = inject(HttpClient);
  private readonly _alquileres = signal<Alquiler[]>([]);

  readonly $alquileresChange = this._alquileres.asReadonly();

  findAll() {
    return this.http.get<Alquiler[]>(this.apiUrl);
  }

  findById(id: number) {
    return this.http.get<Alquiler>(`${this.apiUrl}/${id}`);
  }

  create(alquiler: AlquilerData) {
    return this.http.post<Alquiler>(this.apiUrl, alquiler);
  }

  update(id: number, alquiler: AlquilerData) {
    return this.http.put<Alquiler>(`${this.apiUrl}/${id}`, alquiler);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  setAlquileresChange(data: Alquiler[]): void {
    this._alquileres.set(data);
  }
}
