import { HttpClient } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { Devolucion } from '../model/devolucion';
import { environment } from '../../environments/environment';

type DevolucionData = Omit<Devolucion, 'idDevolucion'>;

@Service()
export class DevolucionService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/devoluciones`;
  private readonly _devoluciones = signal<Devolucion[]>([]);

  readonly $devolucionesChange = this._devoluciones.asReadonly();

  listar() {
    return this.http.get<Devolucion[]>(this.url);
  }

  registrar(devolucion: DevolucionData) {
    return this.http.post<Devolucion>(this.url, devolucion);
  }

  setDevolucionesChange(data: Devolucion[]): void {
    this._devoluciones.set(data);
  }
}