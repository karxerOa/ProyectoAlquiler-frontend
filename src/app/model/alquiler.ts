import type { Cliente } from './cliente';
import type { DetalleAlquiler } from './detalle-alquiler';
import type { Devolucion } from './devolucion';
import type { Empleado } from './empleado';
import type { Pago } from './pago';

export interface Alquiler {
  idAlquiler: number;
  fechaAlquiler: string;
  fechaInicio: string;
  fechaFin: string;
  estado: string;
  subtotal: number;
  total: number;
  detalles: DetalleAlquiler[];
  pagos: Pago[];
  devoluciones: Devolucion[];
  empleado: Empleado;
  cliente: Cliente;
}
