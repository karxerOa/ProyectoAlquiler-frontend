import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { AuthService, authUrl, readSession } from './auth.service';
import { authInterceptor } from './auth.interceptor';
import { environment } from '../../environments/environment';
function jwt(role = 'ROLE_ADMIN', seconds = 600) {
  return (
    'header.' +
    btoa(JSON.stringify({ sub: 'ADMIN', role, exp: Math.floor(Date.now() / 1000) + seconds })) +
    '.signature'
  );
}
describe('Authentication', () => {
  let http: HttpTestingController;
  let auth: AuthService;
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpTestingController);
    auth = TestBed.inject(AuthService);
    vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
  });
  afterEach(() => {
    auth.logout();
    http.verify();
    sessionStorage.clear();
  });
  function login(role = 'ROLE_ADMIN') {
    auth.login('ADMIN', 'example').subscribe();
    const request = http.expectOne(authUrl);
    expect(request.request.method).toBe('POST');
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({ access_token: jwt(role) });
  }
  it('rejects malformed and expired tokens', () => {
    expect(readSession('invalid')).toBeNull();
    expect(readSession(jwt('USER', -10))).toBeNull();
  });
  it('keeps the session and attaches Bearer only to our API', () => {
    login();
    expect(auth.isAdmin()).toBe(true);
    const client = TestBed.inject(HttpClient);
    client.get(environment.apiUrl + '/prendas').subscribe();
    const api = http.expectOne(environment.apiUrl + '/prendas');
    expect(api.request.headers.get('Authorization')).toBe('Bearer ' + auth.token());
    api.flush([]);
    client.get('https://example.com/data').subscribe();
    const external = http.expectOne('https://example.com/data');
    expect(external.request.headers.has('Authorization')).toBe(false);
    external.flush([]);
    expect(sessionStorage.getItem('alquiler.session')).toBe(auth.token());
  });
  it('clears the session after 401 but preserves it after 403', () => {
    login('ROLE_USER');
    expect(auth.isAdmin()).toBe(false);
    expect(auth.canWrite()).toBe(false);
    const client = TestBed.inject(HttpClient);
    client.get(environment.apiUrl + '/usuarios').subscribe({ error: () => {} });
    http
      .expectOne(environment.apiUrl + '/usuarios')
      .flush({}, { status: 403, statusText: 'Forbidden' });
    expect(auth.token()).not.toBeNull();
    client.get(environment.apiUrl + '/prendas').subscribe({ error: () => {} });
    http
      .expectOne(environment.apiUrl + '/prendas')
      .flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(auth.token()).toBeNull();
  });
  it('does not create a session for rejected credentials', () => {
    auth.login('ADMIN', 'wrong').subscribe({ error: () => {} });
    http.expectOne(authUrl).flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(auth.token()).toBeNull();
  });
});
