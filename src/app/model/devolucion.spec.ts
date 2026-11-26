import { estadoPrendaEnObservacion } from './devolucion';

describe('Estado por prenda en devolución', () => {
  it('muestra la revisión guardada para cada prenda', () => {
    const observacion =
      'Vestido azul (1): requiere mantenimiento; Saco negro (2): pendiente de recepción. Se observó una mancha.';

    expect(estadoPrendaEnObservacion(observacion, 'Vestido azul', 1)).toBe(
      'Recibida · requiere mantenimiento',
    );
    expect(estadoPrendaEnObservacion(observacion, 'Saco negro', 2)).toBe('Pendiente de recepción');
  });

  it('indica cuando la observación antigua no incluye revisión por prenda', () => {
    expect(estadoPrendaEnObservacion('Prenda dañada', 'Vestido azul', 1)).toBe(
      'Estado por prenda no detallado',
    );
  });
});
