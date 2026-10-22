import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface MantenimientoDTO {
  idMantenimiento?: number;
  fechaInicio: string;
  fechaFin: string;
  tipoMantenimiento: string;
  descripcion: string;
  costo: number;
  estado: string;
  idPrenda: number;
  idEmpleado: number;
}

export interface MantenimientoResponse {
  idMantenimiento: number;
  fechaInicio: string;
  fechaFin: string;
  tipoMantenimiento: string;
  descripcion: string;
  costo: number;
  estado: string;
  prenda: { idPrenda: number; nombre: string };
  empleado: { idEmpleado: number; nombres: string; apellidos: string };
}

export interface PrendaSimple {
  idPrenda: number;
  nombre: string;
}

export interface EmpleadoSimple {
  idEmpleado: number;
  nombres: string;
  apellidos: string;
}

@Injectable({ providedIn: 'root' })
export class MantenimientoService {
  private readonly apiUrl      = 'http://localhost:9494/v1/mantenimientos';
  private readonly prendaUrl   = 'http://localhost:9494/v1/prendas';
  private readonly empleadoUrl = 'http://localhost:9494/v1/empleados';
  private readonly http = inject(HttpClient);

  findAll(): Observable<MantenimientoResponse[]> {
    return this.http.get<MantenimientoResponse[]>(this.apiUrl);
  }

  findById(id: number): Observable<MantenimientoResponse> {
    return this.http.get<MantenimientoResponse>(`${this.apiUrl}/${id}`);
  }

  create(m: MantenimientoDTO): Observable<MantenimientoResponse> {
    return this.http.post<MantenimientoResponse>(this.apiUrl, m);
  }

  update(id: number, m: MantenimientoDTO): Observable<MantenimientoResponse> {
    return this.http.put<MantenimientoResponse>(`${this.apiUrl}/${id}`, m);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getPrendas(): Observable<PrendaSimple[]> {
    return this.http.get<PrendaSimple[]>(this.prendaUrl);
  }

  getEmpleados(): Observable<EmpleadoSimple[]> {
    return this.http.get<EmpleadoSimple[]>(this.empleadoUrl);
  }
}
