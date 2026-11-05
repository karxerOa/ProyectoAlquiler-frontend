export interface Prenda {
  idPrenda: number;
  nombre: string;
  descripcion: string;
  talla: string;
  color: string;
  precioAlquiler: number;
  estado: string;
  categoriaId: number;
  categoriaNombre?: string;
  /** Optional API metadata; legacy records remain explicitly unspecified. */
  genero?: string;
}

export type PrendaData = Omit<Prenda, 'idPrenda' | 'categoriaNombre' | 'genero'>;
