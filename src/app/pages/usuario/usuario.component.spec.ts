import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { Rol } from '../../model/rol';
import { RolService } from '../../services/rol.service';
import { UiService } from '../../shared/ui.service';
import { UsuarioService } from '../../services/usuario.service';
import { UsuarioComponent } from './usuario.component';

describe('UsuarioComponent roles', () => {
  it('offers both internal roles and saves an employee using the role ID from the API', () => {
    const create = vi.fn(() => of({}));
    const roles = signal<Rol[]>([]);
    const rolesDisponibles: Rol[] = [
      { idRol: 1, name: 'ADMIN', description: '' },
      { idRol: 2, name: 'ROLE_ADMIN', description: '' },
      { idRol: 3, name: 'EMPLEADO', description: '' },
      { idRol: 4, name: ' ROLE_EMPLEADO ', description: '' },
      { idRol: 5, name: 'role_empleado', description: '' },
      { idRol: 6, name: 'CLIENTE', description: '' },
    ];
    const rolService = {
      $rolesChange: roles.asReadonly(),
      findAll: vi.fn(() => of(rolesDisponibles)),
      setRolesChange: vi.fn((data: Rol[]) => roles.set(data)),
    };

    TestBed.configureTestingModule({
      providers: [
        {
          provide: UsuarioService,
          useValue: {
            $usuariosChange: signal([]).asReadonly(),
            findAll: vi.fn(() => of([])),
            setUsuariosChange: vi.fn(),
            create,
          },
        },
        { provide: RolService, useValue: rolService },
        { provide: UiService, useValue: { confirm: vi.fn(), notify: vi.fn() } },
      ],
    });
    const component = TestBed.runInInjectionContext(() => new UsuarioComponent());

    expect(component.roles().map((rol) => rol.idRol)).toEqual([1, 2, 3, 4, 5]);
    component.nuevo();
    component.form.patchValue({ username: 'prueba', password: 'soloPrueba123', rolId: '4' });
    component.guardar();
    expect(create).toHaveBeenCalledWith({
      username: 'prueba', password: 'soloPrueba123', enabled: true, rolId: 4,
    });
  });
});
