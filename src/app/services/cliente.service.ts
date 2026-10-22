import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  private readonly apiUrl = 'http://localhost:9494/v1/clientes';
  private readonly http = inject(HttpClient);

  findAll(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(this.apiUrl);
  }

  findById(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.apiUrl}/${id}`);
  }

  create(cliente: Omit<Cliente, 'idCliente'>): Observable<Cliente> {
    return this.http.post<Cliente>(this.apiUrl, cliente);
  }

  update(id: number, cliente: Omit<Cliente, 'idCliente'>): Observable<Cliente> {
    return this.http.put<Cliente>(`${this.apiUrl}/${id}`, cliente);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}