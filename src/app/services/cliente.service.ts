import { inject, Service, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

import type { Cliente } from '../model/cliente';
export type { Cliente } from '../model/cliente';
type ClienteData = Omit<Cliente, 'idCliente'>;

@Service()
export class ClienteService {
  private readonly apiUrl = `${environment.apiUrl}/clientes`;
  private readonly http = inject(HttpClient);
  private readonly _clientes = signal<Cliente[]>([]);

  readonly $clientesChange = this._clientes.asReadonly();

  findAll() {
    return this.http.get<Cliente[]>(this.apiUrl);
  }

  findById(id: number) {
    return this.http.get<Cliente>(`${this.apiUrl}/${id}`);
  }

  create(cliente: ClienteData) {
    return this.http.post<Cliente>(this.apiUrl, cliente);
  }

  update(id: number, cliente: ClienteData) {
    return this.http.put<Cliente>(`${this.apiUrl}/${id}`, cliente);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  setClientesChange(data: Cliente[]): void {
    this._clientes.set(data);
  }
}
