export interface Alquiler {
  idAlquiler: number;
  fechaAlquiler: string;
  fechaInicio: string;
  fechaFin: string;
  estado: string;
  subtotal: number;
  total: number;
  empleadoId: number;
  clienteId: number;
  nombreEmpleado?: string;
  nombreCliente?: string;
  apellidoCliente?: string;
}
