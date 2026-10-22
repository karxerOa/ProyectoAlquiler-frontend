import { inject, Service, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface Cliente {
  idCliente: number;
  nombre: string;
  apellidos: string;
  dni: number;
  telefono: number;
  direccion: string;
  correo: string;
}

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

  create(cliente: Omit<Cliente, 'idCliente'>) {
    return this.http.post<Cliente>(this.apiUrl, cliente);
  }

  update(id: number, cliente: Omit<Cliente, 'idCliente'>) {
    return this.http.put<Cliente>(`${this.apiUrl}/${id}`, cliente);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  setClientesChange(data: Cliente[]): void {
    this._clientes.set(data);
  }
}