import { Component, DestroyRef, effect, inject, signal, untracked, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { AlquilerService } from '../../services/alquiler.service';
import type { Alquiler } from '../../model/alquiler';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { switchMap, tap } from 'rxjs';

@Component({
  imports: [
    MatFormFieldModule,
    MatTableModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatButtonModule,
    MatSortModule,
    RouterLink,
    RouterOutlet,
  ],
  selector: 'app-alquiler',
  styleUrl: './Alquiler.component.css',
  templateUrl: './Alquiler.component.html',
})
export class AlquilerComponent {
  private readonly alquilerService = inject(AlquilerService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  protected $dataSource = signal(new MatTableDataSource<Alquiler>());
  protected $paginator = viewChild(MatPaginator);
  protected $sort = viewChild(MatSort);
  protected $alquileres = this.alquilerService.$alquileresChange;

  protected displayedColumns: string[] = [
    'idAlquiler',
    'fechaAlquiler',
    'fechaInicio',
    'fechaFin',
    'estado',
    'subtotal',
    'total',
    'cliente',
    'empleado',
    'actions',
  ];

  constructor() {
    const dataSource = this.$dataSource();
    dataSource.sortingDataAccessor = (alquiler, column) => {
      switch (column) {
        case 'cliente':
          return `${alquiler.cliente.nombre} ${alquiler.cliente.apellidos}`;
        case 'empleado':
          return `${alquiler.empleado.nombres} ${alquiler.empleado.apellidos}`;
        case 'fechaAlquiler':
          return alquiler.fechaAlquiler;
        case 'fechaInicio':
          return alquiler.fechaInicio;
        case 'fechaFin':
          return alquiler.fechaFin;
        case 'estado':
          return alquiler.estado;
        case 'subtotal':
          return alquiler.subtotal;
        case 'total':
          return alquiler.total;
        case 'idAlquiler':
          return alquiler.idAlquiler;
        default:
          return '';
      }
    };
    dataSource.filterPredicate = (alquiler, filter) =>
      [
        alquiler.idAlquiler,
        alquiler.fechaAlquiler,
        alquiler.fechaInicio,
        alquiler.fechaFin,
        alquiler.estado,
        alquiler.subtotal,
        alquiler.total,
        alquiler.cliente.nombre,
        alquiler.cliente.apellidos,
        alquiler.empleado.nombres,
        alquiler.empleado.apellidos,
      ]
        .join(' ')
        .toLowerCase()
        .includes(filter);

    this.alquilerService
      .findAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => this.alquilerService.setAlquilerChange(data),
        error: () => this.showError('No se pudieron cargar los alquileres.'),
      });

    effect(() => {
      const data = this.$alquileres();
      const currentDataSource = this.$dataSource();
      currentDataSource.data = data;
      currentDataSource.paginator = this.$paginator() ?? null;
      currentDataSource.sort = this.$sort() ?? null;
    });

    effect(() => {
      const message = this.alquilerService.$messageChange();
      if (message) {
        this.snackBar.open(message, 'INFO', {
          duration: 2000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });
        untracked(() => this.alquilerService.setMessageChange(''));
      }
    });
  }

  protected applyFilter(event: Event): void {
    const input = event.target;
    if (input instanceof HTMLInputElement) {
      this.$dataSource().filter = input.value.trim().toLowerCase();
    }
  }

  protected delete(id: number): void {
    const ok = window.confirm('¿Estás seguro?');
    if (ok) {
      this.alquilerService
        .delete(id)
        .pipe(
          switchMap(() => this.alquilerService.findAll()),
          tap((data) => this.alquilerService.setAlquilerChange(data)),
          tap(() => this.alquilerService.setMessageChange('Alquiler eliminado.')),
          takeUntilDestroyed(this.destroyRef),
        )
        .subscribe({
          error: () => this.showError('No se pudo eliminar el alquiler.'),
        });
    }
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 4000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }
}
