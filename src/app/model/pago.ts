export interface Pago {
  idPago?: number;
  fechaPago: string;
  monto: number;
  metodoPago: string;
  estado: string;
  alquilerId: number;
}

export function pagoCobrado(pago: Pago): boolean {
  return !['ANULADO', 'PENDIENTE'].includes(pago.estado.trim().toUpperCase());
}

export function saldoAlquiler(total: number, pagosCobrados: Pago[], alquilerId: number): number {
  const cobrado = pagosCobrados
    .filter((pago) => pago.alquilerId === alquilerId)
    .reduce((centimos, pago) => centimos + Math.round(pago.monto * 100), 0);
  return Math.max(0, Math.round(total * 100) - cobrado) / 100;
}
