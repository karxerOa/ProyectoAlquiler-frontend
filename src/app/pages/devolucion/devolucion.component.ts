import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DevolucionService } from '../../services/devolucion.service';
import { Devolucion } from '../../model/devolucion';

@Component({
  selector: 'app-devolucion',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './devolucion.component.html',
  styleUrl: './devolucion.component.css'
})
export class DevolucionComponent implements OnInit {
  private devolucionService = inject(DevolucionService);

  listaDevoluciones: Devolucion[] = [];

  nuevaDevolucion: Devolucion = {
    fechaDevolucion: new Date().toISOString().split('T')[0],
    estadoPrenda: 'BUENO',
    observacion: '',
    alquiler: { idAlquiler: 0 } as any,
    empleado: { idEmpleado: 0 } as any,
    penalidades: []
  };

  ngOnInit(): void {
    this.cargarDevoluciones();
  }

  cargarDevoluciones(): void {
    this.devolucionService.listar().subscribe({
      next: (data) => (this.listaDevoluciones = data),
      error: (err: any) => console.error('Error al cargar devoluciones:', err)
    });
  }

  guardarDevolucion(): void {
    this.devolucionService.registrar(this.nuevaDevolucion).subscribe({
      next: () => {
        this.cargarDevoluciones();
        this.limpiarFormulario();
      },
      error: (err: any) => console.error('Error al guardar devolución:', err)
    });
  }

  limpiarFormulario(): void {
    this.nuevaDevolucion = {
      fechaDevolucion: new Date().toISOString().split('T')[0],
      estadoPrenda: 'BUENO',
      observacion: '',
      alquiler: { idAlquiler: 0 } as any,
      empleado: { idEmpleado: 0 } as any,
      penalidades: []
    };
  }
}