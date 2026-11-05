import { ReferenciasService } from '../../services/referencias.service';
import { AlquilerService } from '../../services/alquiler.service';
import { Alquiler } from '../../model/alquiler';
import { RouterLink } from '@angular/router';
import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ClienteService } from '../../services/cliente.service';
import type { Cliente } from '../../model/cliente';
import { normalizar } from '../../model/catalogo';

@Component({
  selector: 'app-cliente',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './cliente.component.html',
  styleUrl: './cliente.component.css',
})
export class ClienteComponent {
  readonly ref = inject(ReferenciasService);
  private readonly alquilerService = inject(AlquilerService);
  readonly historialCliente = signal<Cliente | null>(null);
  readonly historial = signal<Alquiler[]>([]);
  readonly cargandoHistorial = signal(false);
  readonly errorHistorial = signal('');
  verHistorial(cliente: Cliente) {
    this.historialCliente.set(cliente);
    this.historial.set([]);
    this.errorHistorial.set('');
    this.cargandoHistorial.set(true);
    this.alquilerService.findAll().subscribe({
      next: (items) => {
        if (this.historialCliente()?.idCliente !== cliente.idCliente) return;
        this.historial.set(
          items
            .filter((a) => a.clienteId === cliente.idCliente)
            .sort((a, b) => b.fechaInicio.localeCompare(a.fechaInicio)),
        );
        this.cargandoHistorial.set(false);
      },
      error: () => {
        if (this.historialCliente()?.idCliente !== cliente.idCliente) return;
        this.errorHistorial.set('No se pudo cargar el historial.');
        this.cargandoHistorial.set(false);
      },
    });
  }

  private readonly clienteService = inject(ClienteService);
  private readonly fb = inject(FormBuilder);

  busqueda = signal('');
  readonly clientes = this.clienteService.$clientesChange;

  modalAbierto = signal(false);
  editandoId = signal<number | null>(null);
  guardando = signal(false);
  mensajeError = signal('');

  form = this.fb.nonNullable.group({
    nombre: ['', [Validators.required, Validators.maxLength(50)]],
    apellidos: ['', [Validators.required, Validators.maxLength(50)]],
    dni: ['', [Validators.required, Validators.pattern(/^\d{8}$/)]],
    telefono: ['', [Validators.required, Validators.pattern(/^\d{9}$/)]],
    direccion: ['', [Validators.required, Validators.maxLength(100)]],
    correo: ['', [Validators.required, Validators.email, Validators.maxLength(100)]],
  });

  clientesFiltrados = computed(() => {
    const texto = this.busqueda();
    return this.clientes().filter((cliente) =>
      normalizar(
        `${cliente.nombre} ${cliente.apellidos} ${cliente.dni} ${cliente.telefono} ${cliente.correo}`,
      ).includes(texto),
    );
  });

  constructor() {
    this.cargarClientes();
  }

  cargarClientes(): void {
    this.clienteService.findAll().subscribe({
      next: (data) => {
        this.clienteService.setClientesChange(data);
        this.ref.clientes.set(data);
      },
      error: (error) => console.error('Error al cargar clientes:', error),
    });
  }

  buscar(valor: string): void {
    this.busqueda.set(normalizar(valor));
  }

  // ---------- NUEVO ----------
  nuevo(): void {
    this.editandoId.set(null);
    this.form.reset();
    this.mensajeError.set('');
    this.modalAbierto.set(true);
  }

  // ---------- EDITAR ----------
  editar(cliente: Cliente): void {
    this.editandoId.set(cliente.idCliente);
    this.form.setValue({
      nombre: cliente.nombre,
      apellidos: cliente.apellidos,
      dni: String(cliente.dni),
      telefono: String(cliente.telefono),
      direccion: cliente.direccion,
      correo: cliente.correo,
    });
    this.mensajeError.set('');
    this.modalAbierto.set(true);
  }

  // ---------- GUARDAR (sirve para nuevo y editar) ----------
  guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();
    const datos = { ...v, dni: Number(v.dni), telefono: Number(v.telefono) };
    const id = this.editandoId();

    this.guardando.set(true);
    this.mensajeError.set('');

    const peticion =
      id === null ? this.clienteService.create(datos) : this.clienteService.update(id, datos);

    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.cerrarModal();
        this.cargarClientes();
      },
      error: (error) => {
        console.error('Error al guardar cliente:', error);
        this.guardando.set(false);
        this.mensajeError.set(
          'No se pudo guardar. Verifica que el DNI, teléfono y correo no estén repetidos.',
        );
      },
    });
  }

  // ---------- ELIMINAR ----------
  eliminar(cliente: Cliente): void {
    if (!confirm(`¿Eliminar a ${cliente.nombre} ${cliente.apellidos}?`)) {
      return;
    }

    this.clienteService.delete(cliente.idCliente).subscribe({
      next: () => this.cargarClientes(),
      error: (error) => {
        console.error('Error al eliminar cliente:', error);
        alert('No se pudo eliminar. Puede que el cliente tenga alquileres registrados.');
      },
    });
  }

  cerrarModal(): void {
    this.modalAbierto.set(false);
  }

  campoInvalido(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && control.touched;
  }
}
