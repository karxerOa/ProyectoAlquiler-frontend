import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
import { AuthService, authUrl } from './auth.service';
import { environment } from '../../environments/environment';
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const isApi =
    request.url === environment.apiUrl || request.url.startsWith(environment.apiUrl + '/');
  const token = auth.token();
  const authenticated = isApi && request.url !== authUrl && token;
  return next(
    authenticated ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : request,
  ).pipe(
    catchError((error: unknown) => {
      if (
        isApi &&
        error instanceof HttpErrorResponse &&
        error.status === 401 &&
        token === auth.token()
      )
        auth.logout(true);
      return throwError(() => error);
    }),
  );
};
