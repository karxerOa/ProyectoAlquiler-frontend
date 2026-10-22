import { HttpClient } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { Penalidad } from '../model/penalidad';
import { environment } from '../../environments/environment';

type PenalidadData = Omit<Penalidad, 'idPenalidad'>;

@Service()
export class PenalidadService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/penalidades`;
  private readonly _penalidades = signal<Penalidad[]>([]);

  readonly $penalidadesChange = this._penalidades.asReadonly();

  listar() {
    return this.http.get<Penalidad[]>(this.url);
  }

  registrar(penalidad: PenalidadData) {
    return this.http.post<Penalidad>(this.url, penalidad);
  }

  setPenalidadesChange(data: Penalidad[]): void {
    this._penalidades.set(data);
  }
}