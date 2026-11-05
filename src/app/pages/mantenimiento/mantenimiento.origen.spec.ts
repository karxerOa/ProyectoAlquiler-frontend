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
});
