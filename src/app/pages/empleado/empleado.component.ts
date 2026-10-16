import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Empleado } from '../../model/empleado';
import { EmpleadoService } from '../../services/empleado.service';

@Component({
  selector: 'app-empleado',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './empleado.component.html',
  styleUrl: './empleado.component.css'
})
export class EmpleadoComponent implements OnInit {
  private empleadoService = inject(EmpleadoService);
  private fb = inject(FormBuilder);

  busqueda = signal('');
  empleados = signal<Empleado[]>([]);

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
  });

  empleadosFiltrados = computed(() => {
    const texto = this.busqueda();
    return this.empleados().filter(empleado =>
      `${empleado.nombres} ${empleado.apellidos} ${empleado.dni} ${empleado.telefono} ${empleado.cargo}`
        .toLowerCase()
        .includes(texto)
    );
  });

  ngOnInit(): void {
    this.cargarEmpleados();
  }

  cargarEmpleados(): void {
    this.empleadoService.findAll().subscribe({
      next: (data) => this.empleados.set(data),
      error: (error) => console.error('Error al cargar empleados:', error)
    });
  }

  buscar(valor: string): void {
    this.busqueda.set(valor.trim().toLowerCase());
  }

  // ---------- NUEVO ----------
  nuevo(): void {
    this.editandoId.set(null);
    this.form.reset(); // vuelve a los valores iniciales (estado = 'Activo')
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
    });
    this.mensajeError.set('');
    this.modalAbierto.set(true);
  }

  // ---------- GUARDAR (sirve para nuevo y editar) ----------
  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const datos = { ...v, dni: Number(v.dni), telefono: Number(v.telefono) };
    const id = this.editandoId();

    this.guardando.set(true);
    this.mensajeError.set('');

    const peticion = id === null
      ? this.empleadoService.create(datos)
      : this.empleadoService.update(id, datos);

    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrarModal();
        this.cargarEmpleados();
      },
      error: (error) => {
        console.error('Error al guardar empleado:', error);
        this.guardando.set(false);
        this.mensajeError.set(
          'No se pudo guardar. Verifica que el DNI o el teléfono no estén repetidos.'
        );
      }
    });
  }

  // ---------- ELIMINAR ----------
  eliminar(empleado: Empleado): void {
    if (!confirm(`¿Eliminar a ${empleado.nombres} ${empleado.apellidos}?`)) {
      return;
    }

    this.empleadoService.delete(empleado.idEmpleado).subscribe({
      next: () => this.cargarEmpleados(),
      error: (error) => {
        console.error('Error al eliminar empleado:', error);
        alert('No se pudo eliminar. Puede que el empleado tenga registros asociados.');
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