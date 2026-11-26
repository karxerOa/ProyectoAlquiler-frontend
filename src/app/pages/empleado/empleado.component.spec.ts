import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Empleado } from '../../model/empleado';
import { UiService } from '../../shared/ui.service';
import { EmpleadoComponent } from './empleado.component';

describe('EmpleadoComponent', () => {
  let http: HttpTestingController;
  let component: EmpleadoComponent;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      imports: [EmpleadoComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: UiService, useValue: { confirm: vi.fn(), notify: vi.fn() } },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    component = TestBed.createComponent(EmpleadoComponent).componentInstance;
    http.expectOne(`${environment.apiUrl}/empleados`).flush([]);
  });

  afterEach(() => {
    http.verify();
    sessionStorage.clear();
  });

  function completarDatos(): void {
    component.form.setValue({
      nombres: 'Ana',
      apellidos: 'Prueba',
      dni: '12345678',
      telefono: '987654321',
      cargo: 'Asesora',
      estado: 'Activo',
      username: 'ana.prueba',
      password: 'ClaveSegura1',
    });
  }

  it('requires username and password when creating an employee', () => {
    component.nuevo();
    component.form.patchValue({
      nombres: 'Ana',
      apellidos: 'Prueba',
      dni: '12345678',
      telefono: '987654321',
      cargo: 'Asesora',
    });

    expect(component.form.controls.username.invalid).toBe(true);
    expect(component.form.controls.password.invalid).toBe(true);
  });

  it('creates the employee and linked account, and strips passwords from responses', () => {
    component.nuevo();
    completarDatos();
    component.guardar();

    const request = http.expectOne({ method: 'POST', url: `${environment.apiUrl}/empleados` });
    expect(request.request.body).toEqual({
      nombres: 'Ana',
      apellidos: 'Prueba',
      dni: '12345678',
      telefono: '987654321',
      cargo: 'Asesora',
      estado: 'Activo',
      username: 'ana.prueba',
      password: 'ClaveSegura1',
    });
    request.flush({
      idEmpleado: 7,
      username: 'ana.prueba',
      password: 'respuesta-no-expuesta',
    });
    http
      .expectOne(`${environment.apiUrl}/empleados`)
      .flush([
        {
          idEmpleado: 7,
          nombres: 'Ana',
          apellidos: 'Prueba',
          dni: '12345678',
          telefono: '987654321',
          cargo: 'Asesora',
          estado: 'Activo',
          username: 'ana.prueba',
          password: 'respuesta-no-expuesta',
        },
      ]);

    expect(JSON.stringify(component.empleados())).not.toContain('password');
    expect(JSON.stringify(component.empleados())).not.toContain('respuesta-no-expuesta');
  });

  it('leaves the password blank when editing and omits it to preserve the current password', () => {
    const empleado: Empleado = {
      idEmpleado: 7,
      nombres: 'Ana',
      apellidos: 'Prueba',
      dni: '12345678',
      telefono: '987654321',
      cargo: 'Asesora',
      estado: 'Activo',
      username: 'ana.prueba',
    };
    component.editar(empleado);

    expect(component.form.controls.password.value).toBe('');
    component.guardar();

    const request = http.expectOne({ method: 'PUT', url: `${environment.apiUrl}/empleados/7` });
    expect(request.request.body).toEqual({
      nombres: 'Ana',
      apellidos: 'Prueba',
      dni: '12345678',
      telefono: '987654321',
      cargo: 'Asesora',
      estado: 'Activo',
      username: 'ana.prueba',
    });
    request.flush({ ...empleado, password: 'respuesta-no-expuesta' });
    http.expectOne(`${environment.apiUrl}/empleados`).flush([]);
  });

  it('sends a new username and password when they are changed during editing', () => {
    const empleado: Empleado = {
      idEmpleado: 7,
      nombres: 'Ana',
      apellidos: 'Prueba',
      dni: '12345678',
      telefono: '987654321',
      cargo: 'Asesora',
      estado: 'Activo',
      username: 'ana.prueba',
    };
    component.editar(empleado);
    component.form.patchValue({ username: 'ana.nueva', password: 'OtraClave123' });
    component.guardar();

    const request = http.expectOne({ method: 'PUT', url: `${environment.apiUrl}/empleados/7` });
    expect(request.request.body.username).toBe('ana.nueva');
    expect(request.request.body.password).toBe('OtraClave123');
    request.flush(empleado);
    http.expectOne(`${environment.apiUrl}/empleados`).flush([]);
  });

  it('shows backend validation errors when saving an employee', () => {
    component.nuevo();
    completarDatos();
    component.guardar();
    http
      .expectOne({ method: 'POST', url: `${environment.apiUrl}/empleados` })
      .flush({ message: 'El username ya está registrado.' }, {
        status: 409,
        statusText: 'Conflict',
      });

    expect(component.mensajeError()).toBe('El username ya está registrado.');
  });
});
