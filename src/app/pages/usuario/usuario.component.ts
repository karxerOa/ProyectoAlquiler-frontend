import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RolService } from '../../services/rol.service';
import { Usuario } from '../../model/usuario';
import { UsuarioService } from '../../services/usuario.service';
import { Rol } from '../../model/rol';

@Component({
  selector: 'app-usuario',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './usuario.component.html',
  styleUrl: '../cliente/cliente.component.css'
})
export class UsuarioComponent {
  private readonly usuarioService = inject(UsuarioService);
  private readonly rolService = inject(RolService);
  private readonly fb = inject(FormBuilder);

  busqueda = signal('');
  readonly usuarios = this.usuarioService.$usuariosChange;
  readonly roles = this.rolService.$rolesChange;
  modalAbierto = signal(false);
  editandoId = signal<number | null>(null);
  guardando = signal(false);
  mensajeError = signal('');
  errorCarga = signal('');

  form = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.maxLength(50)]],
    password: ['', [Validators.minLength(6)]],
    enabled: [true],
    rolId: ['', [Validators.required, Validators.min(1)]]
  });

  usuariosFiltrados = computed(() => {
    const texto = this.busqueda();
    return this.usuarios().filter(usuario =>
      `${usuario.username} ${usuario.name ?? ''} ${usuario.rolId} ${usuario.enabled ? 'activo' : 'inactivo'}`
        .toLowerCase().includes(texto)
    );
  });

  constructor() {
    this.cargarUsuarios();
    this.cargarRoles();
  }

  cargarUsuarios(): void {
    this.usuarioService.findAll().subscribe({
      next: data => { this.usuarioService.setUsuariosChange(data); this.errorCarga.set(''); },
      error: (error: unknown) => {
        console.error('Error al cargar usuarios:', error);
        this.errorCarga.set('No se pudieron cargar los usuarios.');
      }
    });
  }

  cargarRoles(): void {
    this.rolService.findAll().subscribe({
      next: data => this.rolService.setRolesChange(data),
      error: (error: unknown) => {
        console.error('Error al cargar roles para usuarios:', error);
        this.errorCarga.set('No se pudieron cargar los roles para el formulario.');
      }
    });
  }

  buscar(valor: string): void { this.busqueda.set(valor.trim().toLowerCase()); }

  nuevo(): void {
    this.editandoId.set(null);
    this.form.reset({ username: '', password: '', enabled: true, rolId: '' });
    this.form.controls.password.setValidators([Validators.required, Validators.minLength(6)]);
    this.form.controls.password.updateValueAndValidity();
    this.mensajeError.set('');
    this.modalAbierto.set(true);
  }

  editar(usuario: Usuario): void {
    this.editandoId.set(usuario.idUser);
    this.form.reset({
      username: usuario.username,
      password: '',
      enabled: usuario.enabled,
      rolId: String(usuario.rolId)
    });
    this.form.controls.password.clearValidators();
    this.form.controls.password.setValidators([Validators.minLength(6)]);
    this.form.controls.password.updateValueAndValidity();
    this.mensajeError.set('');
    this.modalAbierto.set(true);
  }

  guardar(): void {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const value = this.form.getRawValue();
    const data: { username: string; password?: string; enabled: boolean; rolId: number } = {
      username: value.username,
      enabled: value.enabled,
      rolId: Number(value.rolId)
    };
    if (value.password) data.password = value.password;

    const id = this.editandoId();
    this.guardando.set(true);
    this.mensajeError.set('');
    const request = id === null
      ? this.usuarioService.create({ ...data, password: value.password })
      : this.usuarioService.update(id, data);
    request.subscribe({
      next: () => { this.guardando.set(false); this.modalAbierto.set(false); this.cargarUsuarios(); },
      error: (error: unknown) => {
        console.error('Error al guardar usuario:', error);
        this.guardando.set(false);
        this.mensajeError.set('No se pudo guardar el usuario. Verifica que el nombre y el rol sean válidos.');
      }
    });
  }

  eliminar(usuario: Usuario): void {
    if (!confirm(`¿Eliminar el usuario "${usuario.username}"?`)) return;
    this.usuarioService.delete(usuario.idUser).subscribe({
      next: () => this.cargarUsuarios(),
      error: (error: unknown) => {
        console.error('Error al eliminar usuario:', error);
        alert('No se pudo eliminar el usuario.');
      }
    });
  }

  cerrarModal(): void {
    this.modalAbierto.set(false);
    this.form.controls.password.clearValidators();
    this.form.controls.password.updateValueAndValidity();
  }

  campoInvalido(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && control.touched;
  }
}
