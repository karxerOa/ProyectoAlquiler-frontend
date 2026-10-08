import { Routes } from '@angular/router';
import { AlquilerComponent } from './pages/alquiler-component/alquiler-component';
import { CategoriaComponent } from './pages/categoria-component/categoria-component';
import { ClienteComponent } from './pages/cliente-component/cliente-component';
import { DetalleAlquilerComponent } from './pages/detalle-alquiler-component/detalle-alquiler-component';
import { DevolucionComponent } from './pages/devolucion-component/devolucion-component';
import { EmpleadoComponent } from './pages/empleado-component/empleado-component';
import { MantenimientoComponent } from './pages/mantenimiento-component/mantenimiento-component';
import { PagoComponent } from './pages/pago-component/pago-component';
import { PenalidadComponent } from './pages/penalidad-component/penalidad-component';
import { PrendaComponent } from './pages/prenda-component/prenda-component';
import { ProduccionComponent } from './pages/produccion-component/produccion-component';
import { RolComponent } from './pages/rol-component/rol-component';
import { UsuarioComponent } from './pages/usuario-component/usuario-component';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'clientes' },
  { path: 'alquileres', component: AlquilerComponent },
  { path: 'categorias', component: CategoriaComponent },
  { path: 'clientes', component: ClienteComponent },
  { path: 'detalles-alquiler', component: DetalleAlquilerComponent },
  { path: 'devoluciones', component: DevolucionComponent },
  { path: 'empleados', component: EmpleadoComponent },
  { path: 'mantenimientos', component: MantenimientoComponent },
  { path: 'pagos', component: PagoComponent },
  { path: 'penalidades', component: PenalidadComponent },
  { path: 'prendas', component: PrendaComponent },
  { path: 'producciones', component: ProduccionComponent },
  { path: 'roles', component: RolComponent },
  { path: 'usuarios', component: UsuarioComponent },
];
