import type { Categoria } from './categoria';
import type { DetalleAlquiler } from './detalle-alquiler';
import type { Mantenimiento } from './mantenimiento';
import type { Produccion } from './produccion';

export interface Prenda {
  idPrenda: number;
  nombre: string;
  descripcion: string;
  talla: string;
  color: string;
  precioAlquiler: number;
  estado: string;
  categoria: Categoria;
  producciones: Produccion[];
  mantenimientos: Mantenimiento[];
  detallesAlquiler: DetalleAlquiler[];
}
