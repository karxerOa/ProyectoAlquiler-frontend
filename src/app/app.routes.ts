import { Routes } from '@angular/router';
import { ClienteComponent } from './pages/cliente/cliente.component'; 
import { EmpleadoComponent } from './pages/empleado/empleado.component';
import { ResumenComponent } from './resumen/resumen.component';
import { DevolucionComponent } from './pages/devolucion/devolucion.component';
import { PenalidadComponent } from './pages/penalidad/penalidad.component';
import { CategoriaComponent } from './pages/categoria/categoria.component';
import { ProduccionComponent } from './pages/produccion/produccion.component';

export const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'resumen' },
      { path: 'resumen', component: ResumenComponent },
      { path: 'empleados', component: EmpleadoComponent },
      { path: 'clientes', component: ClienteComponent },
      { path: 'devoluciones', component: DevolucionComponent },
      { path: 'penalidades', component: PenalidadComponent },
      { path: 'categorias', component: CategoriaComponent },
      { path: 'producciones', component: ProduccionComponent },
      {
        path: 'alquileres',
        loadComponent: () => import('./pages/alquiler/alquiler.component').then(m => m.AlquilerComponent)
      },
      {
        path: 'detalles-alquiler',
        loadComponent: () => import('./pages/detalle-alquiler/detalle-alquiler.component').then(m => m.DetalleAlquilerComponent)
      },
      {
        path: 'mantenimientos',
        loadComponent: () => import('./pages/mantenimiento/mantenimiento.component').then(m => m.MantenimientoComponent)
      },
      {
        path: 'pagos',
        loadComponent: () => import('./pages/pago/pago.component').then(m => m.PagoComponent)
      },
      {
        path: 'prendas',
        loadComponent: () => import('./pages/prenda/prenda.component').then(m => m.PrendaComponent)
      },
      {
        path: 'roles',
        loadComponent: () => import('./pages/rol/rol.component').then(m => m.RolComponent)
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./pages/usuario/usuario.component').then(m => m.UsuarioComponent)
      },

    ],
  },
];
