import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { Observable } from 'rxjs';
import { Categoria } from '../model/categoria';

type CategoriaData = Pick<Categoria, 'nombre' | 'descripcion' | 'estado'>;

@Service()
export class CategoriaService {
  private readonly apiUrl = 'http://localhost:8080/v1/categorias';
  private readonly http = inject(HttpClient);

  findAll(): Observable<Categoria[]> {
    return this.http.get<Categoria[]>(this.apiUrl);
  }

  findById(id: number): Observable<Categoria> {
    return this.http.get<Categoria>(`${this.apiUrl}/${id}`);
  }

  create(categoria: CategoriaData): Observable<Categoria> {
    return this.http.post<Categoria>(this.apiUrl, categoria);
  }

  update(id: number, categoria: CategoriaData): Observable<Categoria> {
    return this.http.put<Categoria>(`${this.apiUrl}/${id}`, categoria);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
