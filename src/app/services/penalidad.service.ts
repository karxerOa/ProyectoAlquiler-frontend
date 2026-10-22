import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { Penalidad } from '../model/penalidad';

@Service()
export class PenalidadService {
  private readonly http = inject(HttpClient);
  private readonly url = 'http://localhost:8080/api/penalidades';

  listar(): Observable<Penalidad[]> {
    return this.http.get<Penalidad[]>(this.url);
  }

  registrar(penalidad: Penalidad): Observable<Penalidad> {
    return this.http.post<Penalidad>(this.url, penalidad);
  }
}