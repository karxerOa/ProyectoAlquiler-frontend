import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import type { Empleado } from '../model/empleado';

type EmpleadoDatos = Omit<
  Empleado,
  'idEmpleado' | 'producciones' | 'mantenimientos' | 'alquileres' | 'devoluciones'
>;

@Service()
export class EmpleadoService {
  private readonly apiUrl = 'http://localhost:9494/v1/empleados';
  private readonly http = inject(HttpClient);

  findAll(): Observable<Empleado[]> {
    return this.http.get<Empleado[]>(this.apiUrl);
  }

  findById(id: number): Observable<Empleado> {
    return this.http.get<Empleado>(`${this.apiUrl}/${id}`);
  }

  create(empleado: EmpleadoDatos): Observable<Empleado> {
    return this.http.post<Empleado>(this.apiUrl, empleado);
  }

  update(id: number, empleado: EmpleadoDatos): Observable<Empleado> {
    return this.http.put<Empleado>(`${this.apiUrl}/${id}`, empleado);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}