import { Component, computed, effect, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CurrencyPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatStepperModule } from '@angular/material/stepper';
import { firstValueFrom } from 'rxjs';
import { MATERIAL } from '../../shared/material';
import { ReferenciasService } from '../../services/referencias.service';
import { AlquilerService } from '../../services/alquiler.service';
import { DetalleAlquilerService } from '../../services/detalle-alquiler.service';
import { Prenda } from '../../model/prenda';
import { Cliente } from '../../model/cliente';
import { Alquiler } from '../../model/alquiler';
import { fechaLima } from '../../model/agenda';
import { normalizar } from '../../model/catalogo';
import { AuthService } from '../../services/auth.service';
import { EmpleadoService } from '../../services/empleado.service';
import { Empleado } from '../../model/empleado';
interface Linea {
  prenda: Prenda;
  cantidad: number;
}
@Component({
  selector: 'app-alquiler-wizard',
  standalone: true,
  imports: [...MATERIAL, MatStepperModule, ReactiveFormsModule, CurrencyPipe, RouterLink],
  templateUrl: './alquiler-wizard.component.html',
  styleUrl: './alquiler-wizard.component.css',
})
export class AlquilerWizardComponent {
  readonly ref = inject(ReferenciasService);
  readonly auth = inject(AuthService);
  private readonly alquilerService = inject(AlquilerService);
  private readonly detalleService = inject(DetalleAlquilerService);
  private readonly empleadoService = inject(EmpleadoService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly cliente = signal<Cliente | null>(null);
  readonly lineas = signal<Linea[]>([]);
  readonly buscarCliente = signal('');
  readonly buscarPrenda = signal('');
  readonly guardando = signal(false);
  readonly error = signal('');
  readonly empleadoSesion = signal<Empleado | null>(null);
  readonly estadoEmpleadoSesion = signal<'cargando' | 'vinculado' | 'sin-ficha' | 'error'>(
    'cargando',
  );
  readonly errorEmpleadoSesion = signal('');
  readonly creado = signal<Alquiler | null>(null);
  readonly incertidumbre = signal(false);
  readonly cantidadesInvalidas = signal<number[]>([]);
  readonly clientes = computed(() =>
    this.ref
      .clientes()
      .filter((c) =>
        normalizar(c.nombre + ' ' + c.apellidos + ' ' + c.dni).includes(
          normalizar(this.buscarCliente()),
        ),
      ),
  );
  readonly prendas = computed(() =>
    this.ref
      .prendas()
      .filter(
        (p) =>
          p.estado.toUpperCase() === 'DISPONIBLE' &&
          normalizar(p.nombre + ' ' + p.talla + ' ' + p.color).includes(
            normalizar(this.buscarPrenda()),
          ),
      ),
  );
  readonly total = computed(
    () =>
      Math.round(
        this.lineas().reduce((n, l) => n + l.prenda.precioAlquiler * l.cantidad, 0) * 100,
      ) / 100,
  );
  readonly form = inject(FormBuilder).nonNullable.group({
    fechaInicio: [fechaLima(), Validators.required],
    fechaFin: [fechaLima(), Validators.required],
    empleadoId: ['', Validators.required],
  });

  constructor() {
    this.cargarEmpleadoSesion();
    const rawClienteId = this.route.snapshot.queryParamMap.get('clienteId');
    const clienteId = Number(rawClienteId);
    if (!rawClienteId || !Number.isSafeInteger(clienteId) || clienteId < 1) return;

    let seleccionado = false;
    effect(() => {
      if (seleccionado) return;
      const cliente = this.ref.clientes().find((item) => item.idCliente === clienteId);
      if (cliente) {
        this.cliente.set(cliente);
        seleccionado = true;
      }
    });
  }

  private cargarEmpleadoSesion(): void {
    this.empleadoService.findMe().subscribe({
      next: (empleado) => {
        this.empleadoSesion.set(empleado);
        this.form.controls.empleadoId.clearValidators();
        this.form.controls.empleadoId.setValue('', { emitEvent: false });
        this.form.controls.empleadoId.updateValueAndValidity({ emitEvent: false });
        this.estadoEmpleadoSesion.set('vinculado');
      },
      error: (error: unknown) => {
        if (error instanceof HttpErrorResponse && error.status === 404) {
          this.form.controls.empleadoId.setValidators([Validators.required, Validators.min(1)]);
          this.form.controls.empleadoId.updateValueAndValidity({ emitEvent: false });
          this.estadoEmpleadoSesion.set('sin-ficha');
          return;
        }

        const status =
          error instanceof HttpErrorResponse ? ` (HTTP ${error.status || 'sin conexión'})` : '';
        this.errorEmpleadoSesion.set(
          `No se pudo verificar el empleado de la sesión${status}. Recarga la página para volver a intentar.`,
        );
        this.estadoEmpleadoSesion.set('error');
      },
    });
  }

  seleccionada(id: number): boolean {
    return this.lineas().some((l) => l.prenda.idPrenda === id);
  }
  agregar(prenda: Prenda): void {
    if (!this.creado() && !this.seleccionada(prenda.idPrenda))
      this.lineas.update((ls) => [...ls, { prenda, cantidad: 1 }]);
  }
  quitar(id: number): void {
    if (!this.creado()) this.lineas.update((ls) => ls.filter((l) => l.prenda.idPrenda !== id));
    this.cantidadesInvalidas.update((ids) => ids.filter((i) => i !== id));
  }
  cantidad(id: number, value: string): void {
    if (this.creado() || this.guardando()) return;
    const n = Number(value);
    const valid = Number.isInteger(n) && n > 0 && n <= 100;
    this.cantidadesInvalidas.update((ids) =>
      valid ? ids.filter((i) => i !== id) : [...new Set([...ids, id])],
    );
    if (valid)
      this.lineas.update((ls) =>
        ls.map((l) => (l.prenda.idPrenda === id ? { ...l, cantidad: n } : l)),
      );
  }
  fechasValidas(): boolean {
    const v = this.form.getRawValue();
    const estado = this.estadoEmpleadoSesion();
    const alquilerYaCreado = !!this.creado();
    const empleadoValido =
      estado === 'vinculado' ||
      (estado === 'sin-ficha' &&
        !!v.empleadoId &&
        (this.form.controls.empleadoId.valid || alquilerYaCreado));
    return (
      estado !== 'cargando' &&
      estado !== 'error' &&
      empleadoValido &&
      (alquilerYaCreado ||
        (this.form.controls.fechaInicio.valid && this.form.controls.fechaFin.valid)) &&
      v.fechaFin >= v.fechaInicio
    );
  }
  async guardar(): Promise<void> {
    if (
      this.guardando() ||
      this.incertidumbre() ||
      this.cantidadesInvalidas().length > 0 ||
      !this.auth.canWrite() ||
      !this.cliente() ||
      !this.lineas().length ||
      !this.fechasValidas()
    )
      return;
    this.guardando.set(true);
    this.error.set('');
    try {
      let alquiler = this.creado();
      if (!alquiler) {
        const v = this.form.getRawValue();
        try {
          alquiler = await firstValueFrom(
            this.alquilerService.create({
              fechaInicio: v.fechaInicio,
              fechaFin: v.fechaFin,
              fechaAlquiler: fechaLima(),
              clienteId: this.cliente()!.idCliente,
              ...(this.estadoEmpleadoSesion() === 'sin-ficha'
                ? { empleadoId: Number(v.empleadoId) }
                : {}),
              estado: 'PENDIENTE',
              subtotal: this.total(),
              total: this.total(),
            }),
          );
        } catch (error) {
          if (!(
            error &&
            typeof error === 'object' &&
            'status' in error &&
            typeof error.status === 'number' &&
            error.status >= 400 &&
            error.status < 500
          ))
            this.incertidumbre.set(true);
          throw error;
        }
        this.creado.set(alquiler);
        this.form.disable();
      }
      const guardados = await firstValueFrom(this.detalleService.findAll());
      for (const linea of this.lineas()) {
        if (
          guardados.some(
            (d) => d.alquilerId === alquiler.idAlquiler && d.prendaId === linea.prenda.idPrenda,
          )
        )
          continue;
        const d = await firstValueFrom(
          this.detalleService.create({
            alquilerId: alquiler.idAlquiler,
            prendaId: linea.prenda.idPrenda,
            cantidad: linea.cantidad,
            precioUnitario: linea.prenda.precioAlquiler,
            subtotal: Math.round(linea.cantidad * linea.prenda.precioAlquiler * 100) / 100,
          }),
        );
        guardados.push(d);
      }
      this.ref.cargar(true);
      await this.router.navigate(['/alquileres'], {
        queryParams: { alquiler: alquiler.idAlquiler },
      });
    } catch {
      this.error.set(
        this.creado()
          ? 'La reserva ALQ-' +
              this.creado()!.idAlquiler +
              ' está creada, pero faltó completar sus prendas. Pulsa Completar registro para reintentar solo lo pendiente.'
          : this.incertidumbre()
            ? 'No pudimos confirmar el resultado. Revisa la lista de alquileres antes de iniciar otra reserva.'
            : 'No se pudo registrar el alquiler. Verifica cliente, empleado y fechas.',
      );
    } finally {
      this.guardando.set(false);
    }
  }
}
