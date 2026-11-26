import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { MATERIAL } from '../../shared/material';
import { ReferenciasService } from '../../services/referencias.service';
import { DevolucionComponent } from './devolucion.component';
import { Alquiler } from '../../model/alquiler';
import { alquilerEnCurso } from '../../model/flujo';
import { fechaLima } from '../../model/agenda';
import { normalizar } from '../../model/catalogo';
import { DetalleAlquiler } from '../../model/detalle-alquiler';
import { Devolucion, estadoPrendaEnObservacion } from '../../model/devolucion';
@Component({
  selector: 'app-devoluciones-page',
  standalone: true,
  imports: [...MATERIAL, CurrencyPipe, DevolucionComponent],
  styleUrl: '../../shared/gestion.css',
  template: ` <div class="page-container">
    <header class="page-header">
      <div>
        <p class="eyebrow">GESTIÓN DE VESTIMENTAS</p>
        <h1>Cada devolución, un nuevo comienzo.</h1>
        <p>Recibe las prendas, revisa su estado y completa el alquiler.</p>
      </div>
    </header>
    <mat-card appearance="outlined" class="content-card"
      ><div class="table-header">
        <h2>Devoluciones pendientes</h2>
        <mat-form-field appearance="outline" subscriptSizing="dynamic"
          ><mat-label>Buscar cliente o alquiler</mat-label
          ><input matInput (input)="query.set($any($event.target).value)"
        /></mat-form-field>
      </div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Alquiler / Cliente</th>
              <th>Devolución</th>
              <th>Importe</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (a of pendientes(); track a.idAlquiler) {
              <tr>
                <td>{{ ref.cliente(a.clienteId) }} · ALQ-{{ a.idAlquiler }}</td>
                <td>{{ a.fechaFin.slice(0, 10) }}</td>
                <td>{{ a.total | currency: 'PEN' : 'S/ ' }}</td>
                <td>{{ a.fechaFin.slice(0, 10) < hoy ? 'Vencido' : 'En plazo' }}</td>
                <td>
                  <button mat-stroked-button (click)="seleccion.set(a)">
                    Registrar devolución
                  </button>
                </td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5">No hay devoluciones pendientes para esta búsqueda.</td>
              </tr>
            }
          </tbody>
        </table>
      </div></mat-card
    >
    <mat-card appearance="outlined" class="content-card">
      <div class="table-header">
        <h2>Devoluciones registradas</h2>
        <p>Consulta las prendas recibidas y el estado registrado para cada una.</p>
      </div>
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Alquiler / Cliente</th>
              <th>Fecha de recepción</th>
              <th>Prendas y estado</th>
              <th>Estado general</th>
              <th>Recibió</th>
            </tr>
          </thead>
          <tbody>
            @for (d of registradas(); track d.idDevolucion) {
              <tr>
                <td>ALQ-{{ d.alquilerId }} · {{ ref.cliente(clienteId(d.alquilerId)) }}</td>
                <td>{{ d.fechaDevolucion.slice(0, 10) }}</td>
                <td>
                  @for (prenda of prendasDe(d.alquilerId); track prenda.idDetalle) {
                    <p>
                      {{ ref.prenda(prenda.prendaId) }} · {{ prenda.cantidad }} unidades —
                      {{ estadoPorPrenda(d, prenda) }}
                    </p>
                  } @empty {
                    <p>No hay prendas vinculadas a este alquiler.</p>
                  }
                  @if (d.observacion) {
                    <small>{{ d.observacion }}</small>
                  }
                </td>
                <td>{{ d.estadoPrenda }}</td>
                <td>{{ ref.empleado(d.empleadoId) }}</td>
              </tr>
            } @empty {
              <tr>
                <td colspan="5">Todavía no hay devoluciones registradas.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </mat-card>
    @if (seleccion(); as a) {
      <mat-card appearance="outlined" class="content-card"
        ><div class="page-header">
          <h2>ALQ-{{ a.idAlquiler }} · {{ ref.cliente(a.clienteId) }}</h2>
          <button mat-button (click)="seleccion.set(null)">Cerrar</button>
        </div>
        <app-devolucion [alquiler]="a" (actualizada)="ref.cargar(true)"
      /></mat-card>
    }
  </div>`,
})
export class DevolucionesPageComponent {
  readonly ref = inject(ReferenciasService);
  readonly hoy = fechaLima();
  readonly query = signal('');
  readonly seleccion = signal<Alquiler | null>(null);
  readonly registradas = computed(() =>
    this.ref
      .devoluciones()
      .filter((d) =>
        normalizar(
          `${this.ref.cliente(this.clienteId(d.alquilerId))} ${d.alquilerId}`,
        ).includes(normalizar(this.query())),
      )
      .sort((a, b) => b.fechaDevolucion.localeCompare(a.fechaDevolucion)),
  );
  readonly pendientes = computed(() =>
    this.ref
      .alquileres()
      .filter(
        (a) =>
          alquilerEnCurso(a) &&
          !this.ref
            .devoluciones()
            .some((d) => d.alquilerId === a.idAlquiler && d.estadoPrenda !== 'INCOMPLETO'),
      )
      .filter((a) =>
        normalizar(this.ref.cliente(a.clienteId) + ' ' + a.idAlquiler).includes(
          normalizar(this.query()),
        ),
      )
      .sort((a, b) => a.fechaFin.localeCompare(b.fechaFin)),
  );
  clienteId(alquilerId: number) {
    return this.ref.alquileres().find((a) => a.idAlquiler === alquilerId)?.clienteId ?? 0;
  }
  prendasDe(alquilerId: number): DetalleAlquiler[] {
    return this.ref.detalles().filter((d) => d.alquilerId === alquilerId);
  }
  estadoPorPrenda(devolucion: Devolucion, prenda: DetalleAlquiler) {
    return estadoPrendaEnObservacion(
      devolucion.observacion,
      this.ref.prenda(prenda.prendaId),
      prenda.cantidad,
    );
  }
}
