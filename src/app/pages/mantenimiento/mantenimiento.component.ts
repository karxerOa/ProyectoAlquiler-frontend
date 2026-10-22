import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Mantenimiento } from '../../model/mantenimiento';
import { MantenimientoService } from '../../services/mantenimiento.service';

@Component({
  selector: 'app-mantenimiento',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './mantenimiento.component.html',
  styleUrl: '../cliente/cliente.component.css'
})
export class MantenimientoComponent implements OnInit {
  private readonly mantenimientoService = inject(MantenimientoService);
  private readonly fb = inject(FormBuilder);

  busqueda = signal('');
  mantenimientos = signal<Mantenimiento[]>([]);
  modalAbierto = signal(false);
  editandoId = signal<number | null>(null);
  guardando = signal(false);
  mensajeError = signal('');
  errorCarga = signal('');

  form = this.fb.nonNullable.group({
    fechaInicio: ['', Validators.required],
    fechaFin: ['', Validators.required],
    tipoMantenimiento: ['', [Validators.required, Validators.maxLength(100)]],
    descripcion: ['', [Validators.required, Validators.maxLength(255)]],
    costo: [0, [Validators.required, Validators.min(0)]],
    estado: ['EN CURSO', Validators.required],
    prendaId: ['', [Validators.required, Validators.min(1)]],
    empleadoId: ['', [Validators.required, Validators.min(1)]]
  });

  mantenimientosFiltrados = computed(() => {
    const texto = this.busqueda();
    return this.mantenimientos().filter(item =>
      `${item.tipoMantenimiento} ${item.descripcion} ${item.estado} ${item.prendaId} ${item.empleadoId}`
        .toLowerCase().includes(texto)
    );
  });

  ngOnInit(): void { this.cargar(); }

  cargar(): void {
    this.mantenimientoService.findAll().subscribe({
      next: data => { this.mantenimientos.set(data); this.errorCarga.set(''); },
      error: (error: unknown) => {
        console.error('Error al cargar mantenimientos:', error);
        this.errorCarga.set('No se pudieron cargar los mantenimientos.');
      }
    });
  }

  buscar(valor: string): void { this.busqueda.set(valor.trim().toLowerCase()); }

  nuevo(): void {
    this.editandoId.set(null);
    this.form.reset({
      fechaInicio: new Date().toISOString().slice(0, 10),
      fechaFin: '',
      tipoMantenimiento: '',
      descripcion: '',
      costo: 0,
      estado: 'EN CURSO',
      prendaId: '',
      empleadoId: ''
    });
    this.mensajeError.set('');
    this.modalAbierto.set(true);
  }

  editar(item: Mantenimiento): void {
    this.editandoId.set(item.idMantenimiento);
    this.form.setValue({
      fechaInicio: item.fechaInicio.slice(0, 10),
      fechaFin: item.fechaFin.slice(0, 10),
      tipoMantenimiento: item.tipoMantenimiento,
      descripcion: item.descripcion,
      costo: item.costo,
      estado: item.estado,
      prendaId: String(item.prendaId),
      empleadoId: String(item.empleadoId)
    });
    this.mensajeError.set('');
    this.modalAbierto.set(true);
  }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const value = this.form.getRawValue();
    if (value.fechaFin < value.fechaInicio) {
      this.mensajeError.set('La fecha final no puede ser anterior a la fecha inicial.');
      return;
    }
    const data = { ...value, prendaId: Number(value.prendaId), empleadoId: Number(value.empleadoId) };
    const id = this.editandoId();
    this.guardando.set(true);
    this.mensajeError.set('');
    const request = id === null
      ? this.mantenimientoService.create(data)
      : this.mantenimientoService.update(id, data);
    request.subscribe({
      next: () => { this.guardando.set(false); this.modalAbierto.set(false); this.cargar(); },
      error: (error: unknown) => {
        console.error('Error al guardar mantenimiento:', error);
        this.guardando.set(false);
        this.mensajeError.set('No se pudo guardar. Verifica los IDs de prenda y empleado.');
      }
    });
  }

  eliminar(item: Mantenimiento): void {
    if (!confirm(`¿Eliminar el mantenimiento #${item.idMantenimiento}?`)) return;
    this.mantenimientoService.delete(item.idMantenimiento).subscribe({
      next: () => this.cargar(),
      error: (error: unknown) => {
        console.error('Error al eliminar mantenimiento:', error);
        alert('No se pudo eliminar el mantenimiento.');
      }
    });
  }

  campoInvalido(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && control.touched;
  }
}
