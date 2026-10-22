export interface Mantenimiento {
  idMantenimiento: number;
  fechaInicio: string;
  fechaFin: string;
  tipoMantenimiento: string;
  descripcion: string;
  costo: number;
  estado: string;
  prendaId: number;
  empleadoId: number;
}
