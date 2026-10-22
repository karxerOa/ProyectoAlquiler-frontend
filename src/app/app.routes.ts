import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'alquileres',
    loadComponent: () =>
      import('./pages/Alquiler/Alquiler.component').then(
        (component) => component.AlquilerComponent,
      ),
  },
  {
    path: 'detalles-alquiler',
    loadComponent: () =>
      import('./pages/DetalleAlquiler/DetalleAlquiler').then(
        (component) => component.DetalleAlquilerComponent,
      ),
  },
];
