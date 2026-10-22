import type { Alquiler } from './alquiler';
import type { Empleado } from './empleado';
import type { Penalidad } from './penalidad';

export interface Devolucion {
  idDevolucion?: number;
  fechaDevolucion: string;
  estadoPrenda: string;
  observacion: string;
  alquiler: Alquiler;
  empleado: Empleado;
  penalidades: Penalidad[];
}
