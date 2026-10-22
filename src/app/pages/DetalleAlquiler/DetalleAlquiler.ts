import { CurrencyPipe } from '@angular/common';
import { Component, DestroyRef, effect, inject, signal, untracked, viewChild } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { switchMap, tap } from 'rxjs';
import type { DetalleAlquiler } from '../../model/detalle-alquiler';
import { DetalleAlquilerService } from '../../services/detalle-alquiler.service';

@Component({
  imports: [
    CurrencyPipe,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatPaginatorModule,
    MatSortModule,
    MatTableModule,
  ],
  selector: 'app-detalle-alquiler',
  styleUrl: './DetalleAlquiler.component.css',
  templateUrl: './DetalleAlquiler.component.html',
})
export class DetalleAlquilerComponent {
  private readonly detalleService = inject(DetalleAlquilerService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly $dataSource = signal(new MatTableDataSource<DetalleAlquiler>());
  protected readonly $paginator = viewChild(MatPaginator);
  protected readonly $sort = viewChild(MatSort);
  protected readonly $detalles = this.detalleService.$detallesChange;
  protected readonly displayedColumns = [
    'idDetalle',
    'prenda',
    'talla',
    'color',
    'cantidad',
    'precioUnitario',
    'subtotal',
    'cliente',
    'actions',
  ];

  constructor() {
    const dataSource = this.$dataSource();
    dataSource.sortingDataAccessor = (detalle, column) => {
      switch (column) {
        case 'prenda':
          return detalle.prenda.nombre;
        case 'talla':
          return detalle.prenda.talla;
        case 'color':
          return detalle.prenda.color;
        case 'cliente':
          return `${detalle.alquiler.cliente.nombre} ${detalle.alquiler.cliente.apellidos}`;
        case 'idDetalle':
          return detalle.idDetalle;
        case 'cantidad':
          return detalle.cantidad;
        case 'precioUnitario':
          return detalle.precioUnitario;
        case 'subtotal':
          return detalle.subtotal;
        default:
          return '';
      }
    };
    dataSource.filterPredicate = (detalle, filter) =>
      [
        detalle.idDetalle,
        detalle.prenda.nombre,
        detalle.prenda.talla,
        detalle.prenda.color,
        detalle.cantidad,
        detalle.precioUnitario,
        detalle.subtotal,
        detalle.alquiler.cliente.nombre,
        detalle.alquiler.cliente.apellidos,
      ]
        .join(' ')
        .toLowerCase()
        .includes(filter);

    this.detalleService
      .findAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => this.detalleService.setDetalleChange(data),
        error: () => this.showError('No se pudieron cargar los detalles de alquiler.'),
      });

    effect(() => {
      const currentDataSource = this.$dataSource();
      currentDataSource.data = this.$detalles();
      currentDataSource.paginator = this.$paginator() ?? null;
      currentDataSource.sort = this.$sort() ?? null;
    });

    effect(() => {
      const message = this.detalleService.$messageChange();
      if (message) {
        this.snackBar.open(message, 'Cerrar', {
          duration: 2000,
          horizontalPosition: 'right',
          verticalPosition: 'top',
        });
        untracked(() => this.detalleService.setMessageChange(''));
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
    if (!window.confirm('¿Estás seguro de que quieres eliminar este detalle?')) {
      return;
    }

    this.detalleService
      .delete(id)
      .pipe(
        switchMap(() => this.detalleService.findAll()),
        tap((data) => this.detalleService.setDetalleChange(data)),
        tap(() => this.detalleService.setMessageChange('Detalle de alquiler eliminado.')),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        error: () => this.showError('No se pudo eliminar el detalle de alquiler.'),
      });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 4000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
    });
  }
}
