import { inject, Service, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs';
import type { Empleado } from '../model/empleado';
import { environment } from '../../environments/environment';

type DatosEmpleado = Pick<
  Empleado,
  'nombres' | 'apellidos' | 'dni' | 'telefono' | 'cargo' | 'estado'
>;
export type NuevoEmpleado = DatosEmpleado & { username: string; password: string };
export type ActualizarEmpleado = DatosEmpleado & { username: string; password?: string };

interface EmpleadoApi extends Empleado {
  password?: unknown;
}

function sinPassword(empleado: EmpleadoApi): Empleado {
  const { password, ...datos } = empleado;
  void password;
  return datos;
}

@Service()
export class EmpleadoService {
  private readonly apiUrl = `${environment.apiUrl}/empleados`;
  private readonly http = inject(HttpClient);
  private readonly _empleados = signal<Empleado[]>([]);

  readonly $empleadosChange = this._empleados.asReadonly();

  findAll() {
    return this.http
      .get<EmpleadoApi[]>(this.apiUrl)
      .pipe(map((empleados) => empleados.map(sinPassword)));
  }

  findById(id: number) {
    return this.http.get<EmpleadoApi>(`${this.apiUrl}/${id}`).pipe(map(sinPassword));
  }

  findMe() {
    return this.http.get<EmpleadoApi>(`${this.apiUrl}/me`).pipe(map(sinPassword));
  }

  create(empleado: NuevoEmpleado) {
    return this.http.post<EmpleadoApi>(this.apiUrl, empleado).pipe(map(sinPassword));
  }

  update(id: number, empleado: ActualizarEmpleado) {
    return this.http.put<EmpleadoApi>(`${this.apiUrl}/${id}`, empleado).pipe(map(sinPassword));
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  setEmpleadosChange(data: Empleado[]): void {
    this._empleados.set(data);
  }
}
