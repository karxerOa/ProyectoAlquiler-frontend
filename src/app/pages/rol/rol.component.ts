import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Rol } from '../../model/rol';
import { RolService } from '../../services/rol.service';

@Component({
  selector: 'app-rol',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './rol.component.html',
  styleUrl: '../cliente/cliente.component.css'
})
export class RolComponent {
  private readonly rolService = inject(RolService);
  private readonly fb = inject(FormBuilder);

  busqueda = signal('');
  readonly roles = this.rolService.$rolesChange;
  modalAbierto = signal(false);
  editandoId = signal<number | null>(null);
  guardando = signal(false);
  mensajeError = signal('');
  errorCarga = signal('');

  form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(50)]],
    description: ['', [Validators.required, Validators.maxLength(255)]]
  });

  rolesFiltrados = computed(() => {
    const texto = this.busqueda();
    return this.roles().filter(rol =>
      `${rol.name} ${rol.description}`.toLowerCase().includes(texto)
    );
  });

  constructor() { this.cargar(); }

  cargar(): void {
    this.rolService.findAll().subscribe({
      next: data => { this.rolService.setRolesChange(data); this.errorCarga.set(''); },
      error: (error: unknown) => {
        console.error('Error al cargar roles:', error);
        this.errorCarga.set('No se pudieron cargar los roles.');
      }
    });
  }

  buscar(valor: string): void { this.busqueda.set(valor.trim().toLowerCase()); }

  nuevo(): void {
    this.editandoId.set(null);
    this.form.reset();
    this.mensajeError.set('');
    this.modalAbierto.set(true);
  }

  editar(rol: Rol): void {
    this.editandoId.set(rol.idRol);
    this.form.setValue({ name: rol.name, description: rol.description });
    this.mensajeError.set('');
    this.modalAbierto.set(true);
  }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const data = this.form.getRawValue();
    const id = this.editandoId();
    this.guardando.set(true);
    this.mensajeError.set('');
    const request = id === null ? this.rolService.create(data) : this.rolService.update(id, data);
    request.subscribe({
      next: () => { this.guardando.set(false); this.modalAbierto.set(false); this.cargar(); },
      error: (error: unknown) => {
        console.error('Error al guardar rol:', error);
        this.guardando.set(false);
        this.mensajeError.set('No se pudo guardar el rol.');
      }
    });
  }

  eliminar(rol: Rol): void {
    if (!confirm(`¿Eliminar el rol "${rol.name}"?`)) return;
    this.rolService.delete(rol.idRol).subscribe({
      next: () => this.cargar(),
      error: (error: unknown) => {
        console.error('Error al eliminar rol:', error);
        alert('No se pudo eliminar el rol. Puede tener usuarios asociados.');
      }
    });
  }

  campoInvalido(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && control.touched;
  }
}
