import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { DevolucionComponent } from './devolucion.component';
import { ReferenciasService } from '../../services/referencias.service';
import { fechaLima } from '../../model/agenda';
describe('Recepción dentro del alquiler', () => {
  beforeEach(() =>
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }),
  );
  function preparar(estado = 'ACTIVO') {
    const f = TestBed.createComponent(DevolucionComponent);
    f.componentRef.setInput('alquiler', {
      idAlquiler: 34,
      clienteId: 8,
      empleadoId: 9,
      estado,
      fechaInicio: '2026-01-01',
      fechaFin: fechaLima(),
    });
    const ref = TestBed.inject(ReferenciasService);
    ref.detalles.set([
      { idDetalle: 1, alquilerId: 34, prendaId: 12, cantidad: 1, precioUnitario: 90, subtotal: 90 },
    ]);
    return { f, c: f.componentInstance, ref };
  }
  it('envía la recepción vinculada al alquiler sin pedir identificadores', () => {
    const { c } = preparar();
    c.form.patchValue({ empleadoId: '9' });
    c.revisar(12, 'SIN_MANTENIMIENTO');
    c.guardar();
    const req = TestBed.inject(HttpTestingController).expectOne((r) => r.method === 'POST');
    expect(req.request.body.alquilerId).toBe(34);
    expect(req.request.body.empleadoId).toBe(9);
    expect(req.request.body.observacion).toContain('no requiere mantenimiento');
    req.flush({ idDevolucion: 2, ...req.request.body });
    expect(c.puedeRecibir()).toBe(false);
  });
  it('no permite recibir una reserva que todavía no fue entregada', () => {
    const { c } = preparar('PENDIENTE');
    c.form.patchValue({ empleadoId: '9' });
    c.revisar(12, 'SIN_MANTENIMIENTO');
    c.guardar();
    TestBed.inject(HttpTestingController).expectNone((r) => r.method === 'POST');
  });
  it('una recepción incompleta no certifica todas las prendas devueltas', () => {
    const { c, ref } = preparar();
    ref.devoluciones.set([
      {
        idDevolucion: 2,
        alquilerId: 34,
        empleadoId: 9,
        fechaDevolucion: fechaLima(),
        estadoPrenda: 'INCOMPLETO',
        observacion: 'Falta una prenda',
      },
    ]);
    expect(c.puedeRecibir()).toBe(true);
  });
});
