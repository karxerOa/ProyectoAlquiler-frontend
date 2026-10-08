import type { Alquiler } from './alquiler';
import type { Devolucion } from './devolucion';
import type { Mantenimiento } from './mantenimiento';
import type { Produccion } from './produccion';

export interface Empleado {
  idEmpleado: number;
  nombres: string;
  apellidos: string;
  dni: number;
  telefono: number;
  cargo: string;
  estado: string;
  producciones: Produccion[];
  mantenimientos: Mantenimiento[];
  alquileres: Alquiler[];
  devoluciones: Devolucion[];
}
