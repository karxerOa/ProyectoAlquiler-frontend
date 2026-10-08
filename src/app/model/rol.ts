import type { Usuario } from './usuario';

export interface Rol {
  idRol: number;
  name: string;
  description: string;
  usuarios: Usuario[];
}
