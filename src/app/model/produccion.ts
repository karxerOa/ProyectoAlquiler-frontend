import type { Empleado } from './empleado';
import type { Prenda } from './prenda';

export interface Produccion {
  idProduccion: number;
  fechaProduccion: string;
  cantidad: number;
  costoProduccion: number;
  descripcion: string;
  prenda: Prenda;
  empleado: Empleado;
}
