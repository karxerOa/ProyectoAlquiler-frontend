import { HttpErrorResponse } from '@angular/common/http';
import { UiService } from '../../shared/ui.service';
import { MATERIAL } from '../../shared/material';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import type { Empleado } from '../../model/empleado';
import { EmpleadoService } from '../../services/empleado.service';
import type { ActualizarEmpleado, NuevoEmpleado } from '../../services/empleado.service';

@Component({
  selector: 'app-empleado',
  standalone: true,
  imports: [...MATERIAL, ReactiveFormsModule],
  templateUrl: './empleado.component.html',
  styleUrl: './empleado.component.css',
})
export class EmpleadoComponent {
  private readonly ui = inject(UiService);
  private readonly empleadoService = inject(EmpleadoService);
  private readonly fb = inject(FormBuilder);

  busqueda = signal('');
  readonly empleados = this.empleadoService.$empleadosChange;

  modalAbierto = signal(false);
  editandoId = signal<number | null>(null);
  guardando = signal(false);
  mensajeError = signal('');

  form = this.fb.nonNullable.group({
    nombres: ['', [Validators.required, Validators.maxLength(50)]],
    apellidos: ['', [Validators.required, Validators.maxLength(50)]],
    dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    telefono: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
    cargo: ['', [Validators.required, Validators.maxLength(50)]],
    estado: ['Activo', [Validators.required]],
    username: ['', [Validators.required, Validators.maxLength(20)]],
    password: ['', Validators.minLength(8)],
  });

  empleadosFiltrados = computed(() => {
    const texto = this.busqueda();
    return this.empleados().filter((empleado) =>
      `${empleado.nombres} ${empleado.apellidos} ${empleado.dni} ${empleado.telefono} ${empleado.cargo}`
        .toLowerCase()
        .includes(texto),
    );
  });

  constructor() {
    this.cargarEmpleados();
  }

  cargarEmpleados(): void {
    this.empleadoService.findAll().subscribe({
      next: (data) => this.empleadoService.setEmpleadosChange(data),
      error: (error) => console.error('Error al cargar empleados:', error),
    });
  }

  buscar(valor: string): void {
    this.busqueda.set(valor.trim().toLowerCase());
  }

  // ---------- NUEVO ----------
  nuevo(): void {
    this.editandoId.set(null);
    this.form.reset({
      nombres: '',
      apellidos: '',
      dni: '',
      telefono: '',
      cargo: '',
      estado: 'Activo',
      username: '',
      password: '',
    });
    this.form.controls.password.setValidators([Validators.required, Validators.minLength(8)]);
    this.form.controls.password.updateValueAndValidity();
    this.mensajeError.set('');
    this.modalAbierto.set(true);
  }

  // ---------- EDITAR ----------
  editar(empleado: Empleado): void {
    this.editandoId.set(empleado.idEmpleado);
    this.form.setValue({
      nombres: empleado.nombres,
      apellidos: empleado.apellidos,
      dni: String(empleado.dni),
      telefono: String(empleado.telefono),
      cargo: empleado.cargo,
      estado: empleado.estado,
      username: empleado.username ?? '',
      password: '',
    });
    this.form.controls.password.setValidators([Validators.minLength(8)]);
    this.form.controls.password.updateValueAndValidity();
    this.mensajeError.set('');
    this.modalAbierto.set(true);
  }

  // ---------- GUARDAR (sirve para nuevo y editar) ----------
  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { password, ...value } = this.form.getRawValue();
    const datos = {
      ...value,
      dni: value.dni.trim(),
      telefono: value.telefono.trim(),
      username: value.username.trim(),
    };
    const id = this.editandoId();

    this.guardando.set(true);
    this.mensajeError.set('');

    const peticion =
      id === null
        ? this.empleadoService.create({ ...datos, password } satisfies NuevoEmpleado)
        : this.empleadoService.update(
            id,
            (password ? { ...datos, password } : datos) satisfies ActualizarEmpleado,
          );

    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrarModal();
        this.cargarEmpleados();
      },
      error: (error) => {
        console.error('Error al guardar empleado:', error);
        this.guardando.set(false);
        this.mensajeError.set(this.mensajeDeError(error));
      },
    });
  }

  private mensajeDeError(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'No se pudo guardar el empleado. Inténtalo nuevamente.';
    }

    const body: unknown = error.error;
    if (typeof body === 'string' && body.trim()) return body;
    if (body && typeof body === 'object') {
      const datos = body as Record<string, unknown>;
      for (const key of ['message', 'detail', 'title', 'error']) {
        const mensaje = datos[key];
        if (typeof mensaje === 'string' && mensaje.trim()) return mensaje;
      }
      const errores = datos['errors'];
      if (Array.isArray(errores)) {
        const mensajes = errores
          .map((item: unknown) => {
            if (typeof item === 'string') return item;
            if (!item || typeof item !== 'object') return '';
            const detalle = item as Record<string, unknown>;
            const campo = detalle['field'];
            const mensaje = detalle['defaultMessage'] ?? detalle['message'];
            return typeof mensaje === 'string'
              ? `${typeof campo === 'string' ? `${campo}: ` : ''}${mensaje}`
              : '';
          })
          .filter(Boolean);
        if (mensajes.length) return mensajes.join(' ');
      } else if (errores && typeof errores === 'object') {
        const mensajes = Object.entries(errores as Record<string, unknown>)
          .map(([campo, mensaje]) => {
            if (typeof mensaje === 'string') return `${campo}: ${mensaje}`;
            if (!Array.isArray(mensaje)) return '';
            const detalles = mensaje.filter((item): item is string => typeof item === 'string');
            return detalles.length ? `${campo}: ${detalles.join(', ')}` : '';
          })
          .filter(Boolean);
        if (mensajes.length) return mensajes.join(' ');
      }
    }

    return `No se pudo guardar el empleado (HTTP ${error.status}).`;
  }

  // ---------- ELIMINAR ----------
  async eliminar(empleado: Empleado): Promise<void> {
    if (!(await this.ui.confirm(`¿Eliminar a ${empleado.nombres} ${empleado.apellidos}?`))) {
      return;
    }

    this.empleadoService.delete(empleado.idEmpleado).subscribe({
      next: () => this.cargarEmpleados(),
      error: (error) => {
        console.error('Error al eliminar empleado:', error);
        this.ui.notify('No se pudo eliminar. Puede que el empleado tenga registros asociados.');
      },
    });
  }

  cerrarModal(): void {
    this.modalAbierto.set(false);
    this.form.controls.password.clearValidators();
    this.form.controls.password.updateValueAndValidity();
  }

  campoInvalido(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && control.touched;
  }
}
