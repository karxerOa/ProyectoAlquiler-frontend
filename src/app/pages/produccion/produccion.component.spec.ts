import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { UiService } from '../../shared/ui.service';
import { ProduccionComponent } from './produccion.component';

describe('Producción', () => {
  it('exige elegir referencias, busca por sus nombres y permite editar y eliminar', async () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    const component = TestBed.createComponent(ProduccionComponent).componentInstance;
    const http = TestBed.inject(HttpTestingController);
    const url = environment.apiUrl + '/producciones';
    http.expectOne(url).flush([]);
    component.nuevo();
    component.form.controls.descripcion.setValue('Costura');
    component.guardar();
    http.expectNone({ method: 'POST', url });
    component.form.patchValue({ prenda: '7', empleado: '8', cantidad: 1.5 });
    expect(component.form.invalid).toBe(true);
    component.form.controls.cantidad.setValue(2);
    component.guardar();
    component.guardar();
    const post = http.expectOne({ method: 'POST', url });
    expect(post.request.body).toMatchObject({ cantidad: 2, idPrenda: 7, idEmpleado: 8 });
    const registro = { ...post.request.body, idProduccion: 14 };
    post.flush(registro);
    http.expectOne(url).flush([registro]);
    vi.spyOn(component.ref, 'prenda').mockReturnValue('Vestido azul');
    vi.spyOn(component.ref, 'empleado').mockReturnValue('Ana Pérez');
    for (const palabra of ['azul', 'Pérez']) {
      component.buscar(palabra);
      expect(component.produccionesFiltradas()).toEqual([registro]);
    }
    component.editar(registro);
    component.form.controls.descripcion.setValue('Retoque');
    component.guardar();
    const put = http.expectOne({ method: 'PUT', url: url + '/14' });
    expect(put.request.body.descripcion).toBe('Retoque');
    put.flush(put.request.body);
    http.expectOne(url).flush([{ ...registro, descripcion: 'Retoque' }]);
    const confirmar = vi.spyOn(TestBed.inject(UiService), 'confirm');
    confirmar.mockResolvedValueOnce(false);
    await component.eliminar(registro);
    http.expectNone({ method: 'DELETE', url: url + '/14' });
    confirmar.mockResolvedValueOnce(true);
    await component.eliminar(registro);
    http.expectOne({ method: 'DELETE', url: url + '/14' }).flush(null);
    http.expectOne(url).flush([]);
    expect(component.producciones()).toEqual([]);
    http.verify();
  });
});
