import type { Prenda } from './prenda';

export interface Categoria {
  idCategoria: number;
  nombre: string;
  descripcion: string;
  estado: string;
  prendas: Prenda[];
}
