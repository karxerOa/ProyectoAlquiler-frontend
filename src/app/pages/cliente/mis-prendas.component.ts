import { Component, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { MATERIAL } from '../../shared/material';
import { PrendaAlquilada } from '../../model/prenda-alquilada';
import { MisPrendasService } from '../../services/mis-prendas.service';

@Component({
  standalone: true,
  imports: [...MATERIAL, DatePipe],
  templateUrl: './mis-prendas.component.html',
  styleUrl: '../../shared/gestion.css',
})
export class MisPrendasComponent {
  private readonly servicio = inject(MisPrendasService);
  readonly prendas = signal<PrendaAlquilada[]>([]);
  readonly estado = signal<'cargando' | 'listo' | 'error'>('cargando');

  constructor() { this.cargar(); }

  cargar(): void {
    this.estado.set('cargando');
    this.servicio.listar().subscribe({
      next: prendas => { this.prendas.set(prendas); this.estado.set('listo'); },
      error: () => this.estado.set('error'),
    });
  }
}
