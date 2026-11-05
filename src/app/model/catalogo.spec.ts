import { coincidePrenda, filtrosIniciales, indexarPrenda } from './catalogo';
import { Prenda } from './prenda';
const prenda: Prenda = {
  idPrenda: 1,
  nombre: 'Vestido Élite',
  descripcion: 'Gala',
  talla: 'M',
  color: 'Azul',
  estado: 'DISPONIBLE ',
  categoriaId: 2,
  precioAlquiler: 150,
};
describe('Búsqueda de catálogo', () => {
  it('ignora acentos, espacios y mayúsculas en el nombre', () => {
    expect(coincidePrenda(indexarPrenda(prenda), '  ELITE ', filtrosIniciales())).toBe(true);
  });
  it('combina todos los filtros con límites de precio inclusivos', () => {
    const filtros = {
      ...filtrosIniciales(),
      categoria: '2',
      talla: 'm',
      color: 'azul',
      estado: 'disponible',
      genero: 'sin especificar',
      minimo: 150,
      maximo: 150,
    };
    expect(coincidePrenda(indexarPrenda(prenda), 'vestido', filtros)).toBe(true);
    expect(coincidePrenda(indexarPrenda(prenda), '', { ...filtros, color: 'rojo' })).toBe(false);
    expect(coincidePrenda(indexarPrenda(prenda), '', { ...filtros, maximo: 149 })).toBe(false);
  });
  it('no inventa género ni acepta un rango invertido', () => {
    expect(
      coincidePrenda(indexarPrenda(prenda), '', { ...filtrosIniciales(), genero: 'femenino' }),
    ).toBe(false);
    expect(
      coincidePrenda(indexarPrenda(prenda), '', {
        ...filtrosIniciales(),
        minimo: 200,
        maximo: 100,
      }),
    ).toBe(false);
  });
});
