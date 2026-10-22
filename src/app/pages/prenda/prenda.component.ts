import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  PrendaService,
  PrendaResponse,
  CategoriaSimple,
} from '../../services/prenda.service';

const ESTADOS = ['DISPONIBLE', 'ALQUILADO', 'EN_MANTENIMIENTO', 'DADO_DE_BAJA'];
const TALLAS   = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'ÚNICO'];

@Component({
  selector: 'app-prenda',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './prenda.component.html',
  styleUrl: './prenda.component.css',
})
export class PrendaComponent implements OnInit {
  private prendaService = inject(PrendaService);
  private fb = inject(FormBuilder);

  // ── datos ──────────────────────────────────────────────────────────────────
  prendas    = signal<PrendaResponse[]>([]);
  categorias = signal<CategoriaSimple[]>([]);
  readonly estados = ESTADOS;
  readonly tallas  = TALLAS;

  // ── UI ─────────────────────────────────────────────────────────────────────
  busqueda     = signal('');
  modalAbierto = signal(false);
  editandoId   = signal<number | null>(null);
  guardando    = signal(false);
  mensajeError = signal('');
  cargando     = signal(false);

  // ── formulario ─────────────────────────────────────────────────────────────
  form = this.fb.nonNullable.group({
    nombre:        ['', [Validators.required, Validators.maxLength(80)]],
    descripcion:   ['', [Validators.required, Validators.maxLength(200)]],
    talla:         ['', Validators.required],
    color:         ['', [Validators.required, Validators.maxLength(40)]],
    precioAlquiler:[0,  [Validators.required, Validators.min(0.01)]],
    estado:        ['DISPONIBLE', Validators.required],
    idCategoria:   [0,  Validators.required],
  });

  // ── computed ────────────────────────────────────────────────────────────────
  prendasFiltradas = computed(() => {
    const txt = this.busqueda().toLowerCase();
    return this.prendas().filter(p =>
      `${p.nombre} ${p.talla} ${p.color} ${p.estado} ${p.categoria?.nombre ?? ''}`
        .toLowerCase()
        .includes(txt)
    );
  });

  // ── ciclo de vida ───────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.cargar();
    this.cargarCategorias();
  }

  cargar(): void {
    this.cargando.set(true);
    this.prendaService.findAll().subscribe({
      next:  (data) => { this.prendas.set(data); this.cargando.set(false); },
      error: (err)  => { console.error('Error al cargar prendas:', err); this.cargando.set(false); },
    });
  }

  cargarCategorias(): void {
    this.prendaService.getCategorias().subscribe({
      next:  (data) => this.categorias.set(data),
      error: (err)  => console.error('Error al cargar categorías:', err),
    });
  }

  buscar(valor: string): void {
    this.busqueda.set(valor.trim().toLowerCase());
  }

  // ── acciones ────────────────────────────────────────────────────────────────
  nuevo(): void {
    this.editandoId.set(null);
    this.form.reset({ estado: 'DISPONIBLE', precioAlquiler: 0, idCategoria: 0 });
    this.mensajeError.set('');
    this.modalAbierto.set(true);
  }

  editar(p: PrendaResponse): void {
    this.editandoId.set(p.idPrenda);
    this.form.setValue({
      nombre:         p.nombre,
      descripcion:    p.descripcion,
      talla:          p.talla,
      color:          p.color,
      precioAlquiler: p.precioAlquiler,
      estado:         p.estado,
      idCategoria:    p.categoria?.idCategoria ?? 0,
    });
    this.mensajeError.set('');
    this.modalAbierto.set(true);
  }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const v = this.form.getRawValue();
    const id = this.editandoId();
    this.guardando.set(true);
    this.mensajeError.set('');

    const peticion = id === null
      ? this.prendaService.create(v)
      : this.prendaService.update(id, v);

    peticion.subscribe({
      next: () => { this.guardando.set(false); this.cerrarModal(); this.cargar(); },
      error: (err) => {
        console.error('Error al guardar prenda:', err);
        this.guardando.set(false);
        this.mensajeError.set('No se pudo guardar. Verifica los datos e inténtalo de nuevo.');
      },
    });
  }

  eliminar(p: PrendaResponse): void {
    if (!confirm(`¿Eliminar la prenda "${p.nombre}"?`)) return;
    this.prendaService.delete(p.idPrenda).subscribe({
      next:  () => this.cargar(),
      error: (err) => {
        console.error('Error al eliminar prenda:', err);
        alert('No se pudo eliminar. La prenda puede tener registros asociados.');
      },
    });
  }

  cerrarModal(): void { this.modalAbierto.set(false); }

  campoInvalido(campo: string): boolean {
    const c = this.form.get(campo);
    return !!c && c.invalid && c.touched;
  }

  estadoBadge(estado: string): string {
    const map: Record<string, string> = {
      DISPONIBLE:      'badge-ok',
      ALQUILADO:       'badge-info',
      EN_MANTENIMIENTO:'badge-warn',
      DADO_DE_BAJA:    'badge-off',
    };
    return map[estado] ?? '';
  }
}
