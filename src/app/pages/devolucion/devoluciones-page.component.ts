import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { MATERIAL } from '../../shared/material';
import { ReferenciasService } from '../../services/referencias.service';
import { DevolucionComponent } from './devolucion.component';
import { Alquiler } from '../../model/alquiler';
import { alquilerEnCurso } from '../../model/flujo';
import { fechaLima } from '../../model/agenda';
import { normalizar } from '../../model/catalogo';
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
                  <button mat-stroked-button (click)="seleccion.set(a)">Revisar devolución</button>
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
}
