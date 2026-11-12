import { MATERIAL } from '../../shared/material';
import { Component, computed, inject, input, signal, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Alquiler } from '../../model/alquiler';
import { DevolucionService } from '../../services/devolucion.service';
import { ReferenciasService } from '../../services/referencias.service';
import { SelectorReferenciaComponent } from '../../shared/selector-referencia.component';
import { alquilerEnCurso } from '../../model/flujo';
import { fechaLima } from '../../model/agenda';
import { RouterLink } from '@angular/router';
@Component({
  selector: 'app-devolucion',
  standalone: true,
  imports: [...MATERIAL, ReactiveFormsModule, SelectorReferenciaComponent, RouterLink],
  templateUrl: './devolucion.component.html',
  styleUrl: '../../shared/gestion.css',
})
export class DevolucionComponent {
  readonly alquiler = input.required<Alquiler>();
  readonly actualizada = output<void>();
  readonly ref = inject(ReferenciasService);
  private readonly servicio = inject(DevolucionService);
  private readonly fb = inject(FormBuilder);
  readonly devoluciones = computed(() =>
    this.ref.devoluciones().filter((d) => d.alquilerId === this.alquiler().idAlquiler),
  );
  readonly prendas = computed(() =>
    this.ref.detalles().filter((d) => d.alquilerId === this.alquiler().idAlquiler),
  );
  readonly puedeRecibir = computed(
    () =>
      alquilerEnCurso(this.alquiler()) &&
      !this.devoluciones().some((d) => d.estadoPrenda !== 'INCOMPLETO') &&
      this.prendas().length > 0,
  );
  readonly revisiones = signal<Record<number, string>>({});
  revisar(prenda: number, valor: string) {
    this.revisiones.update((r) => ({ ...r, [prenda]: valor }));
  }
  readonly guardando = signal(false);
  readonly error = signal('');
  readonly form = this.fb.nonNullable.group({
    fechaDevolucion: [fechaLima(), Validators.required],
    estadoPrenda: ['BUENO', Validators.required],
    observacion: ['', Validators.maxLength(500)],
    empleadoId: ['', Validators.required],
  });
  guardar() {
    if (this.form.invalid || this.guardando() || !this.puedeRecibir()) return;
    const v = this.form.getRawValue();
    if (
      v.fechaDevolucion < this.alquiler().fechaInicio.slice(0, 10) ||
      v.fechaDevolucion > fechaLima()
    ) {
      this.error.set('La recepción debe estar entre la entrega y hoy.');
      return;
    }
    if (
      this.prendas().some(
        (p) =>
          !['SIN_MANTENIMIENTO', 'CON_MANTENIMIENTO', 'NO_RECIBIDA'].includes(
            this.revisiones()[p.prendaId],
          ),
      )
    ) {
      this.error.set(
        'Revisa cada prenda e indica si requiere mantenimiento o si todavía no fue recibida.',
      );
      return;
    }
    const faltantes = this.prendas().some((p) => this.revisiones()[p.prendaId] === 'NO_RECIBIDA');
    if (faltantes !== (v.estadoPrenda === 'INCOMPLETO')) {
      this.error.set(
        'El estado Incompleto debe coincidir con las prendas pendientes de recepción.',
      );
      return;
    }
    const etiquetas: Record<string, string> = {
      SIN_MANTENIMIENTO: 'no requiere mantenimiento',
      CON_MANTENIMIENTO: 'requiere mantenimiento',
      NO_RECIBIDA: 'pendiente de recepción',
    };
    const revision = this.prendas()
      .map(
        (p) =>
          `${this.ref.prenda(p.prendaId)} (${p.cantidad}): ${etiquetas[this.revisiones()[p.prendaId]]}`,
      )
      .join('; ');
    const observacion = `${revision}. ${v.observacion}`.trim();
    if (observacion.length > 500) {
      this.error.set(
        'La revisión y las observaciones superan 500 caracteres. Reduce las observaciones; para alquileres extensos se necesita ampliar el campo en el servidor.',
      );
      return;
    }
    this.guardando.set(true);
    this.error.set('');
    this.servicio
      .registrar({
        ...v,
        observacion,
        fechaDevolucion: v.fechaDevolucion + 'T00:00:00',
        empleadoId: Number(v.empleadoId),
        alquilerId: this.alquiler().idAlquiler,
      })
      .subscribe({
        next: (d) => {
          this.ref.devoluciones.update((ds) => [...ds, d]);
          this.guardando.set(false);
          this.actualizada.emit();
        },
        error: () => {
          this.error.set('No se pudo registrar la recepción. Reintenta sin cerrar el alquiler.');
          this.guardando.set(false);
        },
      });
  }
}
