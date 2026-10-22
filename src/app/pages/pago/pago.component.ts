import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Pago } from '../../model/pago';
import { PagoService } from '../../services/pago.service';

@Component({
  selector: 'app-pago',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './pago.component.html',
  styleUrl: '../cliente/cliente.component.css'
})
export class PagoComponent {
  private readonly pagoService = inject(PagoService);
  private readonly fb = inject(FormBuilder);

  busqueda = signal('');
  readonly pagos = this.pagoService.$pagosChange;
  modalAbierto = signal(false);
  guardando = signal(false);
  mensajeError = signal('');
  errorCarga = signal('');

  form = this.fb.nonNullable.group({
    fechaPago: [new Date().toISOString().slice(0, 10), Validators.required],
    monto: [0, [Validators.required, Validators.min(0.01)]],
    metodoPago: ['EFECTIVO', Validators.required],
    estado: ['PAGADO', Validators.required],
    alquilerId: ['', [Validators.required, Validators.min(1)]]
  });

  pagosFiltrados = computed(() => {
    const texto = this.busqueda();
    return this.pagos().filter(pago =>
      `${pago.fechaPago} ${pago.metodoPago} ${pago.estado} ${pago.alquilerId}`
        .toLowerCase().includes(texto)
    );
  });

  constructor() { this.cargar(); }

  cargar(): void {
    this.pagoService.findAll().subscribe({
      next: data => { this.pagoService.setPagosChange(data); this.errorCarga.set(''); },
      error: (error: unknown) => {
        console.error('Error al cargar pagos:', error);
        this.errorCarga.set('No se pudieron cargar los pagos.');
      }
    });
  }

  buscar(valor: string): void { this.busqueda.set(valor.trim().toLowerCase()); }

  nuevo(): void {
    this.form.reset({
      fechaPago: new Date().toISOString().slice(0, 10),
      monto: 0,
      metodoPago: 'EFECTIVO',
      estado: 'PAGADO',
      alquilerId: ''
    });
    this.mensajeError.set('');
    this.modalAbierto.set(true);
  }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const value = this.form.getRawValue();
    const data = { ...value, alquilerId: Number(value.alquilerId) };
    this.guardando.set(true);
    this.mensajeError.set('');
    this.pagoService.create(data).subscribe({
      next: () => { this.guardando.set(false); this.modalAbierto.set(false); this.cargar(); },
      error: (error: unknown) => {
        console.error('Error al guardar pago:', error);
        this.guardando.set(false);
        this.mensajeError.set('No se pudo registrar el pago. Verifica el ID del alquiler.');
      }
    });
  }

  campoInvalido(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && control.touched;
  }
}
