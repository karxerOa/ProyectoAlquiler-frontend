import { ReferenciasService } from '../services/referencias.service';
import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AlquilerService } from '../services/alquiler.service';
import { PagoService } from '../services/pago.service';
import { AuthService } from '../services/auth.service';
import { Alquiler } from '../model/alquiler';
import { Pago } from '../model/pago';
import { agendaAlquileres, fechaLima } from '../model/agenda';
import { normalizar } from '../model/catalogo';
import { MATERIAL } from '../shared/material';
@Component({
  selector: 'app-resumen',
  standalone: true,
  imports: [...MATERIAL, RouterLink, CurrencyPipe],
  styleUrls: ['../shared/gestion.css', './resumen.component.css'],
  templateUrl: './resumen.component.html',
})
export class ResumenComponent {
  readonly ref = inject(ReferenciasService);
  readonly auth = inject(AuthService);
  private readonly servicio = inject(AlquilerService);
  private readonly pagoService = inject(PagoService);
  readonly alquileres = signal<Alquiler[]>([]);
  readonly pagos = signal<Pago[]>([]);
  readonly error = signal('');
  readonly cargando = signal(true);
  readonly busqueda = signal('');
  readonly filtro = signal('todos');
  readonly periodo = signal(7);
  readonly hoy = fechaLima();
  readonly fecha = new Intl.DateTimeFormat('es-PE', {
    dateStyle: 'medium',
    timeZone: 'America/Lima',
  }).format(new Date());
  readonly agenda = computed(() =>
    agendaAlquileres(
      this.alquileres().filter((a) => !this.devuelto(a)),
      this.hoy,
    ),
  );
  readonly ingresos = computed(() =>
    this.pagos()
      .filter(
        (p) =>
          p.fechaPago.slice(0, 10) === this.hoy &&
          !['ANULADO', 'PENDIENTE'].includes(p.estado.toUpperCase()),
      )
      .reduce((n, p) => n + p.monto, 0),
  );
  readonly disponibles = computed(
    () => this.ref.prendas().filter((p) => p.estado.toUpperCase() === 'DISPONIBLE').length,
  );
  readonly mantenimiento = computed(
    () => this.ref.prendas().filter((p) => p.estado.toUpperCase().includes('MANTENIMIENTO')).length,
  );
  readonly devolverHoy = computed(() =>
    this.agenda().devoluciones.filter((a) => a.fechaFin.slice(0, 10) === this.hoy),
  );
  readonly visibles = computed(() =>
    this.alquileres()
      .filter((a) =>
        normalizar(this.ref.cliente(a.clienteId) + ' ' + a.idAlquiler).includes(
          normalizar(this.busqueda()),
        ),
      )
      .filter(
        (a) =>
          this.filtro() === 'todos' ||
          (this.filtro() === 'hoy' ? this.devolverHoy() : this.agenda().vencidos).some(
            (x) => x.idAlquiler === a.idAlquiler,
          ),
      )
      .sort((a, b) => b.idAlquiler - a.idAlquiler)
      .slice(0, 5),
  );
  readonly series = computed(() => {
    const days = Array.from({ length: this.periodo() }, (_, i) => {
      const d = new Date(this.hoy + 'T12:00:00');
      d.setDate(d.getDate() - this.periodo() + 1 + i);
      const date = d.toISOString().slice(0, 10);
      return {
        date,
        label: d.toLocaleDateString('es-PE', { weekday: 'short', day: 'numeric' }),
        alquileres: this.alquileres().filter((a) => a.fechaAlquiler.slice(0, 10) === date).length,
        devoluciones: this.ref.devoluciones().filter((a) => a.fechaDevolucion.slice(0, 10) === date)
          .length,
      };
    });
    const max = Math.max(1, ...days.flatMap((d) => [d.alquileres, d.devoluciones]));
    return days.map((d) => ({
      ...d,
      height: Math.round((d.alquileres / max) * 100),
      returnsHeight: Math.round((d.devoluciones / max) * 100),
    }));
  });
  readonly totalPeriodo = computed(() => this.series().reduce((n, d) => n + d.alquileres, 0));
  devuelto(a: Alquiler): boolean {
    return this.ref
      .devoluciones()
      .some((d) => d.alquilerId === a.idAlquiler && d.estadoPrenda !== 'INCOMPLETO');
  }
  estado(a: Alquiler): string {
    return this.devuelto(a)
      ? 'Devuelto'
      : this.agenda().vencidos.some((x) => x.idAlquiler === a.idAlquiler)
        ? 'Vencido'
        : a.estado;
  }
  prendas(a: Alquiler): number {
    return this.ref
      .detalles()
      .filter((d) => d.alquilerId === a.idAlquiler)
      .reduce((n, d) => n + d.cantidad, 0);
  }
  constructor() {
    this.cargar();
  }
  cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.servicio.findAll().subscribe({
      next: (data) => {
        this.alquileres.set(data);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudo cargar el resumen.');
        this.cargando.set(false);
      },
    });
    this.pagoService
      .findAll()
      .subscribe({
        next: (p) => this.pagos.set(p),
        error: () =>
          this.error.set(
            'No se pudieron cargar los pagos. Reintenta para actualizar los ingresos.',
          ),
      });
  }
}
