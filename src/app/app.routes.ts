import { Routes } from '@angular/router';

import { ClienteComponent } from './pages/cliente/cliente.component'; 
import { EmpleadoComponent } from './pages/empleado/empleado.component';
import { ResumenComponent } from './resumen/resumen.component';


export const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'resumen' },
      { path: 'resumen', component: ResumenComponent },
      { path: 'empleados', component: EmpleadoComponent },
      { path: 'clientes', component: ClienteComponent },

    ],
  },
];


