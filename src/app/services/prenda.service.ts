import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface PrendaDTO {
  idPrenda?: number;
  nombre: string;
  descripcion: string;
  talla: string;
  color: string;
  precioAlquiler: number;
  estado: string;
  idCategoria: number;
}

export interface PrendaResponse {
  idPrenda: number;
  nombre: string;
  descripcion: string;
  talla: string;
  color: string;
  precioAlquiler: number;
  estado: string;
  categoria: { idCategoria: number; nombre: string };
}

export interface CategoriaSimple {
  idCategoria: number;
  nombre: string;
}

@Injectable({ providedIn: 'root' })
export class PrendaService {
  private readonly apiUrl = 'http://localhost:9494/v1/prendas';
  private readonly catUrl = 'http://localhost:9494/v1/categorias';
  private readonly http = inject(HttpClient);

  findAll(): Observable<PrendaResponse[]> {
    return this.http.get<PrendaResponse[]>(this.apiUrl);
  }

  findById(id: number): Observable<PrendaResponse> {
    return this.http.get<PrendaResponse>(`${this.apiUrl}/${id}`);
  }

  create(prenda: PrendaDTO): Observable<PrendaResponse> {
    return this.http.post<PrendaResponse>(this.apiUrl, prenda);
  }

  update(id: number, prenda: PrendaDTO): Observable<PrendaResponse> {
    return this.http.put<PrendaResponse>(`${this.apiUrl}/${id}`, prenda);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getCategorias(): Observable<CategoriaSimple[]> {
    return this.http.get<CategoriaSimple[]>(this.catUrl);
  }
}
