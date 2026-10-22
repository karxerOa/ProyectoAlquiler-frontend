export interface Penalidad {
  idPenalidad?: number;
  tipo_penalidad: string;
  descripcion: string;
  monto: number;
  fecha_penalidad: string;
  estado: boolean;
  devolucionId: number;
}
