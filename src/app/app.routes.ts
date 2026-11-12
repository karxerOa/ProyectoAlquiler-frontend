import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './services/auth.guard';
export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login/login.component').then((m) => m.LoginComponent),
  },
  {
    path: '',
    loadComponent: () => import('./pages/layout/layout.component').then((m) => m.LayoutComponent),
    canActivateChild: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'resumen' },
      {
        path: 'resumen',
        loadComponent: () => import('./resumen/resumen.component').then((m) => m.ResumenComponent),
      },
      {
        path: 'reportes',
        loadComponent: () =>
          import('./pages/pago/reportes.component').then((m) => m.ReportesComponent),
      },
      {
        path: 'empleados',
        loadComponent: () =>
          import('./pages/empleado/empleado.component').then((m) => m.EmpleadoComponent),
      },
      {
        path: 'clientes',
        loadComponent: () =>
          import('./pages/cliente/cliente.component').then((m) => m.ClienteComponent),
      },
      {
        path: 'devoluciones',
        loadComponent: () =>
          import('./pages/devolucion/devoluciones-page.component').then(
            (m) => m.DevolucionesPageComponent,
          ),
      },
      {
        path: 'penalidades',
        loadComponent: () =>
          import('./pages/penalidad/penalidad.component').then((m) => m.PenalidadComponent),
      },
      {
        path: 'categorias',
        loadComponent: () =>
          import('./pages/categoria/categoria.component').then((m) => m.CategoriaComponent),
      },
      {
        path: 'producciones',
        loadComponent: () =>
          import('./pages/produccion/produccion.component').then((m) => m.ProduccionComponent),
      },
      {
        path: 'alquileres/nuevo',
        loadComponent: () =>
          import('./pages/alquiler/alquiler-wizard.component').then(
            (m) => m.AlquilerWizardComponent,
          ),
      },
      {
        path: 'alquileres',
        loadComponent: () =>
          import('./pages/alquiler/alquiler.component').then((m) => m.AlquilerComponent),
      },
      { path: 'detalles-alquiler', redirectTo: 'alquileres', pathMatch: 'full' },
      {
        path: 'mantenimientos',
        loadComponent: () =>
          import('./pages/mantenimiento/mantenimiento.component').then(
            (m) => m.MantenimientoComponent,
          ),
      },
      {
        path: 'pagos',
        loadComponent: () => import('./pages/pago/pago.component').then((m) => m.PagoComponent),
      },
      {
        path: 'prendas',
        loadComponent: () =>
          import('./pages/prenda/prenda.component').then((m) => m.PrendaComponent),
      },
      {
        path: 'roles',
        data: { admin: true },
        loadComponent: () => import('./pages/rol/rol.component').then((m) => m.RolComponent),
      },
      {
        path: 'usuarios',
        data: { admin: true },
        loadComponent: () =>
          import('./pages/usuario/usuario.component').then((m) => m.UsuarioComponent),
      },
    ],
  },
  { path: '**', redirectTo: 'resumen' },
];
