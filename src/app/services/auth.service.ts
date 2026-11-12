import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../environments/environment';

interface Session {
  token: string;
  username: string;
  roles: string[];
  expires: number;
}
export const authUrl = environment.apiUrl.replace(/\/v1\/?$/, '') + '/login';
const storageKey = 'alquiler.session';
/** Decoding claims is only for UX. The API verifies the signature and permissions. */
export function readSession(token: string): Session | null {
  try {
    const segment = token.split('.')[1];
    if (!segment || token.split('.').length !== 3) return null;
    const bytes = Uint8Array.from(atob(segment.replace(/-/g, '+').replace(/_/g, '/')), (c) =>
      c.charCodeAt(0),
    );
    const claims: unknown = JSON.parse(new TextDecoder().decode(bytes));
    if (!claims || typeof claims !== 'object') return null;
    const c = claims as Record<string, unknown>;
    if (
      typeof c['sub'] !== 'string' ||
      typeof c['exp'] !== 'number' ||
      !Number.isFinite(c['exp']) ||
      c['exp'] * 1000 <= Date.now()
    )
      return null;
    const roles =
      typeof c['role'] === 'string'
        ? c['role'].split(',').map((r) => r.trim().replace(/^ROLE_/, ''))
        : [];
    return { token, username: c['sub'], roles, expires: c['exp'] * 1000 };
  } catch {
    return null;
  }
}
@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly session = signal<Session | null>(this.restore());
  private timer?: ReturnType<typeof setTimeout>;
  readonly username = computed(() => this.session()?.username ?? '');
  readonly isAdmin = computed(() => this.session()?.roles.includes('ADMIN') ?? false);
  readonly canWrite = computed(
    () => this.session()?.roles.some((r) => ['ADMIN', 'EMPLEADO'].includes(r)) ?? false,
  );
  constructor() {
    this.scheduleExpiry();
  }
  token(): string | null {
    const s = this.session();
    if (s && s.expires > Date.now()) return s.token;
    return null;
  }
  login(username: string, password: string) {
    return this.http
      .post<{ access_token: string }>(authUrl, { username: username.trim(), password })
      .pipe(
        tap((response) => {
          const session = readSession(response.access_token);
          if (!session) throw new Error('Respuesta de autenticacion invalida');
          sessionStorage.setItem(storageKey, session.token);
          this.session.set(session);
          this.scheduleExpiry();
        }),
      );
  }
  logout(expired = false): void {
    clearTimeout(this.timer);
    sessionStorage.removeItem(storageKey);
    this.session.set(null);
    void this.router.navigate(['/login'], { queryParams: expired ? { expired: '1' } : {} });
  }
  private restore(): Session | null {
    try {
      return readSession(sessionStorage.getItem(storageKey) ?? '');
    } catch {
      return null;
    }
  }
  private scheduleExpiry(): void {
    clearTimeout(this.timer);
    const session = this.session();
    if (session)
      this.timer = setTimeout(
        () => this.logout(true),
        Math.min(session.expires - Date.now(), 2147483647),
      );
  }
}
