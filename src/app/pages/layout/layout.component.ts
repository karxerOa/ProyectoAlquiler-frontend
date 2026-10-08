import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-layout',
  standalone: true,
  styleUrl: './layout.component.css',
  templateUrl: './layout.component.html',
})
export class LayoutComponent {
  protected readonly navigation = [
    { label: 'Alquileres', path: '/alquileres' },
    { label: 'Categorías', path: '/categorias' },
    { label: 'Clientes', path: '/clientes' },
    { label: 'Detalles de alquiler', path: '/detalles-alquiler' },
    { label: 'Devoluciones', path: '/devoluciones' },
    { label: 'Empleados', path: '/empleados' },
    { label: 'Mantenimientos', path: '/mantenimientos' },
    { label: 'Pagos', path: '/pagos' },
    { label: 'Penalidades', path: '/penalidades' },
    { label: 'Prendas', path: '/prendas' },
    { label: 'Producción', path: '/producciones' },
    { label: 'Roles', path: '/roles' },
    { label: 'Usuarios', path: '/usuarios' },
  ];
}
