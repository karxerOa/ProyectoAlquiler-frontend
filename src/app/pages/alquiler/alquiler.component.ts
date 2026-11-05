import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ClienteService, Cliente } from '../../services/cliente.service';
import { EmpleadoService } from '../../services/empleado.service';
import { Empleado } from '../../model/empleado';
import { fechaLima } from '../../model/agenda';
import { normalizar } from '../../model/catalogo';
import { Alquiler } from '../../model/alquiler';
import { AlquilerService } from '../../services/alquiler.service';

@Component({
  selector: 'app-alquiler',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './alquiler.component.html',
  styleUrl: '../../shared/gestion.css',
})
export class AlquilerComponent {
  private readonly alquilerService = inject(AlquilerService);
  private readonly fb = inject(FormBuilder);

  private readonly clientesServicio = inject(ClienteService);
  private readonly empleadosServicio = inject(EmpleadoService);
  private readonly ruta = inject(ActivatedRoute);
  readonly clientes = signal<Cliente[]>([]);
  readonly empleados = signal<Empleado[]>([]);
  readonly buscarCliente = signal('');
  readonly errorOpciones = signal('');
  readonly clientesVisibles = computed(() =>
    this.clientes().filter((c) =>
      normalizar(`${c.nombre} ${c.apellidos}`).includes(normalizar(this.buscarCliente())),
    ),
  );
  busqueda = signal('');
  readonly alquileres = this.alquilerService.$alquileresChange;
  modalAbierto = signal(false);
  editandoId = signal<number | null>(null);
  guardando = signal(false);
  mensajeError = signal('');
  errorCarga = signal('');

  form = this.fb.nonNullable.group({
    fechaAlquiler: [fechaLima(), Validators.required],
    fechaInicio: ['', Validators.required],
    fechaFin: ['', Validators.required],
    estado: ['PENDIENTE', Validators.required],
    subtotal: ['0', [Validators.required, Validators.min(0)]],
    total: ['0', [Validators.required, Validators.min(0)]],
    empleadoId: ['', [Validators.required, Validators.min(1)]],
    clienteId: ['', [Validators.required, Validators.min(1)]],
  });

  alquileresFiltrados = computed(() => {
    const texto = this.busqueda();
    return this.alquileres().filter((alquiler) =>
      `${alquiler.idAlquiler} ${alquiler.estado} ${alquiler.nombreCliente ?? ''} ${alquiler.apellidoCliente ?? ''} ${alquiler.nombreEmpleado ?? ''}`
        .toLowerCase()
        .includes(texto),
    );
  });

  constructor() {
    this.cargarAlquileres();
    this.clientesServicio
      .findAll()
      .subscribe({
        next: (data) => this.clientes.set(data),
        error: () =>
          this.errorOpciones.set(
            'No se pudieron cargar los clientes. Cierra y vuelve a abrir la página para reintentar.',
          ),
      });
    this.empleadosServicio
      .findAll()
      .subscribe({
        next: (data) => this.empleados.set(data),
        error: () =>
          this.errorOpciones.set(
            'No se pudieron cargar los empleados. Cierra y vuelve a abrir la página para reintentar.',
          ),
      });
    if (this.ruta.snapshot.routeConfig?.path === 'alquileres/nuevo') this.nuevo();
  }

  cargarAlquileres(): void {
    this.alquilerService.findAll().subscribe({
      next: (data) => {
        this.alquilerService.setAlquileresChange(data);
        this.errorCarga.set('');
      },
      error: (error: unknown) => {
        console.error('Error al cargar alquileres:', error);
        this.errorCarga.set('No se pudieron cargar los alquileres.');
      },
    });
  }

  buscar(valor: string): void {
    this.busqueda.set(valor.trim().toLowerCase());
  }

  nuevo(): void {
    this.buscarCliente.set('');
    this.editandoId.set(null);
    this.form.reset({
      fechaAlquiler: fechaLima(),
      fechaInicio: '',
      fechaFin: '',
      estado: 'PENDIENTE',
      subtotal: '0',
      total: '0',
      empleadoId: '',
      clienteId: '',
    });
    this.mensajeError.set('');
    this.modalAbierto.set(true);
  }

  editar(alquiler: Alquiler): void {
    this.editandoId.set(alquiler.idAlquiler);
    this.form.setValue({
      fechaAlquiler: alquiler.fechaAlquiler.slice(0, 10),
      fechaInicio: alquiler.fechaInicio.slice(0, 10),
      fechaFin: alquiler.fechaFin.slice(0, 10),
      estado: alquiler.estado,
      subtotal: String(alquiler.subtotal),
      total: String(alquiler.total),
      empleadoId: String(alquiler.empleadoId),
      clienteId: String(alquiler.clienteId),
    });
    this.mensajeError.set('');
    this.modalAbierto.set(true);
  }

  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    if (value.fechaFin < value.fechaInicio) {
      this.mensajeError.set('La fecha final debe ser igual o posterior a la fecha inicial.');
      return;
    }

    const data = {
      ...value,
      subtotal: Number(value.subtotal),
      total: Number(value.total),
      empleadoId: Number(value.empleadoId),
      clienteId: Number(value.clienteId),
    };
    const id = this.editandoId();
    this.guardando.set(true);
    this.mensajeError.set('');

    const request =
      id === null ? this.alquilerService.create(data) : this.alquilerService.update(id, data);

    request.subscribe({
      next: () => {
        this.guardando.set(false);
        this.modalAbierto.set(false);
        this.cargarAlquileres();
      },
      error: (error: unknown) => {
        console.error('Error al guardar alquiler:', error);
        this.guardando.set(false);
        this.mensajeError.set(
          'No se pudo guardar el alquiler. Verifica los IDs de cliente y empleado.',
        );
      },
    });
  }

  eliminar(alquiler: Alquiler): void {
    if (!confirm(`¿Eliminar el alquiler #${alquiler.idAlquiler}?`)) return;
    this.alquilerService.delete(alquiler.idAlquiler).subscribe({
      next: () => this.cargarAlquileres(),
      error: (error: unknown) => {
        console.error('Error al eliminar alquiler:', error);
        alert('No se pudo eliminar el alquiler. Puede tener registros asociados.');
      },
    });
  }

  campoInvalido(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && control.touched;
  }
}
