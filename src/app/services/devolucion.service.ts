import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Devolucion } from '../model/devolucion';

@Injectable({
  providedIn: 'root'
})
export class DevolucionService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/api/devoluciones';

  listar(): Observable<Devolucion[]> {
    return this.http.get<Devolucion[]>(this.url);
  }

  registrar(devolucion: Devolucion): Observable<Devolucion> {
    return this.http.post<Devolucion>(this.url, devolucion);
  }
}