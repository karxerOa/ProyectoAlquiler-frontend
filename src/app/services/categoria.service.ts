import { HttpClient } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { Categoria } from '../model/categoria';
import { environment } from '../../environments/environment';

type CategoriaData = Pick<Categoria, 'nombre' | 'descripcion' | 'estado'>;

@Service()
export class CategoriaService {
  private readonly apiUrl = `${environment.apiUrl}/categorias`;
  private readonly http = inject(HttpClient);
  private readonly _categorias = signal<Categoria[]>([]);
  private readonly _message = signal<string>('');

  readonly $categoriasChange = this._categorias.asReadonly();
  readonly $messageChange = this._message.asReadonly();

  findAll() {
    return this.http.get<Categoria[]>(this.apiUrl);
  }

  findById(id: number) {
    return this.http.get<Categoria>(`${this.apiUrl}/${id}`);
  }

  create(categoria: CategoriaData) {
    return this.http.post<Categoria>(this.apiUrl, categoria);
  }

  update(id: number, categoria: CategoriaData) {
    return this.http.put<Categoria>(`${this.apiUrl}/${id}`, categoria);
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  setCategoriasChange(data: Categoria[]): void {
    this._categorias.set(data);
  }

  setMessageChange(message: string): void {
    this._message.set(message);
  }
}
