import { Component, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AlquilerService } from '../services/alquiler.service';
import { Alquiler } from '../model/alquiler';
import { agendaAlquileres, fechaLima } from '../model/agenda';
import { normalizar } from '../model/catalogo';

@Component({
  selector: 'app-resumen',
  standalone: true,
  imports: [RouterLink, CurrencyPipe],
  styleUrls: ['../shared/gestion.css', './resumen.component.css'],
  templateUrl: './resumen.component.html',
})
export class ResumenComponent {
  readonly tiposAgenda = ['entregas', 'devoluciones'] as const;
  private readonly servicio = inject(AlquilerService);
  readonly alquileres = signal<Alquiler[]>([]);
  readonly error = signal('');
  readonly cargando = signal(true);
  readonly busqueda = signal('');
  readonly hoy = fechaLima();
  readonly agenda = computed(() => agendaAlquileres(this.alquileres(), this.hoy));
  readonly visibles = computed(() =>
    this.alquileres().filter((a) =>
      normalizar(`${a.nombreCliente ?? ''} ${a.apellidoCliente ?? ''}`).includes(
        normalizar(this.busqueda()),
      ),
    ),
  );
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
        this.error.set('No se pudo cargar la agenda de alquileres.');
        this.cargando.set(false);
      },
    });
  }
}
