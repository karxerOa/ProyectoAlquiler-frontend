import { Component, computed, effect, inject, signal, untracked } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Categoria } from '../../model/categoria';
import { CategoriaService } from '../../services/categoria.service';

@Component({
  selector: 'app-categoria',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './categoria.component.html',
  styleUrl: './categoria.component.css'
})
export class CategoriaComponent {
  private categoriaService = inject(CategoriaService);
  private fb = inject(FormBuilder);

  busqueda = signal('');
  readonly categorias = this.categoriaService.$categoriasChange;
  errorCarga = signal('');
  mensajeExito = signal('');

  modalAbierto = signal(false);
  editandoId = signal<number | null>(null);
  guardando = signal(false);
  mensajeError = signal('');

  form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(100)]],
    descripcion: ['', [Validators.required, Validators.maxLength(255)]],
    estado: ['ACTIVO', [Validators.required]]
  });

  categoriasFiltradas = computed(() => {
    const texto = this.busqueda();
    return this.categorias().filter(cat =>
      `${cat.nombre} ${cat.descripcion} ${cat.estado}`
        .toLowerCase()
        .includes(texto)
    );
  });

  constructor() {
    this.cargarCategorias();
    effect(() => {
      const message = this.categoriaService.$messageChange();
      if (message) {
        this.mensajeExito.set(message);
        untracked(() => this.categoriaService.setMessageChange(''));
      }
    });
  }

  cargarCategorias(): void {
    this.categoriaService.findAll().subscribe({
      next: (data) => {
        this.categoriaService.setCategoriasChange(data);
        this.errorCarga.set('');
      },
      error: (error: unknown) => {
        console.error('Error al cargar categorías:', error);
        this.errorCarga.set('No se pudieron cargar las categorías. Verifica la conexión con el servidor.');
      }
    });
  }

  buscar(valor: string): void {
    this.busqueda.set(valor.trim().toLowerCase());
  }

  nuevo(): void {
    this.editandoId.set(null);
    this.form.reset({ estado: 'ACTIVO' });
    this.mensajeError.set('');
    this.mensajeExito.set('');
    this.modalAbierto.set(true);
  }

  editar(categoria: Categoria): void {
    this.editandoId.set(categoria.idCategoria);
    this.form.setValue({
      nombre: categoria.nombre,
      descripcion: categoria.descripcion,
      estado: categoria.estado
    });
    this.mensajeError.set('');
    this.mensajeExito.set('');
    this.modalAbierto.set(true);
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const datos = this.form.getRawValue();
    const id = this.editandoId();

    this.guardando.set(true);
    this.mensajeError.set('');

    const peticion = id === null
      ? this.categoriaService.create(datos)
      : this.categoriaService.update(id, datos);

    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrarModal();
        this.categoriaService.setMessageChange(
          id === null ? 'Categoría creada correctamente.' : 'Categoría actualizada correctamente.'
        );
        this.cargarCategorias();
      },
      error: (error: unknown) => {
        console.error('Error al guardar categoría:', error);
        this.guardando.set(false);
        this.mensajeError.set('No se pudo guardar la categoría.');
      }
    });
  }

  eliminar(categoria: Categoria): void {
    if (!confirm(`¿Eliminar la categoría "${categoria.nombre}"?`)) {
      return;
    }

    this.categoriaService.delete(categoria.idCategoria).subscribe({
      next: () => {
        this.categoriaService.setMessageChange('Categoría eliminada correctamente.');
        this.cargarCategorias();
      },
      error: (error) => {
        console.error('Error al eliminar categoría:', error);
        alert('No se pudo eliminar la categoría.');
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