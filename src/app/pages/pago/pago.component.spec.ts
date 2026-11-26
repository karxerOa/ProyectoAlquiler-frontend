import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { ReferenciasService } from '../../services/referencias.service';
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

  it('fills the editable payment amount with the selected rental total', () => {
    const fixture = TestBed.createComponent(PagoComponent);
    const component = fixture.componentInstance;
    http.expectOne(`${environment.apiUrl}/pagos`).flush([]);
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

    expect(component.form.controls.monto.value).toBe(180);
    fixture.destroy();
  });
});
