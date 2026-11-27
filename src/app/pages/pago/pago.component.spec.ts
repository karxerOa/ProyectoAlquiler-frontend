import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { ReferenciasService } from '../../services/referencias.service';
import { UiService } from '../../shared/ui.service';
import { PagoComponent } from './pago.component';

describe('PagoComponent', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PagoComponent],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('uses only collected payments for the balance and prevents overpayments and double submission', () => {
    const fixture = TestBed.createComponent(PagoComponent);
    const component = fixture.componentInstance;
    const url = `${environment.apiUrl}/pagos`;
    const pago = { alquilerId: 12, monto: 50, estado: 'PAGADO' };
    http
      .expectOne(url)
      .flush([
        pago,
        { ...pago, estado: 'ANULADO' },
        { ...pago, estado: 'PENDIENTE' },
        { ...pago, alquilerId: 99 },
      ]);
    TestBed.inject(ReferenciasService).alquileres.set([
      {
        idAlquiler: 12,
        fechaAlquiler: '2026-11-26',
        fechaInicio: '2026-11-26',
        fechaFin: '2026-11-27',
        estado: 'ACTIVO',
        subtotal: 150,
        total: 180,
        empleadoId: 2,
        clienteId: 4,
      },
    ]);

    component.form.controls.alquilerId.setValue('12');

    expect(component.form.controls.monto.value).toBe(130);
    component.form.controls.monto.setValue(131);
    component.guardar();
    http.expectNone(url);
    component.form.controls.monto.setValue(30);
    component.guardar();
    component.guardar();
    const request = http.expectOne({ method: 'POST', url });
    expect(request.request.body).toMatchObject({ alquilerId: 12, monto: 30, estado: 'PAGADO' });
    request.flush({ ...request.request.body, idPago: 7 });
    http.expectOne(url).flush([pago, request.request.body]);
    expect(component.saldo(12)).toBe(100);
    fixture.destroy();
  });
  it('locks collected payments and all entries on a fully paid rental', async () => {
    const fixture = TestBed.createComponent(PagoComponent);
    const component = fixture.componentInstance;
    const url = `${environment.apiUrl}/pagos`;
    const pago = {
      idPago: 9,
      alquilerId: 12,
      fechaPago: '2026-11-27',
      metodoPago: 'EFECTIVO',
      monto: 50,
      estado: 'PAGADO',
    };
    http.expectOne(url).flush([pago]);
    const confirmar = vi.spyOn(TestBed.inject(UiService), 'confirm');
    const alquiler = {
      idAlquiler: 12,
      fechaAlquiler: '',
      fechaInicio: '',
      fechaFin: '',
      estado: 'ACTIVO',
      subtotal: 50,
      total: 80,
      empleadoId: 1,
      clienteId: 1,
    };
    component.ref.alquileres.set([alquiler]);
    const pendiente = { ...pago, idPago: 10, estado: 'PENDIENTE' };
    expect(component.puedeCambiar(pendiente)).toBe(true);
    await component.cambiarEstado(pago, 'ANULADO');
    component.ref.alquileres.set([{ ...alquiler, total: 50 }]);
    expect(component.opcionesAlquileres()).toEqual([]);
    await component.cambiarEstado(pendiente, 'PAGADO');
    await component.cambiarEstado(pendiente, 'ANULADO');
    expect(confirmar).not.toHaveBeenCalled();
    fixture.destroy();
  });
});
