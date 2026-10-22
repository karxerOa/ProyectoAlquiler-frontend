import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DetalleAlquiler } from '../../model/detalle-alquiler';
import { DetalleAlquilerService } from '../../services/detalle-alquiler.service';

@Component({
  selector: 'app-detalle-alquiler',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './detalle-alquiler.component.html',
  styleUrl: '../cliente/cliente.component.css'
})
export class DetalleAlquilerComponent implements OnInit {
  private readonly detalleService = inject(DetalleAlquilerService);
  private readonly fb = inject(FormBuilder);

  busqueda = signal('');
  detalles = signal<DetalleAlquiler[]>([]);
  modalAbierto = signal(false);
  editandoId = signal<number | null>(null);
  guardando = signal(false);
  mensajeError = signal('');
  errorCarga = signal('');

  form = this.fb.nonNullable.group({
    cantidad: [1, [Validators.required, Validators.min(1)]],
    precioUnitario: [0, [Validators.required, Validators.min(0)]],
    subtotal: [0, [Validators.required, Validators.min(0)]],
    alquilerId: ['', [Validators.required, Validators.min(1)]],
    prendaId: ['', [Validators.required, Validators.min(1)]]
  });

  detallesFiltrados = computed(() => {
    const texto = this.busqueda();
    return this.detalles().filter(detalle =>
      `${detalle.idDetalle} ${detalle.alquilerId} ${detalle.prendaId}`
        .toLowerCase().includes(texto)
    );
  });

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.detalleService.findAll().subscribe({
      next: data => { this.detalles.set(data); this.errorCarga.set(''); },
      error: (error: unknown) => {
        console.error('Error al cargar detalles de alquiler:', error);
        this.errorCarga.set('No se pudieron cargar los detalles de alquiler.');
      }
    });
  }

  buscar(valor: string): void { this.busqueda.set(valor.trim().toLowerCase()); }

  nuevo(): void {
    this.editandoId.set(null);
    this.form.reset({ cantidad: 1, precioUnitario: 0, subtotal: 0, alquilerId: '', prendaId: '' });
    this.mensajeError.set('');
    this.modalAbierto.set(true);
  }

  editar(detalle: DetalleAlquiler): void {
    this.editandoId.set(detalle.idDetalle);
    this.form.setValue({
      cantidad: detalle.cantidad,
      precioUnitario: detalle.precioUnitario,
      subtotal: detalle.subtotal,
      alquilerId: String(detalle.alquilerId),
      prendaId: String(detalle.prendaId)
    });
    this.mensajeError.set('');
    this.modalAbierto.set(true);
  }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const value = this.form.getRawValue();
    const data = { ...value, alquilerId: Number(value.alquilerId), prendaId: Number(value.prendaId) };
    const id = this.editandoId();
    this.guardando.set(true);
    this.mensajeError.set('');
    const request = id === null ? this.detalleService.create(data) : this.detalleService.update(id, data);
    request.subscribe({
      next: () => { this.guardando.set(false); this.modalAbierto.set(false); this.cargar(); },
      error: (error: unknown) => {
        console.error('Error al guardar detalle de alquiler:', error);
        this.guardando.set(false);
        this.mensajeError.set('No se pudo guardar. Verifica los IDs de alquiler y prenda.');
      }
    });
  }

  eliminar(detalle: DetalleAlquiler): void {
    if (!confirm(`¿Eliminar el detalle #${detalle.idDetalle}?`)) return;
    this.detalleService.delete(detalle.idDetalle).subscribe({
      next: () => this.cargar(),
      error: (error: unknown) => {
        console.error('Error al eliminar detalle:', error);
        alert('No se pudo eliminar el detalle de alquiler.');
      }
    });
  }

  campoInvalido(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && control.touched;
  }
}
