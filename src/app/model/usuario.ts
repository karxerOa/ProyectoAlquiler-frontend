import type { Rol } from './rol';

export interface Usuario {
  idUser: number;
  username: string;
  password: string;
  enabled: boolean;
  rol: Rol;
}
