import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ClienteComponent } from './cliente.component';
import { Cliente } from '../../model/cliente';
describe('Historial por cliente', () => {
  it('separa clientes con el mismo nombre usando la relación del servidor', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    const c = TestBed.createComponent(ClienteComponent).componentInstance;
    const http = TestBed.inject(HttpTestingController);
    http.expectOne((r) => r.url.endsWith('/clientes')).flush([]);
    c.verHistorial({ idCliente: 2, nombre: 'Ana', apellidos: 'Ríos' } as Cliente);
    http
      .expectOne((r) => r.url.endsWith('/alquileres'))
      .flush([
        { idAlquiler: 11, clienteId: 1, nombreCliente: 'Ana', fechaInicio: '2026-01-01' },
        { idAlquiler: 22, clienteId: 2, nombreCliente: 'Ana', fechaInicio: '2026-01-01' },
      ]);
    expect(c.historial().map((a) => a.idAlquiler)).toEqual([22]);
    http.verify();
  });
});
