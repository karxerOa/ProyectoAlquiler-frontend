export interface Devolucion {
  idDevolucion?: number;
  fechaDevolucion: string;
  estadoPrenda: string;
  observacion: string;
  alquilerId: number;
  empleadoId: number;
}

export function estadoPrendaEnObservacion(
  observacion: string,
  nombrePrenda: string,
  cantidad: number,
): string {
  const prefijo = `${nombrePrenda} (${cantidad}): `;
  const revision = observacion.split('; ').find((parte) => parte.startsWith(prefijo));
  if (!revision) return 'Estado por prenda no detallado';

  const estado = revision.slice(prefijo.length);
  if (estado.startsWith('no requiere mantenimiento')) return 'Recibida · no requiere mantenimiento';
  if (estado.startsWith('requiere mantenimiento')) return 'Recibida · requiere mantenimiento';
  if (estado.startsWith('pendiente de recepción')) return 'Pendiente de recepción';
  return 'Estado por prenda no detallado';
}
