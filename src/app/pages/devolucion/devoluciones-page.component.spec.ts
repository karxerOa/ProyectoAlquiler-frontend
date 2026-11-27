import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { DevolucionesPageComponent } from './devoluciones-page.component';

describe('Modales de devoluciones', () => {
  it('abre la recepción y el detalle desde sus filas y vuelve a la lista al cerrar', async () => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideRouter([])] });
    const fixture = TestBed.createComponent(DevolucionesPageComponent);
    const { ref } = fixture.componentInstance;
    ref.alquileres.set([
      {
        idAlquiler: 1,
        clienteId: 2,
        empleadoId: 3,
        estado: 'ACTIVO',
        fechaAlquiler: '2026-01-01',
        fechaInicio: '2026-01-01',
        fechaFin: '2026-01-03',
        subtotal: 50,
        total: 50,
      },
    ]);
    ref.devoluciones.set([
      {
        idDevolucion: 5,
        alquilerId: 2,
        empleadoId: 3,
        fechaDevolucion: '2026-01-03',
        estadoPrenda: 'BUENO',
        observacion: 'Vestido recibido',
      },
    ]);
    fixture.detectChanges();
    const botones = fixture.nativeElement.querySelectorAll(
      'tbody button',
    ) as NodeListOf<HTMLButtonElement>;
    expect(botones.length).toBe(2);
    for (const [i, titulo] of ['Registrar devolución', 'Detalle de devolución'].entries()) {
      botones[i].click();
      fixture.detectChanges();
      await fixture.whenStable();
      fixture.detectChanges();
      const dialogo = document.querySelector('mat-dialog-container')!;
      expect(dialogo).toBeTruthy();
      expect(dialogo.querySelector('h2')?.textContent).toContain(titulo);
      if (i === 1) expect(dialogo.textContent).toContain('Vestido recibido');
      dialogo.querySelector<HTMLButtonElement>('footer button')!.click();
      fixture.detectChanges();
      await fixture.whenStable();
      expect(document.querySelector('mat-dialog-container')).toBeNull();
    }
  });
});
