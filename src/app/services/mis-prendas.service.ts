import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { PrendaAlquilada } from '../model/prenda-alquilada';

@Injectable({ providedIn: 'root' })
export class MisPrendasService {
  private readonly http = inject(HttpClient);

  listar() {
    return this.http.get<PrendaAlquilada[]>(environment.apiUrl + '/mi-cuenta/prendas');
  }
}
