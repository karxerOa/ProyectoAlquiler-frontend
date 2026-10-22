import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PenalidadService } from '../../services/penalidad.service';
import { Penalidad } from '../../model/penalidad';

@Component({
  selector: 'app-penalidad',
  standalone: true,
  imports: [CommonModule, FormsModule], // <--- Vital para ngModel y *ngFor
  templateUrl: './penalidad.component.html',
  styleUrl: './penalidad.component.css'
})
export class PenalidadComponent implements OnInit {
  private penalidadService = inject(PenalidadService);

  listaPenalidades: Penalidad[] = [];
  
  nuevaPenalidad: Penalidad = {
    tipo_penalidad: '',
    descripcion: '',
    monto: 0,
    fecha_penalidad: new Date().toISOString().split('T')[0],
    estado: true,
    devolucion: { idDevolucion: 0 } as any
  };

  ngOnInit(): void {
    this.cargarPenalidades();
  }

  cargarPenalidades(): void {
    this.penalidadService.listar().subscribe({
      next: (data) => (this.listaPenalidades = data),
      error: (err: any) => console.error('Error al cargar penalidades:', err)
    });
  }

  guardarPenalidad(): void {
    this.penalidadService.registrar(this.nuevaPenalidad).subscribe({
      next: () => {
        this.cargarPenalidades();
        this.limpiarFormulario();
      },
      error: (err: any) => console.error('Error al guardar penalidad:', err)
    });
  }

  limpiarFormulario(): void {
    this.nuevaPenalidad = {
      tipo_penalidad: '',
      descripcion: '',
      monto: 0,
      fecha_penalidad: new Date().toISOString().split('T')[0],
      estado: true,
      devolucion: { idDevolucion: 0 } as any
    };
  }
}