import { Routes } from '@angular/router';
import { DevolucionComponent } from './pages/devolucion/devolucion.component';
import { PenalidadComponent } from './pages/penalidad/penalidad.component';

export const routes: Routes = [
  { path: 'devoluciones', component: DevolucionComponent },
  { path: 'penalidades', component: PenalidadComponent },
  { path: '', redirectTo: 'devoluciones', pathMatch: 'full' }
];