import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Categoria } from '../model/categoria';
import { environment } from '../../environments/environment';

type CategoriaData = Pick<Categoria, 'nombre' | 'descripcion' | 'estado'>;

@Injectable({
  providedIn: 'root',
})
export class CategoriaService {
  private readonly apiUrl = `${environment.apiUrl}/categorias`;
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
