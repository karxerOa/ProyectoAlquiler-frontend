import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export abstract class ApiResourceService<T> {
  private readonly resourceUrl: string;

  protected constructor(
    protected readonly http: HttpClient,
    resourcePath: string,
  ) {
    this.resourceUrl = `${environment.apiUrl}/${resourcePath}`;
  }

  getAll(): Observable<T[]> {
    return this.http.get<T[]>(this.resourceUrl);
  }

  getById(id: number): Observable<T> {
    return this.http.get<T>(`${this.resourceUrl}/${id}`);
  }

  create(resource: T): Observable<T> {
    return this.http.post<T>(this.resourceUrl, resource);
  }

  update(id: number, resource: T): Observable<T> {
    return this.http.put<T>(`${this.resourceUrl}/${id}`, resource);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.resourceUrl}/${id}`);
  }
}
