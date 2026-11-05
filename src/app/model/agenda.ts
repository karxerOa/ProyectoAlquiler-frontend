import type { Alquiler } from './alquiler';
import { normalizar } from './catalogo';

export function fechaLima(): string {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Lima',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const valor = (tipo: string) => partes.find((p) => p.type === tipo)?.value;
  return `${valor('year')}-${valor('month')}-${valor('day')}`;
}
export function agendaAlquileres(alquileres: Alquiler[], hoy: string) {
  const pendientes = alquileres.filter((a) =>
    ['pendiente', 'reservado', 'activo', 'en curso'].includes(normalizar(a.estado)),
  );
  return {
    entregas: pendientes
      .filter((a) => ['pendiente', 'reservado'].includes(normalizar(a.estado)))
      .sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio)),
    devoluciones: pendientes
      .filter((a) => ['activo', 'en curso'].includes(normalizar(a.estado)))
      .sort((a, b) => a.fechaFin.localeCompare(b.fechaFin)),
    vencidos: pendientes.filter(
      (a) => ['activo', 'en curso'].includes(normalizar(a.estado)) && a.fechaFin.slice(0, 10) < hoy,
    ),
  };
}
