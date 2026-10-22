export interface Pago {
  idPago?: number;
  fechaPago: string;
  monto: number;
  metodoPago: string;
  estado: string;
  alquilerId: number;
}
