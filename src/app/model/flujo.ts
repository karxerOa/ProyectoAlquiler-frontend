import { normalizar } from './catalogo';
import { Alquiler } from './alquiler';
import { Cliente } from './cliente';
export const prendaActiva = (estado: string) =>
  !['inactivo', 'inactiva'].includes(normalizar(estado));
export const alquilerEditable = (a: Alquiler) =>
  ['pendiente', 'reservado'].includes(normalizar(a.estado));
export const alquilerEnCurso = (a: Alquiler) =>
  ['activo', 'en curso'].includes(normalizar(a.estado));
export const dniTexto = (dni: number | string) => String(dni).padStart(8, '0');
export function clientePorDni(clientes: Cliente[], dni: string): Cliente | undefined {
  return /^\d{8}$/.test(dni) ? clientes.find((c) => dniTexto(c.dni) === dni) : undefined;
}
