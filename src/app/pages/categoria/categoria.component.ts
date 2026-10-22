import { Component, computed, inject, OnInit, signal } from '@angular/core';
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
export class CategoriaComponent implements OnInit {
  private categoriaService = inject(CategoriaService);
  private fb = inject(FormBuilder);

  busqueda = signal('');
  categorias = signal<Categoria[]>([]);

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

  ngOnInit(): void {
    this.cargarCategorias();
  }

  cargarCategorias(): void {
    this.categoriaService.findAll().subscribe({
      next: (data) => this.categorias.set(data),
      error: (error) => console.error('Error al cargar categorías:', error)
    });
  }

  buscar(valor: string): void {
    this.busqueda.set(valor.trim().toLowerCase());
  }

  nuevo(): void {
    this.editandoId.set(null);
    this.form.reset({ estado: 'ACTIVO' });
    this.mensajeError.set('');
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
      next: () => this.cargarCategorias(),
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