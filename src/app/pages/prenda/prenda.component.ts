import { AuthService } from '../../services/auth.service';
import { UiService } from '../../shared/ui.service';
import { MATERIAL } from '../../shared/material';
import { prendaActiva } from '../../model/flujo';
import { ReferenciasService } from '../../services/referencias.service';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  coincidePrenda,
  filtrosIniciales,
  FiltrosCatalogo,
  indexarPrenda,
  normalizar,
} from '../../model/catalogo';
import { CategoriaService } from '../../services/categoria.service';
import { Categoria } from '../../model/categoria';
import { Prenda, PrendaData } from '../../model/prenda';
import { PrendaService } from '../../services/prenda.service';

@Component({
  selector: 'app-prenda',
  standalone: true,
  imports: [...MATERIAL, ReactiveFormsModule, CurrencyPipe, RouterLink],
  templateUrl: './prenda.component.html',
  styleUrls: ['../../shared/gestion.css', './prenda.component.css'],
})
export class PrendaComponent {
  readonly isAdmin = inject(AuthService).isAdmin;
  private archivo?: File;

  seleccionarImagen(input: HTMLInputElement): void {
    this.archivo = input.files?.[0];
    input.setCustomValidity('');
    if (this.archivo && !this.imagenValida(this.archivo)) {
      input.setCustomValidity('Selecciona una imagen JPG o PNG válida de hasta 1 MiB.');
      input.reportValidity();
    } else {
      this.mensajeError.set('');
    }
  }

  private imagenValida(archivo: File): boolean {
    return archivo.size <= 1048576 && ['image/jpeg', 'image/png'].includes(archivo.type);
  }

  imagenObligatoria(): boolean {
    const id = this.editandoId();
    return id === null || !this.prendas().find((prenda) => prenda.idPrenda === id)?.imagen;
  }

