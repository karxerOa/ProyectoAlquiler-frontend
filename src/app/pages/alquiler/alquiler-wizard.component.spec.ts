import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { signal, WritableSignal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subject, throwError } from 'rxjs';
import { AlquilerWizardComponent } from './alquiler-wizard.component';
import { ReferenciasService } from '../../services/referencias.service';
import { AlquilerService } from '../../services/alquiler.service';
import { DetalleAlquilerService } from '../../services/detalle-alquiler.service';
import { AuthService } from '../../services/auth.service';
import { Alquiler } from '../../model/alquiler';
import { Cliente } from '../../model/cliente';
import { Prenda } from '../../model/prenda';
import { Empleado } from '../../model/empleado';
import { EmpleadoService } from '../../services/empleado.service';

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
  let routeClienteId: string | null;
  let empleados: { findMe: ReturnType<typeof vi.fn> };
  let referencias: {
    clientes: WritableSignal<Cliente[]>;
    prendas: WritableSignal<Prenda[]>;
    cargar: ReturnType<typeof vi.fn>;
  };
  beforeEach(() => {
    routeClienteId = null;
    empleados = {
      findMe: vi.fn(() => throwError(() => new HttpErrorResponse({ status: 404 }))),
    };
    referencias = {
      clientes: signal<Cliente[]>([]),
      prendas: signal<Prenda[]>([]),
      cargar: vi.fn(),
    };
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
          useValue: referencias,
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: (name: string) => (name === 'clienteId' ? routeClienteId : null),
              },
            },
          },
        },
        { provide: AlquilerService, useValue: rentals },
        { provide: DetalleAlquilerService, useValue: details },
        { provide: EmpleadoService, useValue: empleados },
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

  it('requires and sends the selected employee when /me returns 404', async () => {
    expect(page.estadoEmpleadoSesion()).toBe('sin-ficha');
    page.form.controls.empleadoId.setValue('');
    expect(page.form.controls.empleadoId.hasError('required')).toBe(true);
    expect(page.fechasValidas()).toBe(false);
    page.form.controls.empleadoId.setValue('1');
    expect(page.fechasValidas()).toBe(true);

    await page.guardar();

    expect(rentals.create).toHaveBeenCalledOnce();
    expect(rentals.create.mock.calls[0][0]).toHaveProperty('empleadoId', 1);
  });

  it('omits a stale employeeId when /me returns the session employee', async () => {
    const empleado = {
      idEmpleado: 9,
      nombres: 'Elena',
      apellidos: 'Sesión',
      dni: '87654321',
      telefono: '987654321',
      cargo: 'Asesora',
      estado: 'Activo',
      username: 'elena',
    } satisfies Empleado;
    const employeeLookup = new Subject<Empleado>();
    empleados.findMe.mockReturnValue(employeeLookup.asObservable());
    const linkedPage = TestBed.runInInjectionContext(() => new AlquilerWizardComponent());
    linkedPage.form.controls.empleadoId.setValue('1');
    expect(linkedPage.estadoEmpleadoSesion()).toBe('cargando');
    expect(linkedPage.fechasValidas()).toBe(false);
    employeeLookup.next(empleado);
    employeeLookup.complete();
    linkedPage.cliente.set(page.cliente());
    linkedPage.agregar(page.lineas()[0].prenda);
    linkedPage.form.setValue({
      fechaInicio: '2026-11-11',
      fechaFin: '2026-11-12',
      empleadoId: linkedPage.form.controls.empleadoId.value,
    });

    expect(linkedPage.estadoEmpleadoSesion()).toBe('vinculado');
    expect(linkedPage.form.controls.empleadoId.value).toBe('');
    expect(linkedPage.fechasValidas()).toBe(true);
    await linkedPage.guardar();

    const payload = rentals.create.mock.calls[0][0];
    expect(payload).not.toHaveProperty('empleadoId');
  });

  it('blocks rental registration and displays an error when /me fails for another reason', async () => {
    empleados.findMe.mockReturnValue(
      throwError(() => new HttpErrorResponse({ status: 503 })),
    );
    const unavailablePage = TestBed.runInInjectionContext(() => new AlquilerWizardComponent());
    unavailablePage.cliente.set(page.cliente());
    unavailablePage.agregar(page.lineas()[0].prenda);
    unavailablePage.form.setValue({
      fechaInicio: '2026-11-11',
      fechaFin: '2026-11-12',
      empleadoId: '1',
    });

    expect(unavailablePage.estadoEmpleadoSesion()).toBe('error');
    expect(unavailablePage.fechasValidas()).toBe(false);
    expect(unavailablePage.errorEmpleadoSesion()).toContain('HTTP 503');
    await unavailablePage.guardar();
    expect(rentals.create).not.toHaveBeenCalled();
  });

  it('preselects the client passed in the route query parameters', () => {
    const client = {
      idCliente: 2,
      nombre: 'Lucía',
      apellidos: 'Prueba',
      dni: '00123456',
      telefono: '900000000',
      direccion: '',
      correo: '',
    } as Cliente;
    routeClienteId = '2';
    referencias.clientes.set([client]);

    const pageWithClient = TestBed.runInInjectionContext(() => new AlquilerWizardComponent());
    TestBed.flushEffects();

    expect(pageWithClient.cliente()).toEqual(client);
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
