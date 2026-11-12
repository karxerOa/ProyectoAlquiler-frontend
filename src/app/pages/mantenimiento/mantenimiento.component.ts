import { UiService } from '../../shared/ui.service';
import { MATERIAL } from '../../shared/material';
import { ActivatedRoute } from '@angular/router';
import { ReferenciasService } from '../../services/referencias.service';
import { SelectorReferenciaComponent } from '../../shared/selector-referencia.component';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Mantenimiento } from '../../model/mantenimiento';
import { MantenimientoService } from '../../services/mantenimiento.service';

@Component({
  selector: 'app-mantenimiento',
  standalone: true,
  imports: [...MATERIAL, ReactiveFormsModule, SelectorReferenciaComponent],
  templateUrl: './mantenimiento.component.html',
  styleUrl: '../../shared/gestion.css',
})
export class MantenimientoComponent {
  private readonly ui = inject(UiService);
  readonly ref = inject(ReferenciasService);
  private readonly ruta = inject(ActivatedRoute);
  readonly origen = signal('');
  readonly origenes = computed(() =>
    this.ref
      .devoluciones()
      .filter((d) => d.idDevolucion != null && d.estadoPrenda !== 'INCOMPLETO')
      .map((d) => ({ valor: d.idDevolucion!, nombre: this.ref.devolucion(d.idDevolucion!) })),
  );
  readonly prendasRecibidas = computed(() => {
    const d = this.ref.devoluciones().find((d) => d.idDevolucion === Number(this.origen()));
    return d && d.estadoPrenda !== 'INCOMPLETO'
      ? this.ref
          .opcionesPrendas()
          .filter((p) =>
            this.ref
              .detalles()
              .some((item) => item.alquilerId === d.alquilerId && item.prendaId === p.valor),
          )
      : [];
  });
  cambiarOrigen(v: string) {
    this.origen.set(v);
    this.form.controls.prendaId.setValue('');
  }

  private readonly mantenimientoService = inject(MantenimientoService);
  private readonly fb = inject(FormBuilder);

  busqueda = signal('');
  readonly mantenimientos = this.mantenimientoService.$mantenimientosChange;
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
    empleadoId: ['', [Validators.required, Validators.min(1)]],
  });

  mantenimientosFiltrados = computed(() => {
    const texto = this.busqueda();
    return this.mantenimientos().filter((item) =>
      `${item.tipoMantenimiento} ${item.descripcion} ${item.estado} ${this.ref.prenda(item.prendaId)} ${this.ref.empleado(item.empleadoId)}`
        .toLowerCase()
        .includes(texto),
    );
  });

  constructor() {
    this.cargar();
    if (this.ruta.snapshot.queryParamMap.has('devolucion')) {
      this.nuevo();
      this.origen.set(this.ruta.snapshot.queryParamMap.get('devolucion') || '');
      this.form.controls.prendaId.setValue(this.ruta.snapshot.queryParamMap.get('prenda') || '');
    }
  }

  cargar(): void {
    this.mantenimientoService.findAll().subscribe({
      next: (data) => {
        this.mantenimientoService.setMantenimientosChange(data);
        this.errorCarga.set('');
      },
      error: (error: unknown) => {
        console.error('Error al cargar mantenimientos:', error);
        this.errorCarga.set('No se pudieron cargar los mantenimientos.');
      },
    });
  }

  buscar(valor: string): void {
    this.busqueda.set(valor.trim().toLowerCase());
  }

  nuevo(): void {
    this.form.controls.prendaId.enable();
    this.origen.set('');
    this.editandoId.set(null);
    this.form.reset({
      fechaInicio: new Date().toISOString().slice(0, 10),
      fechaFin: '',
      tipoMantenimiento: '',
      descripcion: '',
      costo: 0,
      estado: 'EN CURSO',
      prendaId: '',
      empleadoId: '',
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
      empleadoId: String(item.empleadoId),
    });
    this.form.controls.prendaId.disable();
    this.mensajeError.set('');
    this.modalAbierto.set(true);
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    if (
      this.editandoId() === null &&
      (!this.origenes().some((o) => o.valor === Number(this.origen())) ||
        !this.prendasRecibidas().some((p) => p.valor === Number(this.form.controls.prendaId.value)))
    ) {
      this.mensajeError.set(
        'Selecciona una devolución completa y una prenda recibida en ese alquiler.',
      );
      return;
    }
    const value = this.form.getRawValue();
    if (value.fechaFin < value.fechaInicio) {
      this.mensajeError.set('La fecha final no puede ser anterior a la fecha inicial.');
      return;
    }
    const contexto =
      this.editandoId() === null
        ? `Recepción: ${this.ref.devolucion(Number(this.origen()))}. `
        : '';
    if ((contexto + value.descripcion).length > 255) {
      this.mensajeError.set(
        'Reduce la descripción para guardar también el contexto de recepción (máximo 255 caracteres).',
      );
      return;
    }
    const data = {
      ...value,
      descripcion: contexto + value.descripcion,
      prendaId: Number(value.prendaId),
      empleadoId: Number(value.empleadoId),
    };
    const id = this.editandoId();
    this.guardando.set(true);
    this.mensajeError.set('');
    const request =
      id === null
        ? this.mantenimientoService.create(data)
        : this.mantenimientoService.update(id, data);
    request.subscribe({
      next: () => {
        this.guardando.set(false);
        this.modalAbierto.set(false);
        this.ref.cargar(true);
        this.cargar();
      },
      error: (error: unknown) => {
        console.error('Error al guardar mantenimiento:', error);
        this.guardando.set(false);
        this.mensajeError.set('No se pudo guardar. Revisa la prenda y el empleado seleccionados.');
      },
    });
  }

  async eliminar(item: Mantenimiento): Promise<void> {
    if (!(await this.ui.confirm('¿Eliminar este mantenimiento?'))) return;
    this.mantenimientoService.delete(item.idMantenimiento).subscribe({
      next: () => this.cargar(),
      error: (error: unknown) => {
        console.error('Error al eliminar mantenimiento:', error);
        this.ui.notify('No se pudo eliminar el mantenimiento.');
      },
    });
  }

  campoInvalido(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && control.touched;
  }
}
