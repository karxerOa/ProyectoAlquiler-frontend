import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
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
export class DevolucionComponent implements OnInit {
  private readonly devolucionService = inject(DevolucionService);

  listaDevoluciones: Devolucion[] = [];
  nuevaDevolucion: Omit<Devolucion, 'idDevolucion'> = this.formularioVacio();
  cargando = false;
  guardando = false;
  errorCarga = '';
  errorGuardar = '';

  ngOnInit(): void {
    this.cargarDevoluciones();
  }

  cargarDevoluciones(): void {
    this.cargando = true;
    this.errorCarga = '';

    this.devolucionService.listar().subscribe({
      next: (data) => {
        this.listaDevoluciones = data;
        this.cargando = false;
      },
      error: (error: unknown) => {
        console.error('Error al cargar devoluciones:', error);
        this.errorCarga = 'No se pudieron cargar las devoluciones. Verifica la conexión con el servidor.';
        this.cargando = false;
      }
    });
  }

  guardarDevolucion(form: NgForm): void {
    if (form.invalid || this.guardando) {
      form.control.markAllAsTouched();
      return;
    }

    this.guardando = true;
    this.errorGuardar = '';
    const datos = {
      ...this.nuevaDevolucion,
      fechaDevolucion: new Date(this.nuevaDevolucion.fechaDevolucion).toISOString()
    };

    this.devolucionService.registrar(datos).subscribe({
      next: () => {
        this.guardando = false;
        this.limpiarFormulario(form);
        this.cargarDevoluciones();
      },
      error: (error: unknown) => {
        console.error('Error al guardar devolución:', error);
        this.errorGuardar = 'No se pudo guardar la devolución. Revisa los datos e inténtalo nuevamente.';
        this.guardando = false;
      }
    });
  }

  limpiarFormulario(form: NgForm): void {
    this.nuevaDevolucion = this.formularioVacio();
    this.errorGuardar = '';
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
