import { Component, computed, inject, signal } from '@angular/core';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { ReferenciasService } from '../../services/referencias.service';
import { AuthService } from '../../services/auth.service';
import { EmpleadoService } from '../../services/empleado.service';
import { HttpErrorResponse } from '@angular/common/http';
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
  private readonly empleadoService = inject(EmpleadoService);
  private readonly router = inject(Router);
  readonly mobile = signal(false);
  readonly query = signal('');
  readonly settings = signal(false);
  readonly empleadoNombre = signal('');
  readonly cargandoEmpleado = signal(false);
  readonly errorEmpleado = signal('');
  readonly current = signal(this.router.url);
  private readonly empleadoPaths = new Set([
    '/resumen',
    '/alquileres',
    '/alquileres/nuevo',
    '/clientes',
    '/prendas',
    '/devoluciones',
    '/pagos',
    '/penalidades',
    '/mantenimientos',
  ]);
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
  readonly links = computed(() => this.groups.flatMap((g) => g.items));
  readonly results = computed(() =>
    this.query().trim()
      ? this.links().filter(
          (x) => this.visible(x.path) && x.label.toLowerCase().includes(this.query().toLowerCase()),
        )
      : [],
  );
  readonly title = computed(() =>
    this.current().startsWith('/alquileres/nuevo')
      ? 'Nuevo alquiler'
      : (this.links().find((x) => this.current().split('?')[0] === x.path)?.label ?? 'Gestión'),
  );
  visible(path: string): boolean {
    return this.auth.isAdmin() || this.empleadoPaths.has(path);
  }
  hasVisibleItems(items: { path: string }[]): boolean {
    return items.some((item) => this.visible(item.path));
  }
  abrirConfiguracion(): void {
    this.settings.set(true);
    this.empleadoNombre.set('');
    this.errorEmpleado.set('');
    if (this.auth.isAdmin()) return;

    this.cargandoEmpleado.set(true);
    this.empleadoService.findMe().subscribe({
      next: (empleado) => {
        this.empleadoNombre.set(`${empleado.nombres} ${empleado.apellidos}`.trim());
        this.cargandoEmpleado.set(false);
      },
      error: (error: HttpErrorResponse) => {
        this.errorEmpleado.set(
          error.status === 404
            ? 'No se encontró una ficha de empleado vinculada a esta cuenta.'
            : 'No se pudo cargar el nombre del empleado. Intenta abrir esta sección nuevamente.',
        );
        this.cargandoEmpleado.set(false);
      },
    });
  }
  constructor() {
    if (this.auth.canWrite()) this.ref.cargar();
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
