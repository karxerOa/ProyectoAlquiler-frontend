import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
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
  imports: [...MATERIAL, CurrencyPipe, DevolucionComponent, RouterLink],
  styleUrls: ['../../shared/gestion.css', './devoluciones-page.component.css'],
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

              <th>Estado general</th>
              <th>Recibió</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            @for (d of registradas(); track d.idDevolucion) {
              <tr>
                <td>ALQ-{{ d.alquilerId }} · {{ ref.cliente(clienteId(d.alquilerId)) }}</td>
                <td>{{ d.fechaDevolucion.slice(0, 10) }}</td>
                <td>{{ d.estadoPrenda }}</td>
                <td>{{ ref.empleado(d.empleadoId) }}</td>
                <td>
                  <button mat-stroked-button type="button" (click)="detalle.set(d)">
                    Ver detalle
                  </button>
                </td>
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
      <ng-template appModal (closed)="seleccion.set(null)">
        <section class="ficha">
          <header>
            <h2>Registrar devolución</h2>
            <p>ALQ-{{ a.idAlquiler }} · {{ ref.cliente(a.clienteId) }}</p>
          </header>
          <div class="contenido">
            <app-devolucion [alquiler]="a" [enModal]="true" (actualizada)="recepcionRegistrada()" />
          </div>
          <footer>
            <button mat-stroked-button type="button" (click)="seleccion.set(null)">Cerrar</button>
          </footer>
        </section>
      </ng-template>
    }
    @if (detalle(); as d) {
      <ng-template appModal (closed)="detalle.set(null)">
        <section class="ficha">
          <header>
            <h2>Detalle de devolución</h2>
            <p>ALQ-{{ d.alquilerId }} · {{ ref.cliente(clienteId(d.alquilerId)) }}</p>
          </header>
          <div class="contenido">
            <dl>
              <div>
                <dt>Fecha de recepción</dt>
                <dd>{{ d.fechaDevolucion.slice(0, 10) }}</dd>
              </div>
              <div>
                <dt>Estado general</dt>
                <dd>{{ d.estadoPrenda === 'DANADO' ? 'Dañado' : d.estadoPrenda }}</dd>
              </div>
              <div>
                <dt>Recibió</dt>
                <dd>{{ ref.empleado(d.empleadoId) }}</dd>
              </div>
            </dl>
            <h3>Prendas del alquiler</h3>
            @for (p of prendasDe(d.alquilerId); track p.idDetalle) {
              <div class="prenda">
                <div>
                  <strong>{{ ref.prenda(p.prendaId) }}</strong>
                  <p>
                    {{ p.cantidad }} {{ p.cantidad === 1 ? 'unidad' : 'unidades' }} ·
                    {{ estadoPorPrenda(d, p) }}
                  </p>
                </div>
                @if (d.estadoPrenda !== 'INCOMPLETO') {
                  <a
                    mat-stroked-button
                    routerLink="/mantenimientos"
                    [queryParams]="{ devolucion: d.idDevolucion, prenda: p.prendaId }"
                    >Revisar mantenimiento</a
                  >
                }
              </div>
            } @empty {
              <p>Sin prendas vinculadas.</p>
            }
            @if (d.observacion) {
              <h3>Observaciones</h3>
              <p>{{ d.observacion }}</p>
            }
          </div>
          <footer>
            <button mat-stroked-button type="button" (click)="detalle.set(null)">Cerrar</button>
          </footer>
        </section>
      </ng-template>
    }
  </div>`,
})
export class DevolucionesPageComponent {
  readonly ref = inject(ReferenciasService);
  readonly hoy = fechaLima();
  readonly query = signal('');
  readonly seleccion = signal<Alquiler | null>(null);
  readonly detalle = signal<Devolucion | null>(null);
  recepcionRegistrada(): void {
    this.seleccion.set(null);
    this.ref.cargar(true);
  }
  readonly registradas = computed(() =>
    this.ref
      .devoluciones()
      .filter((d) =>
        normalizar(`${this.ref.cliente(this.clienteId(d.alquilerId))} ${d.alquilerId}`).includes(
          normalizar(this.query()),
        ),
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
