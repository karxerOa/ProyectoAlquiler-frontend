import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Penalidad } from '../../model/penalidad';
import { PenalidadService } from '../../services/penalidad.service';

@Component({
  selector: 'app-penalidad',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './penalidad.component.html',
  styleUrl: './penalidad.component.css'
})
export class PenalidadComponent {
  private readonly penalidadService = inject(PenalidadService);

  readonly listaPenalidades = this.penalidadService.$penalidadesChange;
  nuevaPenalidad: Omit<Penalidad, 'idPenalidad'> = this.formularioVacio();
  cargando = signal(false);
  guardando = signal(false);
  errorCarga = signal('');
  errorGuardar = signal('');

  constructor() {
    this.cargarPenalidades();
  }

  cargarPenalidades(): void {
    this.cargando.set(true);
    this.errorCarga.set('');

    this.penalidadService.listar().subscribe({
      next: (data) => {
        this.penalidadService.setPenalidadesChange(data);
        this.cargando.set(false);
      },
      error: (error: unknown) => {
        console.error('Error al cargar penalidades:', error);
        this.errorCarga.set('No se pudieron cargar las penalidades. Verifica la conexión con el servidor.');
        this.cargando.set(false);
      }
    });
  }

  guardarPenalidad(form: NgForm): void {
    if (form.invalid || this.guardando()) {
      form.control.markAllAsTouched();
      return;
    }

    this.guardando.set(true);
    this.errorGuardar.set('');
    const datos = {
      ...this.nuevaPenalidad,
      fecha_penalidad: new Date(this.nuevaPenalidad.fecha_penalidad).toISOString()
    };

    this.penalidadService.registrar(datos).subscribe({
      next: () => {
        this.guardando.set(false);
        this.limpiarFormulario(form);
        this.cargarPenalidades();
      },
      error: (error: unknown) => {
        console.error('Error al guardar penalidad:', error);
        this.errorGuardar.set('No se pudo guardar la penalidad. Revisa los datos e inténtalo nuevamente.');
        this.guardando.set(false);
      }
    });
  }

  limpiarFormulario(form: NgForm): void {
    this.nuevaPenalidad = this.formularioVacio();
    this.errorGuardar.set('');
    form.resetForm(this.nuevaPenalidad);
  }

  private formularioVacio(): Omit<Penalidad, 'idPenalidad'> {
    return {
      tipo_penalidad: '',
      descripcion: '',
      monto: 0,
      fecha_penalidad: new Date().toISOString().slice(0, 10),
      estado: true,
      devolucionId: 0
    };
  }
}
