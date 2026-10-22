import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  MantenimientoService,
  MantenimientoResponse,
  PrendaSimple,
  EmpleadoSimple,
} from '../../services/mantenimiento.service';

const TIPOS   = ['LIMPIEZA', 'REPARACION', 'PLANCHADO', 'COSTURA', 'OTRO'];
const ESTADOS = ['PENDIENTE', 'EN_PROCESO', 'COMPLETADO', 'CANCELADO'];

@Component({
  selector: 'app-mantenimiento',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './mantenimiento.component.html',
  styleUrl: './mantenimiento.component.css',
})
export class MantenimientoComponent implements OnInit {
  private mantenimientoService = inject(MantenimientoService);
  private fb = inject(FormBuilder);

  // ── datos ──────────────────────────────────────────────────────────────────
  mantenimientos = signal<MantenimientoResponse[]>([]);
  prendas        = signal<PrendaSimple[]>([]);
  empleados      = signal<EmpleadoSimple[]>([]);
  readonly tipos   = TIPOS;
  readonly estados = ESTADOS;

  // ── UI ─────────────────────────────────────────────────────────────────────
  busqueda     = signal('');
  modalAbierto = signal(false);
  editandoId   = signal<number | null>(null);
  guardando    = signal(false);
  mensajeError = signal('');
  cargando     = signal(false);

  // ── formulario ─────────────────────────────────────────────────────────────
  form = this.fb.nonNullable.group({
    fechaInicio:       ['', Validators.required],
    fechaFin:          ['', Validators.required],
    tipoMantenimiento: ['', Validators.required],
    descripcion:       ['', [Validators.required, Validators.maxLength(200)]],
    costo:             [0,  [Validators.required, Validators.min(0)]],
    estado:            ['PENDIENTE', Validators.required],
    idPrenda:          [0,  Validators.required],
    idEmpleado:        [0,  Validators.required],
  });

  // ── computed ────────────────────────────────────────────────────────────────
  mantenimientosFiltrados = computed(() => {
    const txt = this.busqueda().toLowerCase();
    return this.mantenimientos().filter(m =>
      `${m.tipoMantenimiento} ${m.descripcion} ${m.estado} ${m.prenda?.nombre ?? ''} ${m.empleado?.nombres ?? ''} ${m.empleado?.apellidos ?? ''}`
        .toLowerCase()
        .includes(txt)
    );
  });

  // ── ciclo de vida ───────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.cargar();
    this.cargarDependencias();
  }

  cargar(): void {
    this.cargando.set(true);
    this.mantenimientoService.findAll().subscribe({
      next:  (data) => { this.mantenimientos.set(data); this.cargando.set(false); },
      error: (err)  => { console.error('Error al cargar mantenimientos:', err); this.cargando.set(false); },
    });
  }

  cargarDependencias(): void {
    this.mantenimientoService.getPrendas().subscribe({
      next:  (data) => this.prendas.set(data),
      error: (err)  => console.error('Error al cargar prendas:', err),
    });
    this.mantenimientoService.getEmpleados().subscribe({
      next:  (data) => this.empleados.set(data),
      error: (err)  => console.error('Error al cargar empleados:', err),
    });
  }

  buscar(valor: string): void {
    this.busqueda.set(valor.trim().toLowerCase());
  }

  // ── acciones ────────────────────────────────────────────────────────────────
  nuevo(): void {
    this.editandoId.set(null);
    this.form.reset({ estado: 'PENDIENTE', costo: 0, idPrenda: 0, idEmpleado: 0 });
    this.mensajeError.set('');
    this.modalAbierto.set(true);
  }

  editar(m: MantenimientoResponse): void {
    this.editandoId.set(m.idMantenimiento);
    this.form.setValue({
      fechaInicio:       m.fechaInicio,
      fechaFin:          m.fechaFin,
      tipoMantenimiento: m.tipoMantenimiento,
      descripcion:       m.descripcion,
      costo:             m.costo,
      estado:            m.estado,
      idPrenda:          m.prenda?.idPrenda   ?? 0,
      idEmpleado:        m.empleado?.idEmpleado ?? 0,
    });
    this.mensajeError.set('');
    this.modalAbierto.set(true);
  }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }

    const v  = this.form.getRawValue();
    const id = this.editandoId();
    this.guardando.set(true);
    this.mensajeError.set('');

    const peticion = id === null
      ? this.mantenimientoService.create(v)
      : this.mantenimientoService.update(id, v);

    peticion.subscribe({
      next: () => { this.guardando.set(false); this.cerrarModal(); this.cargar(); },
      error: (err) => {
        console.error('Error al guardar mantenimiento:', err);
        this.guardando.set(false);
        this.mensajeError.set('No se pudo guardar. Verifica los datos e inténtalo de nuevo.');
      },
    });
  }

  eliminar(m: MantenimientoResponse): void {
    if (!confirm(`¿Eliminar el mantenimiento #${m.idMantenimiento}?`)) return;
    this.mantenimientoService.delete(m.idMantenimiento).subscribe({
      next:  () => this.cargar(),
      error: (err) => {
        console.error('Error al eliminar mantenimiento:', err);
        alert('No se pudo eliminar el mantenimiento.');
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
      PENDIENTE:  'badge-warn',
      EN_PROCESO: 'badge-info',
      COMPLETADO: 'badge-ok',
      CANCELADO:  'badge-off',
    };
    return map[estado] ?? '';
  }
}
