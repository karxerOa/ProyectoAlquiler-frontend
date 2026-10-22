import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { Devolucion } from '../model/devolucion';
import { environment } from '../../environments/environment';

type DevolucionData = Omit<Devolucion, 'idDevolucion'>;

@Service()
export class DevolucionService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/devoluciones`;

  listar(): Observable<Devolucion[]> {
    return this.http.get<Devolucion[]>(this.url);
  }

  registrar(devolucion: DevolucionData): Observable<Devolucion> {
    return this.http.post<Devolucion>(this.url, devolucion);
  }
}