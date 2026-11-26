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
  genero?: string;
  imagen?: string | null;
}

export type PrendaData = Omit<Prenda, 'idPrenda' | 'categoriaNombre' | 'genero'>;
