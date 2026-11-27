import { UiService } from '../../shared/ui.service';
import { environment } from '../../../environments/environment';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { MantenimientoComponent } from './mantenimiento.component';
import { ReferenciasService } from '../../services/referencias.service';
describe('Mantenimiento desde una recepción', () => {
  it('limita la selección a las prendas del alquiler recibido y excluye recepciones incompletas', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    const f = TestBed.createComponent(MantenimientoComponent);
    const c = f.componentInstance;
    const ref = TestBed.inject(ReferenciasService);
    TestBed.inject(HttpTestingController)
      .expectOne((r) => r.url.endsWith('/mantenimientos'))
      .flush([]);
    ref.prendas.set([
      { idPrenda: 1, nombre: 'Traje', talla: 'M', color: 'Negro', estado: 'DISPONIBLE' },
      { idPrenda: 2, nombre: 'Vestido', talla: 'S', color: 'Azul', estado: 'DISPONIBLE' },
    ] as any);
    ref.detalles.set([
      {
        idDetalle: 1,
        alquilerId: 10,
        prendaId: 1,
        cantidad: 1,
        precioUnitario: 100,
        subtotal: 100,
      },
    ]);
    ref.devoluciones.set([
      {
        idDevolucion: 3,
        alquilerId: 10,
        empleadoId: 1,
        fechaDevolucion: '2026-11-05',
        estadoPrenda: 'BUENO',
        observacion: '',
      },
      {
        idDevolucion: 4,
        alquilerId: 20,
        empleadoId: 1,
        fechaDevolucion: '2026-11-05',
        estadoPrenda: 'INCOMPLETO',
        observacion: '',
      },
    ]);
    c.origen.set('3');
    expect(c.prendasRecibidas().map((o) => o.valor)).toEqual([1]);
    expect(c.origenes().map((o) => o.valor)).toEqual([3]);
    c.origen.set('4');
    expect(c.prendasRecibidas()).toEqual([]);
  });
  it('valida fechas y origen antes de crear y conserva la prenda al editar', async () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    const c = TestBed.createComponent(MantenimientoComponent).componentInstance;
    const http = TestBed.inject(HttpTestingController);
    const url = environment.apiUrl + '/mantenimientos';
    http.expectOne(url).flush([]);
    vi.spyOn(c.ref, 'cargar').mockImplementation(() => {});
    vi.spyOn(c.ref, 'devolucion').mockReturnValue('Devolución 3');
    c.ref.devoluciones.set([
      {
        idDevolucion: 3,
        alquilerId: 10,
        empleadoId: 8,
        fechaDevolucion: '2026-11-27',
        estadoPrenda: 'BUENO',
        observacion: '',
      },
    ]);
    c.ref.detalles.set([
      { idDetalle: 1, alquilerId: 10, prendaId: 7, cantidad: 1, precioUnitario: 50, subtotal: 50 },
    ]);
    vi.spyOn(c.ref, 'opcionesPrendas').mockReturnValue([{ valor: 7, nombre: 'Vestido' }]);
    c.nuevo();
    c.form.patchValue({
      fechaInicio: '2026-11-27',
      fechaFin: '2026-11-26',
      tipoMantenimiento: 'Lavado',
      descripcion: 'Limpieza',
      empleadoId: '8',
      prendaId: '7',
    });
    c.guardar();
    http.expectNone({ method: 'POST', url });
    c.cambiarOrigen('3');
    expect(c.form.controls.prendaId.value).toBe('');
    c.form.controls.prendaId.setValue('7');
    c.guardar();
    http.expectNone({ method: 'POST', url });
    c.form.controls.fechaFin.setValue('2026-11-28');
    c.guardar();
    c.guardar();
    const post = http.expectOne({ method: 'POST', url });
    expect(post.request.body).toMatchObject({ prendaId: 7, empleadoId: 8 });
    expect(post.request.body.descripcion).toContain('Devolución 3');
    const registro = { ...post.request.body, idMantenimiento: 4 };
    post.flush(registro);
    http.expectOne(url).flush([registro]);
    c.editar(registro);
    expect(c.form.controls.prendaId.disabled).toBe(true);
    c.form.controls.estado.setValue('FINALIZADO');
    c.guardar();
    const put = http.expectOne({ method: 'PUT', url: url + '/4' });
    expect(put.request.body).toMatchObject({
      prendaId: 7,
      estado: 'FINALIZADO',
      descripcion: registro.descripcion,
    });
    put.flush(put.request.body);
    http.expectOne(url).flush([registro]);
    vi.spyOn(TestBed.inject(UiService), 'confirm').mockResolvedValue(true);
    await c.eliminar(registro);
    http.expectOne({ method: 'DELETE', url: url + '/4' }).flush(null);
    http.expectOne(url).flush([]);
    http.verify();
  });
});
