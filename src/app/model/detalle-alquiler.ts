import type { Alquiler } from './alquiler';
import type { Prenda } from './prenda';

export interface DetalleAlquiler {
  idDetalle: number;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  alquiler: Alquiler;
  prenda: Prenda;
}
