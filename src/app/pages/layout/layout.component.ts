import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { ReferenciasService } from '../../services/referencias.service';
import { AuthService } from '../../services/auth.service';
import { MATERIAL } from '../../shared/material';
@Component({
  imports: [...MATERIAL, RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-layout',
  standalone: true,
  providers: [ReferenciasService],
  styleUrl: './layout.component.css',
  templateUrl: './layout.component.html',
})
export class LayoutComponent {
  readonly ref = inject(ReferenciasService);
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  readonly mobile = signal(false);
  readonly query = signal('');
  readonly settings = signal(false);
  readonly current = signal(this.router.url);
  readonly groups = [
    {
      label: 'PRINCIPAL',
      items: [
        { label: 'Dashboard', path: '/resumen', icon: 'dashboard' },
        { label: 'Alquileres', path: '/alquileres', icon: 'receipt_long' },
        { label: 'Devoluciones', path: '/devoluciones', icon: 'undo' },
      ],
    },
    {
      label: 'GESTIÓN',
      items: [
        { label: 'Clientes', path: '/clientes', icon: 'group' },
        { label: 'Vestimentas', path: '/prendas', icon: 'checkroom' },
        { label: 'Categorías', path: '/categorias', icon: 'format_list_bulleted' },
      ],
    },
    {
      label: 'ADMINISTRACIÓN',
      items: [
        { label: 'Personal', path: '/empleados', icon: 'person' },
        { label: 'Usuarios', path: '/usuarios', icon: 'manage_accounts' },
        { label: 'Roles', path: '/roles', icon: 'shield' },
        { label: 'Reportes', path: '/reportes', icon: 'bar_chart' },
      ],
    },
    {
      label: 'OPERACIONES',
      items: [
        { label: 'Pagos', path: '/pagos', icon: 'payments' },
        { label: 'Penalidades', path: '/penalidades', icon: 'warning' },
        { label: 'Mantenimientos', path: '/mantenimientos', icon: 'build' },
        { label: 'Producción', path: '/producciones', icon: 'precision_manufacturing' },
      ],
    },
  ];
  readonly links = this.groups.flatMap((g) => g.items);
  readonly results = computed(() =>
    this.query().trim()
      ? this.links.filter(
          (x) => this.visible(x.path) && x.label.toLowerCase().includes(this.query().toLowerCase()),
        )
      : [],
  );
  readonly title = computed(() =>
    this.current().startsWith('/alquileres/nuevo')
      ? 'Nuevo alquiler'
      : (this.links.find((x) => this.current().split('?')[0] === x.path)?.label ?? 'Gestión'),
  );
  visible(path: string): boolean {
    return !['/usuarios', '/roles'].includes(path) || this.auth.isAdmin();
  }
  constructor() {
    this.ref.cargar();
    this.router.events
      .pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => {
        this.current.set(this.router.url);
        this.mobile.set(false);
        this.query.set('');
      });
  }
}
