import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MATERIAL } from '../../shared/material';
import { ReferenciasService } from '../../services/referencias.service';
import { PagoService } from '../../services/pago.service';
import { Pago } from '../../model/pago';
@Component({
  selector: 'app-reportes',
  standalone: true,
  imports: [...MATERIAL, CurrencyPipe, RouterLink],
  styleUrl: '../../shared/gestion.css',
  styles: [
    `
      .report-metrics {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
        gap: 16px;
      }
      .report-metrics mat-card {
        padding: 24px;
        gap: 16px;
      }
      .report-metrics strong {
        font-size: 26px;
      }
      .report-metrics small {
        color: var(--muted);
      }
    `,
  ],
  template: ` <div class="page-container">
    <header class="page-header">
      <div>
        <p class="eyebrow">GESTIÓN DE VESTIMENTAS</p>
        <h1>Decisiones con una visión completa.</h1>
        <p>Supervisa alquileres, pagos y devoluciones de tu tienda.</p>
      </div>
      <button
        mat-flat-button
        (click)="exportar()"
        [disabled]="cargando() || !!error() || ref.pendientes() > 0 || ref.errores().length > 0"
      >
        Exportar reporte
      </button>
    </header>
    @if (error()) {
      <p role="alert" class="error-box">
        {{ error() }} <button mat-button (click)="cargar()">Reintentar</button>
      </p>
    }
    <section class="report-metrics">
      <mat-card appearance="outlined"
        ><small>Total de alquileres</small><strong>{{ ref.alquileres().length }}</strong></mat-card
      ><mat-card appearance="outlined"
        ><small>Importe registrado</small
        ><strong>{{ total() | currency: 'PEN' : 'S/ ' }}</strong></mat-card
      ><mat-card appearance="outlined"
        ><small>Pagos recibidos</small
        ><strong>{{ pagado() | currency: 'PEN' : 'S/ ' }}</strong></mat-card
      ><mat-card appearance="outlined"
        ><small>Saldo por cobrar</small
        ><strong>{{ saldo() | currency: 'PEN' : 'S/ ' }}</strong></mat-card
      >
    </section>
    <mat-card appearance="outlined" class="content-card"
      ><h2>Detalle de operaciones</h2>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Alquiler / Cliente</th>
              <th>Devolución</th>
              <th>Importe</th>
              <th>Pagado</th>
              <th>Saldo</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (a of ref.alquileres(); track a.idAlquiler) {
              <tr>
                <td>ALQ-{{ a.idAlquiler }} · {{ ref.cliente(a.clienteId) }}</td>
                <td>{{ a.fechaFin.slice(0, 10) }}</td>
                <td>{{ a.total | currency: 'PEN' : 'S/ ' }}</td>
                <td>{{ cobrado(a.idAlquiler) | currency: 'PEN' : 'S/ ' }}</td>
                <td>{{ restante(a.idAlquiler, a.total) | currency: 'PEN' : 'S/ ' }}</td>
                <td>
                  <a mat-button routerLink="/alquileres" [queryParams]="{ alquiler: a.idAlquiler }"
                    >Ver alquiler</a
                  >
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="6">No hay operaciones registradas.</td>
              </tr>
            }
          </tbody>
        </table>
      </div></mat-card
    >
  </div>`,
})
export class ReportesComponent {
  readonly ref = inject(ReferenciasService);
  private readonly service = inject(PagoService);
  readonly pagos = signal<Pago[]>([]);
  readonly error = signal('');
  readonly cargando = signal(false);
  readonly validos = computed(() =>
    this.pagos().filter((p) => !['ANULADO', 'PENDIENTE'].includes(p.estado.toUpperCase())),
  );
  readonly total = computed(() => this.ref.alquileres().reduce((n, a) => n + a.total, 0));
  readonly pagado = computed(() => this.validos().reduce((n, p) => n + p.monto, 0));
  readonly saldo = computed(() =>
    this.ref.alquileres().reduce((n, a) => n + this.restante(a.idAlquiler, a.total), 0),
  );
  cobrado(id: number): number {
    return this.validos()
      .filter((p) => p.alquilerId === id)
      .reduce((n, p) => n + p.monto, 0);
  }
  restante(id: number, total: number): number {
    return Math.max(0, total - this.cobrado(id));
  }
  constructor() {
    this.cargar();
  }
  cargar(): void {
    this.cargando.set(true);
    this.error.set('');
    this.service.findAll().subscribe({
      next: (p) => {
        this.pagos.set(p);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar los pagos.');
        this.cargando.set(false);
      },
    });
  }
  exportar(): void {
    const cell = (v: unknown) =>
      '"' +
      String(v)
        .replace(/^[=+@-]/, "'$&")
        .replace(/"/g, '""') +
      '"';
    const rows = [
      ['Alquiler', 'Cliente', 'Devolucion', 'Importe', 'Pagado', 'Saldo'],
      ...this.ref
        .alquileres()
        .map((a) => [
          a.idAlquiler,
          this.ref.cliente(a.clienteId),
          a.fechaFin,
          a.total,
          this.cobrado(a.idAlquiler),
          this.restante(a.idAlquiler, a.total),
        ]),
    ];
    const url = URL.createObjectURL(
      new Blob(['\ufeff' + rows.map((r) => r.map(cell).join(';')).join('\r\n')], {
        type: 'text/csv;charset=utf-8',
      }),
    );
    const link = document.createElement('a');
    link.href = url;
    link.download = 'reporte-alquileres.csv';
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
}
