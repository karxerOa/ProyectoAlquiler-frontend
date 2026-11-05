import { clientePorDni, prendaActiva, alquilerEditable, dniTexto } from './flujo';
import { Cliente } from './cliente';
describe('Identificación y disponibilidad', () => {
  it('preserva ceros iniciales del DNI recibido como número', () => {
    expect(dniTexto(123456)).toBe('00123456');
  });
  it('encuentra por DNI exacto y nunca por coincidencia parcial', () => {
    const c = { idCliente: 50, nombre: 'Ana', apellidos: 'Ríos', dni: 123456 } as Cliente;
    expect(clientePorDni([c], '00123456')).toBe(c);
    expect(clientePorDni([c], '123456')).toBeUndefined();
  });
  it('excluye prendas inactivas sin confundirlas con las alquiladas', () => {
    expect(prendaActiva(' INACTIVA ')).toBe(false);
    expect(prendaActiva('INACTIVO')).toBe(false);
    expect(prendaActiva('ALQUILADO')).toBe(true);
  });
});
