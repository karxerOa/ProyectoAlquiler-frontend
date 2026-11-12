import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { App } from './app';
import { routes } from './app.routes';
describe('App', () => {
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes), provideHttpClient(), provideHttpClientTesting()],
    });
  });
  it('creates the root component', () =>
    expect(TestBed.createComponent(App).componentInstance).toBeTruthy());
  it('protects deep links and renders login without the management shell', async () => {
    const harness = await RouterTestingHarness.create('/alquileres');
    expect(harness.routeNativeElement?.querySelector('form')).toBeTruthy();
    expect(harness.routeNativeElement?.querySelector('.app-shell')).toBeNull();
    expect(harness.routeNativeElement?.textContent).toContain('Iniciar');
  });
});
