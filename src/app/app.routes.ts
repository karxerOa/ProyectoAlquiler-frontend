import { Routes } from '@angular/router';

import { LayoutComponent } from './pages/layout/layout.component';
import { ClienteComponent } from './pages/cliente/cliente.component';
import { EmpleadoComponent } from './pages/empleado/empleado.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'clientes' },
    ]
  },
  { path: 'clientes', component: ClienteComponent },
  { path: 'empleados', component: EmpleadoComponent },

];
