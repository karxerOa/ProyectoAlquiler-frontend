import type { Alquiler } from './alquiler';

export interface Cliente {
  idCliente: number;
  nombre: string;
  apellidos: string;
  dni: number;
  telefono: number;
  direccion: string;
  correo: string;
  alquileres: Alquiler[];
}
