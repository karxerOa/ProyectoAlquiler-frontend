import { agendaAlquileres } from './agenda';
import { Alquiler } from './alquiler';
const base: Alquiler = {
  idAlquiler: 1,
  fechaAlquiler: '2026-11-01',
  fechaInicio: '2026-11-03',
  fechaFin: '2026-11-05',
  estado: 'ACTIVO',
  subtotal: 100,
  total: 100,
  clienteId: 1,
  empleadoId: 1,
};
describe('Agenda operativa', () => {
  it('separa reservas, alquileres activos y devoluciones vencidas', () => {
    const agenda = agendaAlquileres(
      [
        base,
        { ...base, idAlquiler: 2, estado: 'RESERVADO' },
        { ...base, idAlquiler: 3, estado: 'INACTIVO' },
        { ...base, idAlquiler: 4, fechaFin: '2026-11-04' },
      ],
      '2026-11-05',
    );
    expect(agenda.entregas.map((a) => a.idAlquiler)).toEqual([2]);
    expect(agenda.devoluciones.map((a) => a.idAlquiler)).toEqual([4, 1]);
    expect(agenda.vencidos.map((a) => a.idAlquiler)).toEqual([4]);
  });
});
