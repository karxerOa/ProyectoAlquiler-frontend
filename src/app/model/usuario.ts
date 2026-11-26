export interface Usuario {
  idUser: number;
  username: string;
  enabled: boolean;
  rolId: number;
  clienteId?: number | null;
  name?: string;
}
