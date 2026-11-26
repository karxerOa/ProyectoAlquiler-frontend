import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { EmpleadoService } from './empleado.service';

describe('EmpleadoService', () => {
  it('loads the employee linked to the current session without exposing a password', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    const service = TestBed.inject(EmpleadoService);
    const http = TestBed.inject(HttpTestingController);
    let response: unknown;

    service.findMe().subscribe((empleado) => (response = empleado));
    const request = http.expectOne(`${environment.apiUrl}/empleados/me`);
    expect(request.request.method).toBe('GET');
    request.flush({
      idEmpleado: 9,
      idUser: 3,
      username: 'empleado',
      nombres: 'Elena',
      apellidos: 'Sesión',
      dni: '87654321',
      telefono: '987654321',
      cargo: 'Asesora',
      estado: 'Activo',
      password: 'no-exponer',
    });

    expect(response).not.toHaveProperty('password');
    expect(response).toHaveProperty('idEmpleado', 9);
    http.verify();
  });
});
