import { MATERIAL } from '../../shared/material';
import { ReferenciasService } from '../../services/referencias.service';
import { SelectorReferenciaComponent } from '../../shared/selector-referencia.component';
import { Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { UiService } from '../../shared/ui.service';
import { Pago, pagoCobrado, saldoAlquiler } from '../../model/pago';
import { PagoService } from '../../services/pago.service';

@Component({
  selector: 'app-pago',
  standalone: true,
  imports: [...MATERIAL, ReactiveFormsModule, SelectorReferenciaComponent],
  templateUrl: './pago.component.html',
  styleUrl: '../../shared/gestion.css',
})
export class PagoComponent {
  readonly ref = inject(ReferenciasService);
  private readonly pagoService = inject(PagoService);
  private readonly fb = inject(FormBuilder);

  private readonly ui = inject(UiService);
  readonly cargando = signal(false);
  readonly cobrados = computed(() => this.pagos().filter(pagoCobrado));
  busqueda = signal('');
  readonly pagos = this.pagoService.$pagosChange;
  readonly opcionesAlquileres = computed(() =>
    this.ref
      .opcionesAlquileres()
      .filter((opcion) => (this.saldo(opcion.valor) ?? 0) > 0)
      .map((opcion) => ({
        ...opcion,
        nombre: `#${opcion.valor} · ${opcion.nombre}`,
      })),
  );
  modalAbierto = signal(false);
  guardando = signal(false);
  mensajeError = signal('');
  errorCarga = signal('');

  form = this.fb.nonNullable.group({
    fechaPago: [this.fechaLocal(), Validators.required],
    monto: [0, [Validators.required, Validators.min(0.01)]],
    metodoPago: ['EFECTIVO', Validators.required],
    estado: ['PAGADO', Validators.required],
    alquilerId: ['', [Validators.required, Validators.min(1)]],
  });

  pagosFiltrados = computed(() => {
    const texto = this.busqueda();
    return this.pagos().filter((pago) =>
      `#${pago.alquilerId} ${pago.fechaPago} ${pago.metodoPago} ${pago.estado} ${this.ref.alquiler(pago.alquilerId)}`
        .toLowerCase()
        .includes(texto),
    );
  });

  constructor() {
    this.cargar();
    this.form.controls.alquilerId.valueChanges
      .pipe(takeUntilDestroyed())
      .subscribe((alquilerId) => {
        this.form.controls.monto.setValue(this.saldo(Number(alquilerId)) ?? 0);
      });
  }

  saldo(id: number): number | undefined {
    const alquiler = this.ref.alquileres().find((a) => a.idAlquiler === id);
    return alquiler && saldoAlquiler(alquiler.total, this.cobrados(), id);
  }

  cargar(): void {
    this.cargando.set(true);
    this.pagoService.findAll().subscribe({
      next: (data) => {
        this.cargando.set(false);
        this.pagoService.setPagosChange(data);
        this.errorCarga.set('');
      },
      error: (error: unknown) => {
        this.cargando.set(false);
        console.error('Error al cargar pagos:', error);
        this.errorCarga.set('No se pudieron cargar los pagos.');
      },
    });
  }

  buscar(valor: string): void {
    this.busqueda.set(valor.trim().toLowerCase());
  }

  private fechaLocal(): string {
    const hoy = new Date();
    return new Date(hoy.getTime() - hoy.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  }

  nuevo(): void {
    this.form.reset({
      fechaPago: this.fechaLocal(),
      monto: 0,
      metodoPago: 'EFECTIVO',
      estado: 'PAGADO',
      alquilerId: '',
    });
    this.mensajeError.set('');
    this.modalAbierto.set(true);
  }

  guardar(): void {
    if (this.guardando() || this.cargando() || this.errorCarga()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const data = { ...value, alquilerId: Number(value.alquilerId) };
    const saldo = this.saldo(data.alquilerId);
    if (saldo === undefined || data.monto > saldo) {
      this.mensajeError.set(
        'El monto supera el saldo disponible o el alquiler ya no está disponible.',
      );
      return;
    }
    if (!Number.isFinite(data.monto) || Number(data.monto.toFixed(2)) !== data.monto) {
      this.mensajeError.set('Ingresa un monto con un máximo de dos decimales.');
      return;
    }
    this.guardando.set(true);
    this.mensajeError.set('');
    this.pagoService.create(data).subscribe({
      next: () => {
        this.guardando.set(false);
        this.modalAbierto.set(false);
        this.cargar();
      },
      error: (error: unknown) => {
        console.error('Error al guardar pago:', error);
        this.guardando.set(false);
        this.mensajeError.set('No se pudo registrar el pago. Revisa el alquiler seleccionado.');
      },
    });
  }

  puedeCambiar(pago: Pago): boolean {
    return (
      pago.idPago != null &&
      pago.estado.trim().toUpperCase() === 'PENDIENTE' &&
      (this.saldo(pago.alquilerId) ?? 0) > 0
    );
  }

  async cambiarEstado(pago: Pago, estado: 'PAGADO' | 'ANULADO'): Promise<void> {
    if (
      !this.puedeCambiar(pago) ||
      pago.idPago == null ||
      this.guardando() ||
      this.cargando() ||
      this.errorCarga()
    )
      return;
    const accion = estado === 'PAGADO' ? 'confirmar' : 'anular';
    this.guardando.set(true);
    if (
      !(await this.ui.confirm(
        `¿Deseas ${accion} el pago de S/ ${pago.monto} del alquiler #${pago.alquilerId}?`,
      ))
    ) {
      this.guardando.set(false);
      return;
    }
    if (estado === 'PAGADO' && pago.monto > (this.saldo(pago.alquilerId) ?? 0)) {
      this.guardando.set(false);
      this.ui.notify('El monto supera el saldo pendiente del alquiler.');
      return;
    }
    this.pagoService.update(pago.idPago, { ...pago, estado }).subscribe({
      next: () => {
        this.guardando.set(false);
        this.cargar();
      },
      error: () => {
        this.guardando.set(false);
        this.ui.notify('No se pudo actualizar el estado del pago.');
      },
    });
  }

  campoInvalido(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && control.touched;
  }
}
