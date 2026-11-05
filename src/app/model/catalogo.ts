import type { Prenda } from './prenda';

export const normalizar = (valor: string | null | undefined): string =>
  (valor ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toLocaleLowerCase('es');

export interface FiltrosCatalogo {
  categoria: string;
  talla: string;
  color: string;
  estado: string;
  genero: string;
  minimo: number | null;
  maximo: number | null;
}
export const filtrosIniciales = (): FiltrosCatalogo => ({
  categoria: '',
  talla: '',
  color: '',
  estado: '',
  genero: '',
  minimo: null,
  maximo: null,
});
export function indexarPrenda(prenda: Prenda) {
  return {
    prenda,
    nombre: normalizar(prenda.nombre),
    categoria: String(prenda.categoriaId),
    talla: normalizar(prenda.talla),
    color: normalizar(prenda.color),
    estado: normalizar(prenda.estado),
    genero: normalizar(prenda.genero) || 'sin especificar',
  };
}
export function coincidePrenda(
  item: ReturnType<typeof indexarPrenda>,
  nombre: string,
  filtros: FiltrosCatalogo,
): boolean {
  return (
    item.nombre.includes(normalizar(nombre)) &&
    (['categoria', 'talla', 'color', 'estado', 'genero'] as const).every(
      (campo) => !filtros[campo] || item[campo] === normalizar(filtros[campo]),
    ) &&
    (filtros.minimo === null || item.prenda.precioAlquiler >= filtros.minimo) &&
    (filtros.maximo === null || item.prenda.precioAlquiler <= filtros.maximo)
  );
}
