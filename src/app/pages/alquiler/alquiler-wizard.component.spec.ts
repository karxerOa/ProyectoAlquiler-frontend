import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { AlquilerWizardComponent } from './alquiler-wizard.component';
import { ReferenciasService } from '../../services/referencias.service';
import { AlquilerService } from '../../services/alquiler.service';
import { DetalleAlquilerService } from '../../services/detalle-alquiler.service';
import { AuthService } from '../../services/auth.service';
import { Alquiler } from '../../model/alquiler';
import { Cliente } from '../../model/cliente';
import { Prenda } from '../../model/prenda';

describe('Rental registration recovery', () => {
  const saved: Alquiler = {
    idAlquiler: 25,
    fechaAlquiler: '2026-11-11',
    fechaInicio: '2026-11-11',
    fechaFin: '2026-11-12',
    estado: 'PENDIENTE',
    subtotal: 80,
    total: 80,
    empleadoId: 1,
    clienteId: 1,
  };
  let page: AlquilerWizardComponent;
  let rentals: { create: ReturnType<typeof vi.fn> };
  let details: { findAll: ReturnType<typeof vi.fn>; create: ReturnType<typeof vi.fn> };
  let navigate: ReturnType<typeof vi.fn>;
  beforeEach(() => {
    rentals = { create: vi.fn(() => of(saved)) };
    details = {
      findAll: vi.fn(() => of([])),
      create: vi.fn(() => throwError(() => ({ status: 500 }))),
    };
    navigate = vi.fn().mockResolvedValue(true);
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ReferenciasService,
          useValue: { clientes: signal([]), prendas: signal([]), cargar: vi.fn() },
        },
        { provide: AlquilerService, useValue: rentals },
        { provide: DetalleAlquilerService, useValue: details },
        { provide: Router, useValue: { navigate } },
        { provide: AuthService, useValue: { canWrite: () => true } },
      ],
    });
    page = TestBed.runInInjectionContext(() => new AlquilerWizardComponent());
    page.cliente.set({
      idCliente: 1,
      nombre: 'Ana',
      apellidos: 'Prueba',
      dni: '00123456',
      telefono: '900000000',
      direccion: '',
      correo: '',
    } as Cliente);
    page.agregar({
      idPrenda: 7,
      nombre: 'Vestido',
      descripcion: '',
      talla: 'M',
      color: 'Azul',
      precioAlquiler: 80,
      estado: 'DISPONIBLE',
      categoriaId: 1,
    } as Prenda);
    page.form.setValue({ fechaInicio: '2026-11-11', fechaFin: '2026-11-12', empleadoId: '1' });
  });
  it('retains the header and resumes only missing details after a partial failure', async () => {
    await page.guardar();
    expect(page.creado()?.idAlquiler).toBe(25);
    expect(navigate).not.toHaveBeenCalled();
    // A lost response may have persisted the detail on the server.
    details.findAll.mockReturnValue(
      of([
        {
          idDetalleAlquiler: 4,
          alquilerId: 25,
          prendaId: 7,
          cantidad: 1,
          precioUnitario: 80,
          subtotal: 80,
        },
      ]),
    );
    await page.guardar();
    expect(rentals.create).toHaveBeenCalledTimes(1);
    expect(details.create).toHaveBeenCalledTimes(1);
    expect(navigate).toHaveBeenCalledWith(['/alquileres'], { queryParams: { alquiler: 25 } });
  });
  it('blocks repeating an uncertain header request', async () => {
    rentals.create.mockReturnValue(throwError(() => ({ status: 0 })));
    await page.guardar();
    await page.guardar();
    expect(page.incertidumbre()).toBe(true);
    expect(rentals.create).toHaveBeenCalledTimes(1);
  });
  it('rejects invalid quantities and reversed dates before sending data', async () => {
    page.cantidad(7, '0');
    await page.guardar();
    expect(rentals.create).not.toHaveBeenCalled();
    page.cantidad(7, '2');
    page.form.controls.fechaFin.setValue('2026-11-10');
    await page.guardar();
    expect(rentals.create).not.toHaveBeenCalled();
    expect(page.total()).toBe(160);
  });
});
