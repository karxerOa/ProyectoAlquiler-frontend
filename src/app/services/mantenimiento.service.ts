import { HttpClient } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { Mantenimiento } from '../model/mantenimiento';
import { environment } from '../../environments/environment';

type MantenimientoData = Omit<Mantenimiento, 'idMantenimiento'>;

@Service()
export class MantenimientoService {
  private readonly apiUrl = `${environment.apiUrl}/mantenimientos`;
  private readonly http = inject(HttpClient);
  private readonly _mantenimientos = signal<Mantenimiento[]>([]);

  readonly $mantenimientosChange = this._mantenimientos.asReadonly();

  findAll() {
    return this.http.get<Mantenimiento[]>(this.apiUrl);
  }

  findById(id: number) {
    return this.http.get<Mantenimiento>(`${this.apiUrl}/${id}`);
  }

  create(mantenimiento: MantenimientoData) {
    return this.http.post<Mantenimiento>(this.apiUrl, mantenimiento);
  }

  update(id: number, mantenimiento: MantenimientoData) {
    return this.http.put<Mantenimiento>(`${this.apiUrl}/${id}`, mantenimiento);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  setMantenimientosChange(data: Mantenimiento[]): void {
    this._mantenimientos.set(data);
  }
}
