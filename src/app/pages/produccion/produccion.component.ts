import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Produccion } from '../../model/produccion';
import { ProduccionService } from '../../services/produccion.service';

@Component({
  selector: 'app-produccion',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './produccion.component.html',
  styleUrl: './produccion.component.css'
})
export class ProduccionComponent {
  private readonly produccionService = inject(ProduccionService);
  private readonly fb = inject(FormBuilder);

  busqueda = signal('');
  readonly producciones = this.produccionService.$produccionesChange;
  errorCarga = signal('');

  modalAbierto = signal(false);
  editandoId = signal<number | null>(null);
  guardando = signal(false);
  mensajeError = signal('');

  form = this.fb.nonNullable.group({
    fechaProduccion: ['', [Validators.required]],
    cantidad: [1, [Validators.required, Validators.min(1)]],
    costoProduccion: [0, [Validators.required, Validators.min(0)]],
    descripcion: ['', [Validators.required, Validators.maxLength(255)]],
    prenda: [1, [Validators.required, Validators.min(1)]],
    empleado: [1, [Validators.required, Validators.min(1)]]
  });

  produccionesFiltradas = computed(() => {
    const texto = this.busqueda();
    return this.producciones().filter(p =>
      `${p.descripcion} ${p.fechaProduccion}`
        .toLowerCase()
        .includes(texto)
    );
  });

  constructor() {
    this.cargarProducciones();
  }

  cargarProducciones(): void {
    this.produccionService.findAll().subscribe({
      next: (data) => {
        this.produccionService.setProduccionesChange(data);
        this.errorCarga.set('');
      },
      error: (error: unknown) => {
        console.error('Error al cargar producciones:', error);
        this.errorCarga.set('No se pudieron cargar las producciones. Verifica la conexión con el servidor.');
      }
    });
  }

  buscar(valor: string): void {
    this.busqueda.set(valor.trim().toLowerCase());
  }

  nuevo(): void {
    this.editandoId.set(null);
    this.form.reset({
      fechaProduccion: new Date().toISOString().split('T')[0],
      cantidad: 1,
      costoProduccion: 0,
      descripcion: '',
      prenda: 1,
      empleado: 1
    });
    this.mensajeError.set('');
    this.modalAbierto.set(true);
  }

  editar(prod: Produccion): void {
    this.editandoId.set(prod.idProduccion!);
    this.form.setValue({
      fechaProduccion: prod.fechaProduccion,
      cantidad: prod.cantidad,
      costoProduccion: prod.costoProduccion,
      descripcion: prod.descripcion,
      prenda: prod.idPrenda,
      empleado: prod.idEmpleado
    });
    this.mensajeError.set('');
    this.modalAbierto.set(true);
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const datos = {
      fechaProduccion: v.fechaProduccion,
      cantidad: Number(v.cantidad),
      costoProduccion: Number(v.costoProduccion),
      descripcion: v.descripcion,
      idPrenda: Number(v.prenda),
      idEmpleado: Number(v.empleado)
    };

    const id = this.editandoId();

    this.guardando.set(true);
    this.mensajeError.set('');

    const peticion = id === null
      ? this.produccionService.create(datos)
      : this.produccionService.update(id, datos);

    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrarModal();
        this.cargarProducciones();
      },
      error: (error) => {
        console.error('Error al guardar producción:', error);
        this.guardando.set(false);
        this.mensajeError.set('No se pudo guardar la producción.');
      }
    });
  }

  eliminar(prod: Produccion): void {
    if (!confirm(`¿Eliminar el registro de producción de la fecha ${prod.fechaProduccion}?`)) {
      return;
    }

    this.produccionService.delete(prod.idProduccion).subscribe({
      next: () => this.cargarProducciones(),
      error: (error) => {
        console.error('Error al eliminar producción:', error);
        alert('No se pudo eliminar el registro de producción.');
      }
    });
  }

  cerrarModal(): void {
    this.modalAbierto.set(false);
  }

  campoInvalido(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && control.touched;
  }
}