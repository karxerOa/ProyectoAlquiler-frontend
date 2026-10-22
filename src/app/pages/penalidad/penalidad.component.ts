import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
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
export class PenalidadComponent implements OnInit {
  private readonly penalidadService = inject(PenalidadService);

  listaPenalidades: Penalidad[] = [];
  nuevaPenalidad: Omit<Penalidad, 'idPenalidad'> = this.formularioVacio();
  cargando = false;
  guardando = false;
  errorCarga = '';
  errorGuardar = '';

  ngOnInit(): void {
    this.cargarPenalidades();
  }

  cargarPenalidades(): void {
    this.cargando = true;
    this.errorCarga = '';

    this.penalidadService.listar().subscribe({
      next: (data) => {
        this.listaPenalidades = data;
        this.cargando = false;
      },
      error: (error: unknown) => {
        console.error('Error al cargar penalidades:', error);
        this.errorCarga = 'No se pudieron cargar las penalidades. Verifica la conexión con el servidor.';
        this.cargando = false;
      }
    });
  }

  guardarPenalidad(form: NgForm): void {
    if (form.invalid || this.guardando) {
      form.control.markAllAsTouched();
      return;
    }

    this.guardando = true;
    this.errorGuardar = '';
    const datos = {
      ...this.nuevaPenalidad,
      fecha_penalidad: new Date(this.nuevaPenalidad.fecha_penalidad).toISOString()
    };

    this.penalidadService.registrar(datos).subscribe({
      next: () => {
        this.guardando = false;
        this.limpiarFormulario(form);
        this.cargarPenalidades();
      },
      error: (error: unknown) => {
        console.error('Error al guardar penalidad:', error);
        this.errorGuardar = 'No se pudo guardar la penalidad. Revisa los datos e inténtalo nuevamente.';
        this.guardando = false;
      }
    });
  }

  limpiarFormulario(form: NgForm): void {
    this.nuevaPenalidad = this.formularioVacio();
    this.errorGuardar = '';
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
