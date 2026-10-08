import type { Empleado } from './empleado';
import type { Prenda } from './prenda';

export interface Mantenimiento {
  idMantenimiento: number;
  fechaInicio: string;
  fechaFin: string;
  tipoMantenimiento: string;
  descripcion: string;
  costo: number;
  estado: string;
  prenda: Prenda;
  empleado: Empleado;
}
