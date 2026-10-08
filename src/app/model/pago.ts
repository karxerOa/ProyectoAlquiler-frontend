import type { Alquiler } from './alquiler';

export interface Pago {
  idPago: number;
  fechaPago: string;
  monto: number;
  metodoPago: string;
  estado: string;
  alquiler: Alquiler;
}
