import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Devolucion } from '../../model/devolucion';
import { DevolucionService } from '../../services/devolucion.service';

@Component({
  selector: 'app-devolucion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './devolucion.component.html',
  styleUrl: './devolucion.component.css'
})
export class DevolucionComponent {
  private readonly devolucionService = inject(DevolucionService);

  readonly listaDevoluciones = this.devolucionService.$devolucionesChange;
  nuevaDevolucion: Omit<Devolucion, 'idDevolucion'> = this.formularioVacio();
  cargando = signal(false);
  guardando = signal(false);
  errorCarga = signal('');
  errorGuardar = signal('');

  constructor() {
    this.cargarDevoluciones();
  }

  cargarDevoluciones(): void {
    this.cargando.set(true);
    this.errorCarga.set('');

    this.devolucionService.listar().subscribe({
      next: (data) => {
        this.devolucionService.setDevolucionesChange(data);
        this.cargando.set(false);
      },
      error: (error: unknown) => {
        console.error('Error al cargar devoluciones:', error);
        this.errorCarga.set('No se pudieron cargar las devoluciones. Verifica la conexión con el servidor.');
        this.cargando.set(false);
      }
    });
  }

  guardarDevolucion(form: NgForm): void {
    if (form.invalid || this.guardando()) {
      form.control.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.errorGuardar.set('');
    const datos = {
      ...this.nuevaDevolucion,
      fechaDevolucion: new Date(this.nuevaDevolucion.fechaDevolucion).toISOString()
    };

    this.devolucionService.registrar(datos).subscribe({
      next: () => {
        this.guardando.set(false);
        this.limpiarFormulario(form);
        this.cargarDevoluciones();
      },
      error: (error: unknown) => {
        console.error('Error al guardar devolución:', error);
        this.errorGuardar.set('No se pudo guardar la devolución. Revisa los datos e inténtalo nuevamente.');
        this.guardando.set(false);
      }
    });
  }

  limpiarFormulario(form: NgForm): void {
    this.nuevaDevolucion = this.formularioVacio();
    this.errorGuardar.set('');
    form.resetForm(this.nuevaDevolucion);
  }

  private formularioVacio(): Omit<Devolucion, 'idDevolucion'> {
    return {
      fechaDevolucion: new Date().toISOString().slice(0, 10),
      estadoPrenda: 'BUENO',
      observacion: '',
      alquilerId: 0,
      empleadoId: 0
    };
  }
}
