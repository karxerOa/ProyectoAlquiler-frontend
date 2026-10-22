import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Prenda } from '../../model/prenda';
import { PrendaService } from '../../services/prenda.service';

@Component({
  selector: 'app-prenda',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './prenda.component.html',
  styleUrl: '../cliente/cliente.component.css'
})
export class PrendaComponent {
  private readonly prendaService = inject(PrendaService);
  private readonly fb = inject(FormBuilder);

  busqueda = signal('');
  readonly prendas = this.prendaService.$prendasChange;
  modalAbierto = signal(false);
  editandoId = signal<number | null>(null);
  guardando = signal(false);
  mensajeError = signal('');
  errorCarga = signal('');

  form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    descripcion: ['', [Validators.required, Validators.maxLength(255)]],
    talla: ['', [Validators.required, Validators.maxLength(20)]],
    color: ['', [Validators.required, Validators.maxLength(50)]],
    precioAlquiler: [0, [Validators.required, Validators.min(0)]],
    estado: ['DISPONIBLE', Validators.required],
    categoriaId: ['', [Validators.required, Validators.min(1)]]
  });

  prendasFiltradas = computed(() => {
    const texto = this.busqueda();
    return this.prendas().filter(prenda =>
      `${prenda.nombre} ${prenda.descripcion} ${prenda.talla} ${prenda.color} ${prenda.estado} ${prenda.categoriaNombre ?? ''}`
        .toLowerCase().includes(texto)
    );
  });

  constructor() { this.cargar(); }

  cargar(): void {
    this.prendaService.findAll().subscribe({
      next: data => { this.prendaService.setPrendasChange(data); this.errorCarga.set(''); },
      error: (error: unknown) => {
        console.error('Error al cargar prendas:', error);
        this.errorCarga.set('No se pudieron cargar las prendas.');
      }
    });
  }

  buscar(valor: string): void { this.busqueda.set(valor.trim().toLowerCase()); }

  nuevo(): void {
    this.editandoId.set(null);
    this.form.reset({
      nombre: '', descripcion: '', talla: '', color: '',
      precioAlquiler: 0, estado: 'DISPONIBLE', categoriaId: ''
    });
    this.mensajeError.set('');
    this.modalAbierto.set(true);
  }

  editar(prenda: Prenda): void {
    this.editandoId.set(prenda.idPrenda);
    this.form.setValue({
      nombre: prenda.nombre,
      descripcion: prenda.descripcion,
      talla: prenda.talla,
      color: prenda.color,
      precioAlquiler: prenda.precioAlquiler,
      estado: prenda.estado.trim(),
      categoriaId: String(prenda.categoriaId)
    });
    this.mensajeError.set('');
    this.modalAbierto.set(true);
  }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const value = this.form.getRawValue();
    const data = { ...value, categoriaId: Number(value.categoriaId) };
    const id = this.editandoId();
    this.guardando.set(true);
    this.mensajeError.set('');
    const request = id === null ? this.prendaService.create(data) : this.prendaService.update(id, data);
    request.subscribe({
      next: () => { this.guardando.set(false); this.modalAbierto.set(false); this.cargar(); },
      error: (error: unknown) => {
        console.error('Error al guardar prenda:', error);
        this.guardando.set(false);
        this.mensajeError.set('No se pudo guardar la prenda. Verifica el ID de categoría.');
      }
    });
  }

  eliminar(prenda: Prenda): void {
    if (!confirm(`¿Eliminar la prenda "${prenda.nombre}"?`)) return;
    this.prendaService.delete(prenda.idPrenda).subscribe({
      next: () => this.cargar(),
      error: (error: unknown) => {
        console.error('Error al eliminar prenda:', error);
        alert('No se pudo eliminar la prenda. Puede tener registros asociados.');
      }
    });
  }

  campoInvalido(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && control.touched;
  }
}
