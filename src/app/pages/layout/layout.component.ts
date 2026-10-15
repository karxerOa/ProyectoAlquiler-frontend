import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

// Rutas SVG simples (estilo Lucide, viewBox 24x24)
const ICON = {
  grid: 'M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z',
  calendar: 'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z',
  shirt: 'M20.4 5.6 16 3a4 4 0 0 1-8 0L3.6 5.6 2 10l4 1.5V21h12v-9.5l4-1.5z',
  users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8',
  undo: 'M3 7v6h6M3 13a9 9 0 1 0 3-6.7',
  card: 'M2 6h20v12H2zM2 10h20',
  tool: 'M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.4-.6-.6-2.4z',
  alert: 'M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z',
  list: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
  tag: 'M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L2 12V2h10l8.6 8.6a2 2 0 0 1 0 2.8zM7 7h.01',
  factory: 'M2 20V8l6 4V8l6 4V4h8v16zM6 16h2M12 16h2M18 16h2',
  shield: 'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z',
};

@Component({
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-layout',
  standalone: true,
  styleUrl: './layout.component.css',
  templateUrl: './layout.component.html',
})
export class LayoutComponent {
  protected readonly navigation = [
    { label: 'Resumen', path: '/resumen', icon: ICON.grid },
    { label: 'Alquileres', path: '/alquileres', icon: ICON.calendar },
    { label: 'Prendas', path: '/prendas', icon: ICON.shirt },
    { label: 'Categorías', path: '/categorias', icon: ICON.tag },
    { label: 'Clientes', path: '/clientes', icon: ICON.users },
    { label: 'Detalles de alquiler', path: '/detalles-alquiler', icon: ICON.list },
    { label: 'Devoluciones', path: '/devoluciones', icon: ICON.undo },
    { label: 'Pagos', path: '/pagos', icon: ICON.card },
    { label: 'Penalidades', path: '/penalidades', icon: ICON.alert },
    { label: 'Mantenimientos', path: '/mantenimientos', icon: ICON.tool },
    { label: 'Producción', path: '/producciones', icon: ICON.factory },
    { label: 'Empleados', path: '/empleados', icon: ICON.user },
    { label: 'Roles', path: '/roles', icon: ICON.shield },
    { label: 'Usuarios', path: '/usuarios', icon: ICON.users },
  ];
}