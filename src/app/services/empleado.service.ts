import { inject, Service, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Empleado } from '../model/empleado';
import { environment } from '../../environments/environment';

type EmpleadoDatos = Omit<
  Empleado,
  'idEmpleado' | 'producciones' | 'mantenimientos' | 'alquileres' | 'devoluciones'
>;

@Service()
export class EmpleadoService {
  private readonly apiUrl = `${environment.apiUrl}/empleados`;
  private readonly http = inject(HttpClient);
  private readonly _empleados = signal<Empleado[]>([]);

  readonly $empleadosChange = this._empleados.asReadonly();

  findAll() {
    return this.http.get<Empleado[]>(this.apiUrl);
  }

  findById(id: number) {
    return this.http.get<Empleado>(`${this.apiUrl}/${id}`);
  }

  create(empleado: EmpleadoDatos) {
    return this.http.post<Empleado>(this.apiUrl, empleado);
  }

  update(id: number, empleado: EmpleadoDatos) {
    return this.http.put<Empleado>(`${this.apiUrl}/${id}`, empleado);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  setEmpleadosChange(data: Empleado[]): void {
    this._empleados.set(data);
  }
}