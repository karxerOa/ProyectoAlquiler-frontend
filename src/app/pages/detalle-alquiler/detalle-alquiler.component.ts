import { UiService } from '../../shared/ui.service';
import { MATERIAL } from '../../shared/material';
import { Component, computed, inject, input, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Alquiler } from '../../model/alquiler';
import { DetalleAlquilerService } from '../../services/detalle-alquiler.service';
import { ReferenciasService } from '../../services/referencias.service';
import { SelectorReferenciaComponent } from '../../shared/selector-referencia.component';
import { alquilerEditable } from '../../model/flujo';
@Component({
  selector: 'app-detalle-alquiler',
  standalone: true,
  imports: [...MATERIAL, ReactiveFormsModule, SelectorReferenciaComponent],
  templateUrl: './detalle-alquiler.component.html',
  styleUrl: '../../shared/gestion.css',
})
export class DetalleAlquilerComponent {
  private readonly ui = inject(UiService);
  readonly alquiler = input.required<Alquiler>();
  readonly ref = inject(ReferenciasService);
  private readonly servicio = inject(DetalleAlquilerService);
  private readonly fb = inject(FormBuilder);
  readonly error = signal('');
  readonly guardando = signal(false);
  readonly detalles = computed(() =>
    this.ref.detalles().filter((d) => d.alquilerId === this.alquiler().idAlquiler),
  );
  readonly editable = computed(
    () =>
      alquilerEditable(this.alquiler()) &&
      !this.ref.devoluciones().some((d) => d.alquilerId === this.alquiler().idAlquiler),
  );
  readonly opciones = computed(() =>
    this.ref.opcionesPrendas().filter(
      (o) =>
        this.ref
          .prendas()
          .find((p) => p.idPrenda === o.valor)
          ?.estado.trim()
          .toUpperCase() === 'DISPONIBLE' && !this.detalles().some((d) => d.prendaId === o.valor),
    ),
  );
  readonly form = this.fb.nonNullable.group({
    prendaId: ['', [Validators.required]],
    cantidad: [1, [Validators.required, Validators.min(1), Validators.pattern(/^\d+$/)]],
    precioUnitario: [0, [Validators.required, Validators.min(0)]],
    subtotal: [0, [Validators.required, Validators.min(0)]],
  });
  guardar() {
    if (this.form.invalid || this.guardando() || !this.editable()) return;
    const v = this.form.getRawValue();
    if (!this.opciones().some((o) => o.valor === Number(v.prendaId))) {
      this.error.set('Selecciona una prenda disponible.');
      return;
    }
    this.guardando.set(true);
    this.error.set('');
    this.servicio
      .create({ ...v, prendaId: Number(v.prendaId), alquilerId: this.alquiler().idAlquiler })
      .subscribe({
        next: (d) => {
          this.ref.detalles.update((items) => [...items, d]);
          this.form.reset({ prendaId: '', cantidad: 1, precioUnitario: 0, subtotal: 0 });
          this.guardando.set(false);
        },
        error: () => {
          this.error.set('No se pudo añadir la prenda.');
          this.guardando.set(false);
        },
      });
  }
  async quitar(id: number): Promise<void> {
    if (
      !this.editable() ||
      this.guardando() ||
      !(await this.ui.confirm('¿Quitar esta prenda del alquiler?'))
    )
      return;
    this.guardando.set(true);
    this.servicio.delete(id).subscribe({
      next: () => {
        this.ref.detalles.update((ds) => ds.filter((d) => d.idDetalle !== id));
        this.guardando.set(false);
      },
      error: () => {
        this.error.set('No se pudo quitar la prenda.');
        this.guardando.set(false);
      },
    });
  }
}
