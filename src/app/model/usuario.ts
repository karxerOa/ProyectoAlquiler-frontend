export interface Usuario {
  idUser: number;
  username: string;
  password: string;
  enabled: boolean;
  rolId: number;
  name?: string;
}
