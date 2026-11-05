import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Cliente } from '../model/cliente';
import { Empleado } from '../model/empleado';
import { Prenda } from '../model/prenda';
import { Alquiler } from '../model/alquiler';
import { Categoria } from '../model/categoria';
import { DetalleAlquiler } from '../model/detalle-alquiler';
import { Devolucion } from '../model/devolucion';
import { prendaActiva, dniTexto } from '../model/flujo';
export interface OpcionReferencia {
  valor: number;
  nombre: string;
}
@Injectable({ providedIn: 'root' })
export class ReferenciasService {
  private readonly http = inject(HttpClient);
  private iniciada = false;
  readonly clientes = signal<Cliente[]>([]);
  readonly empleados = signal<Empleado[]>([]);
  readonly prendas = signal<Prenda[]>([]);
  readonly alquileres = signal<Alquiler[]>([]);
  readonly categorias = signal<Categoria[]>([]);
  readonly detalles = signal<DetalleAlquiler[]>([]);
  readonly devoluciones = signal<Devolucion[]>([]);
  readonly errores = signal<string[]>([]);
  readonly pendientes = signal(0);
  private readonly clientesMap = computed(
    () => new Map(this.clientes().map((c) => [c.idCliente, `${c.nombre} ${c.apellidos}`])),
  );
  private readonly empleadosMap = computed(
    () => new Map(this.empleados().map((e) => [e.idEmpleado, `${e.nombres} ${e.apellidos}`])),
  );
  private readonly prendasMap = computed(
    () => new Map(this.prendas().map((p) => [p.idPrenda, p.nombre])),
  );
  readonly opcionesPrendas = computed(() =>
    this.prendas()
      .filter((p) => prendaActiva(p.estado))
      .map((p) => ({ valor: p.idPrenda, nombre: `${p.nombre} · ${p.talla} · ${p.color}` })),
  );
  readonly opcionesEmpleados = computed(() =>
    this.empleados().map((e) => ({ valor: e.idEmpleado, nombre: `${e.nombres} ${e.apellidos}` })),
  );
  readonly opcionesAlquileres = computed(() =>
    this.alquileres().map((a) => ({ valor: a.idAlquiler, nombre: this.alquiler(a.idAlquiler) })),
  );
  readonly opcionesDevoluciones = computed(() =>
    this.devoluciones()
      .filter((d) => d.idDevolucion != null)
      .map((d) => ({
        valor: d.idDevolucion!,
        nombre: `${this.alquiler(d.alquilerId)} · devolución ${d.fechaDevolucion.slice(0, 10)}`,
      })),
  );
  cliente(id: number) {
    return this.clientesMap().get(id) || 'Cliente no disponible';
  }
  empleado(id: number) {
    return this.empleadosMap().get(id) || 'Empleado no disponible';
  }
  prenda(id: number) {
    return this.prendasMap().get(id) || 'Prenda no disponible';
  }
  categoria(id: number) {
    return this.categorias().find((c) => c.idCategoria === id)?.nombre || 'Sin categoría informada';
  }
  alquiler(id: number) {
    const a = this.alquileres().find((a) => a.idAlquiler === id);
    return a
      ? `${this.cliente(a.clienteId)} · ${a.fechaInicio.slice(0, 10)} a ${a.fechaFin.slice(0, 10)} · ${a.estado}`
      : 'Alquiler no disponible';
  }
  devolucion(id: number) {
    const d = this.devoluciones().find((d) => d.idDevolucion === id);
    return d
      ? `${this.alquiler(d.alquilerId)} · ${d.fechaDevolucion.slice(0, 10)}`
      : 'Devolución no disponible';
  }
  dni(id: number) {
    const c = this.clientes().find((c) => c.idCliente === id);
    return c ? dniTexto(c.dni) : '';
  }
  cargar(forzar = false) {
    if (this.pendientes() || (this.iniciada && !forzar)) return;
    this.iniciada = true;
    this.errores.set([]);
    this.pendientes.set(7);
    this.obtener('clientes', this.clientes);
    this.obtener('empleados', this.empleados);
    this.obtener('prendas', this.prendas);
    this.obtener('alquileres', this.alquileres);
    this.obtener('categorias', this.categorias);
    this.obtener('detalles-alquiler', this.detalles);
    this.obtener('devoluciones', this.devoluciones);
  }
  private obtener<T>(ruta: string, destino: { set: (v: T[]) => void }) {
    this.http.get<T[]>(`${environment.apiUrl}/${ruta}`).subscribe({
      next: (datos) => {
        destino.set(datos);
        this.pendientes.update((n) => n - 1);
      },
      error: () => {
        this.errores.update((e) => [...e, ruta]);
        this.pendientes.update((n) => n - 1);
      },
    });
  }
}
