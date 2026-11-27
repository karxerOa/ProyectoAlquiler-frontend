import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Prenda } from '../../model/prenda';
import { AuthService } from '../../services/auth.service';
import { PrendaService } from '../../services/prenda.service';
import { UiService } from '../../shared/ui.service';
import { PrendaComponent } from './prenda.component';

function adminToken(): string {
  const claims = btoa(
    JSON.stringify({
      sub: 'ADMIN',
      role: 'ROLE_ADMIN',
      exp: Math.floor(Date.now() / 1000) + 600,
    }),
  );
  return `header.${claims}.signature`;
}

describe('PrendaComponent', () => {
  let http: HttpTestingController;
  let component: PrendaComponent;

  beforeEach(() => {
    sessionStorage.setItem('alquiler.session', adminToken());
    TestBed.configureTestingModule({
      imports: [PrendaComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: UiService, useValue: { confirm: vi.fn(), notify: vi.fn() } },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    component = TestBed.createComponent(PrendaComponent).componentInstance;
    http.expectOne(`${environment.apiUrl}/prendas`).flush([]);
    http.expectOne(`${environment.apiUrl}/categorias`).flush([]);
  });

  afterEach(() => {
    TestBed.inject(AuthService).logout();
    http.verify();
    sessionStorage.clear();
  });

  it('blocks creating a garment without its required photo', async () => {
    component.nuevo();
    component.form.setValue({
      nombre: 'Vestido rojo',
      descripcion: 'Vestido de prueba',
      talla: 'S',
      color: 'Rojo',
      precioAlquiler: 80,
      estado: 'DISPONIBLE',
      categoriaId: '1',
    });

    await component.guardar();

    expect(component.mensajeError()).toContain('La foto es obligatoria');
    http.expectNone(
      (request) =>
        request.url === `${environment.apiUrl}/prendas` && request.method === 'POST',
    );
  });

  it('sends the selected photo when creating a garment', async () => {
    component.nuevo();
    component.form.setValue({
        nombre: 'Vestido rojo',
        descripcion: 'Vestido de prueba',
        talla: 'S',
        color: 'Rojo',
        precioAlquiler: 80,
        estado: 'DISPONIBLE',
        categoriaId: '1',
    });
    const archivo = new File(['foto'], 'vestido.png', { type: 'image/png' });
    const input = document.createElement('input');
    Object.defineProperty(input, 'files', { value: [archivo] });
    component.seleccionarImagen(input);

    await component.guardar();

    const create = http.expectOne({
        method: 'POST',
        url: `${environment.apiUrl}/prendas`,
    });
    expect(create.request.body.imagen).toMatch(/^data:image\/png;base64,/);
    create.flush({ idPrenda: 8 });
    http.expectOne(`${environment.apiUrl}/prendas`).flush([]);
  });

  it('rejects a dropped PDF and accepts a replacement PNG in the same form', () => {
    component.nuevo();
    const drop = (file: File) => {
      const event = new Event('drop', { cancelable: true }) as DragEvent;
      Object.defineProperty(event, 'dataTransfer', { value: { files: [file] } });
      component.soltarImagen(event);
      expect(event.defaultPrevented).toBe(true);
    };
    drop(new File(['documento'], 'ficha.pdf', { type: 'application/pdf' }));
    expect(component.errorFoto()).toContain('JPG o PNG');
    const foto = new File(['foto'], 'prenda.png', { type: 'image/png' });
    drop(foto);
    expect(component.errorFoto()).toBe('');
    expect(component.archivo()).toBe(foto);
  });
  it('keeps the existing photo when editing a garment without selecting another', async () => {
    const prenda: Prenda = {
      idPrenda: 4,
      nombre: 'Vestido rojo',
      descripcion: 'Vestido de prueba',
      talla: 'S',
      color: 'Rojo',
      precioAlquiler: 80,
      estado: 'DISPONIBLE',
      categoriaId: 1,
      imagen: 'data:image/png;base64,cGlj',
    };
    TestBed.inject(PrendaService).setPrendasChange([prenda]);
    component.editar(prenda);

    expect(component.imagenObligatoria()).toBe(false);
    await component.guardar();

    const update = http.expectOne({
      method: 'PUT',
      url: `${environment.apiUrl}/prendas/4`,
    });
    expect(update.request.body.imagen).toBe(prenda.imagen);
    update.flush(prenda);
    http.expectOne(`${environment.apiUrl}/prendas`).flush([prenda]);
  });
});
