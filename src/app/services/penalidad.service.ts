import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Penalidad } from '../model/penalidad';

@Injectable({
  providedIn: 'root'
})
export class PenalidadService {
  private http = inject(HttpClient);
  private url = 'http://localhost:8080/api/penalidades';

  listar(): Observable<Penalidad[]> {
    return this.http.get<Penalidad[]>(this.url);
  }

  registrar(penalidad: Penalidad): Observable<Penalidad> {
    return this.http.post<Penalidad>(this.url, penalidad);
  }
}