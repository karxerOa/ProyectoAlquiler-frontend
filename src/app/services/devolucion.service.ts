import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { Devolucion } from '../model/devolucion';

@Service()
export class DevolucionService {
  private readonly http = inject(HttpClient);
  private readonly url = 'http://localhost:8080/api/devoluciones';

  listar(): Observable<Devolucion[]> {
    return this.http.get<Devolucion[]>(this.url);
  }

  registrar(devolucion: Devolucion): Observable<Devolucion> {
    return this.http.post<Devolucion>(this.url, devolucion);
  }
}