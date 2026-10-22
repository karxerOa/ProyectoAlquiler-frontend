import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { Penalidad } from '../model/penalidad';
import { environment } from '../../environments/environment';

type PenalidadData = Omit<Penalidad, 'idPenalidad'>;

@Service()
export class PenalidadService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/penalidades`;

  listar(): Observable<Penalidad[]> {
    return this.http.get<Penalidad[]>(this.url);
  }

  registrar(penalidad: PenalidadData): Observable<Penalidad> {
    return this.http.post<Penalidad>(this.url, penalidad);
  }
}