  private leerImagen(archivo: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const lector = new FileReader();
      lector.onload = () => resolve(String(lector.result));
      lector.onerror = () => reject(lector.error);
      lector.readAsDataURL(archivo);
    });
  }

  private readonly ui = inject(UiService);
  readonly ref = inject(ReferenciasService);
  readonly camposFiltro = ['talla', 'color', 'estado', 'genero'] as const;
  private readonly categoriaService = inject(CategoriaService);
  readonly categoriasRegistro = signal<Categoria[]>([]);
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
    categoriaId: ['', [Validators.required, Validators.min(1)]],
  });

  readonly filtros = signal(filtrosIniciales());
  readonly indice = computed(() =>
    this.prendas()
      .filter((p) => prendaActiva(p.estado))
      .map(indexarPrenda),
  );
  readonly prendasFiltradas = computed(() =>
    this.indice()
      .filter((item) => coincidePrenda(item, this.busqueda(), this.filtros()))
      .map((item) => item.prenda),
  );
  readonly categorias = computed(() => [
    ...new Map(
      this.prendas()
        .filter((p) => prendaActiva(p.estado))
        .map((p) => [
          p.categoriaId,
          {
            id: String(p.categoriaId),
            nombre: p.categoriaNombre || this.ref.categoria(p.categoriaId),
          },
        ]),
    ).values(),
  ]);
  opciones(campo: 'talla' | 'color' | 'estado' | 'genero'): string[] {
    return [...new Set(this.indice().map((p) => p[campo]))].filter(Boolean).sort();
  }
  filtrar(campo: keyof FiltrosCatalogo, valor: string): void {
    const numero = valor === '' ? null : Number(valor);
    this.filtros.update((actual) => ({
      ...actual,
      [campo]:
        campo === 'minimo' || campo === 'maximo'
          ? numero !== null && Number.isFinite(numero)
            ? Math.max(0, numero)
            : null
          : valor,
    }));
  }
  limpiar(): void {
    this.filtros.set(filtrosIniciales());
    this.busqueda.set('');
  }
  disponible(prenda: Prenda): boolean {
    return normalizar(prenda.estado) === 'disponible';
  }

  constructor() {
    this.cargar();
    this.categoriaService.findAll().subscribe({
      next: (data) => this.categoriasRegistro.set(data),
      error: () =>
        this.mensajeError.set(
          'No se pudieron cargar las categorías. Reabre la página para reintentar.',
        ),
    });
  }

  cargar(): void {
    this.prendaService.findAll().subscribe({
      next: (data) => {
        this.prendaService.setPrendasChange(data);
        this.ref.prendas.set(data);
        this.errorCarga.set('');
      },
      error: (error: unknown) => {
        console.error('Error al cargar prendas:', error);
        this.errorCarga.set('No se pudieron cargar las prendas.');
      },
    });
  }

  buscar(valor: string): void {
    this.busqueda.set(valor.trim().toLowerCase());
  }

  nuevo(): void {
    this.archivo = undefined;
    this.editandoId.set(null);
    this.form.reset({
      nombre: '',
      descripcion: '',
      talla: '',
      color: '',
      precioAlquiler: 0,
      estado: 'DISPONIBLE',
      categoriaId: '',
    });
    this.mensajeError.set('');
    this.modalAbierto.set(true);
  }

  editar(prenda: Prenda): void {
    this.archivo = undefined;
    this.editandoId.set(prenda.idPrenda);
    this.form.setValue({
      nombre: prenda.nombre,
      descripcion: prenda.descripcion,
      talla: prenda.talla,
      color: prenda.color,
      precioAlquiler: prenda.precioAlquiler,
      estado: prenda.estado.trim(),
      categoriaId: String(prenda.categoriaId),
    });
    this.mensajeError.set('');
    this.modalAbierto.set(true);
  }

  async guardar(): Promise<void> {
    if (this.guardando()) return;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (this.imagenObligatoria() && !this.archivo) {
      this.mensajeError.set(
        'La foto es obligatoria. Selecciona una imagen JPG o PNG de hasta 1 MiB.',
      );
      return;
    }
    if (this.archivo && !this.imagenValida(this.archivo)) {
      this.mensajeError.set('Selecciona una imagen JPG o PNG válida de hasta 1 MiB.');
      return;
    }
    const value = this.form.getRawValue();
    const data: PrendaData = { ...value, categoriaId: Number(value.categoriaId) };
    const id = this.editandoId();
    this.guardando.set(true);
    this.mensajeError.set('');
    if (this.isAdmin() && this.archivo) {
      try {
        data.imagen = await this.leerImagen(this.archivo);
      } catch {
        this.guardando.set(false);
        this.mensajeError.set('No se pudo leer la foto. Selecciona el archivo de nuevo.');
        return;
      }
    } else if (this.isAdmin() && id !== null) {
      const imagenActual = this.prendas().find((prenda) => prenda.idPrenda === id)?.imagen;
      if (imagenActual) data.imagen = imagenActual;
    }
    const request =
      id === null ? this.prendaService.create(data) : this.prendaService.update(id, data);
    request.subscribe({
      next: () => {
        this.guardando.set(false);
        this.modalAbierto.set(false);
        this.cargar();
      },
      error: (error: unknown) => {
        console.error('Error al guardar prenda:', error);
        this.guardando.set(false);
        this.mensajeError.set(
          this.archivo
            ? 'No se pudo guardar. Revisa que la foto sea JPG o PNG y de hasta 1 MiB.'
            : 'No se pudo guardar la prenda. Revisa la categoría seleccionada.',
        );
      },
    });
  }

  async eliminar(prenda: Prenda): Promise<void> {
    if (!(await this.ui.confirm(`¿Eliminar la prenda "${prenda.nombre}"?`))) return;
    this.prendaService.delete(prenda.idPrenda).subscribe({
      next: () => this.cargar(),
      error: (error: unknown) => {
        console.error('Error al eliminar prenda:', error);
        this.ui.notify('No se pudo eliminar la prenda. Puede tener registros asociados.');
      },
    });
  }

  campoInvalido(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && control.touched;
  }
}
