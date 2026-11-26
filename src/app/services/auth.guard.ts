import { inject } from '@angular/core';
import { CanActivateChildFn, CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
export const authGuard: CanActivateChildFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.token())
    return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  const personal = route.routeConfig?.path === 'mis-prendas';
  if (!auth.canWrite() && !personal) return router.createUrlTree(['/mis-prendas']);
  if (auth.canWrite() && personal) return router.createUrlTree(['/resumen']);
  if (route.data['admin'] && !auth.isAdmin()) return router.createUrlTree(['/resumen']);
  return true;
};
export const guestGuard: CanActivateFn = () =>
  inject(AuthService).token() ? inject(Router).createUrlTree(['/resumen']) : true;
