import { Routes } from '@angular/router';
export const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'resumen' },
      {
        path: 'resumen',
        loadComponent: () => import('./resumen/resumen.component').then((m) => m.ResumenComponent),
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
          import('./pages/devolucion/devolucion.component').then((m) => m.DevolucionComponent),
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
          import('./pages/alquiler/alquiler.component').then((m) => m.AlquilerComponent),
      },
      {
        path: 'alquileres',
        loadComponent: () =>
          import('./pages/alquiler/alquiler.component').then((m) => m.AlquilerComponent),
      },
      {
        path: 'detalles-alquiler',
        loadComponent: () =>
          import('./pages/detalle-alquiler/detalle-alquiler.component').then(
            (m) => m.DetalleAlquilerComponent,
          ),
      },
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
        loadComponent: () => import('./pages/rol/rol.component').then((m) => m.RolComponent),
      },
      {
        path: 'usuarios',
        loadComponent: () =>
          import('./pages/usuario/usuario.component').then((m) => m.UsuarioComponent),
      },
    ],
  },
];
