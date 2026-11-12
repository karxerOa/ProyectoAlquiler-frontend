import { Component, computed, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { MATERIAL } from './material';
import { OpcionReferencia } from '../services/referencias.service';
import { normalizar } from '../model/catalogo';
@Component({
  selector: 'app-selector-referencia',
  standalone: true,
  imports: [...MATERIAL],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectorReferenciaComponent),
      multi: true,
    },
  ],
  template: `<div class="selector">
    <mat-form-field appearance="outline" subscriptSizing="dynamic"
      ><mat-label>Buscar {{ etiqueta() }}</mat-label
      ><input
        matInput
        type="search"
        [disabled]="deshabilitado()"
        [value]="busqueda()"
        (input)="busqueda.set($any($event.target).value)"
        (blur)="tocar()" /></mat-form-field
    ><mat-form-field appearance="outline" subscriptSizing="dynamic"
      ><mat-label>{{ etiqueta() }}</mat-label
      ><mat-select
        [disabled]="deshabilitado()"
        [value]="valor()"
        (selectionChange)="elegir($event.value)"
        (closed)="tocar()"
        ><mat-option value="">Selecciona una opción</mat-option>
        @for (o of visibles(); track o.valor) {
          <mat-option [value]="'' + o.valor">{{ o.nombre }}</mat-option>
        }
      </mat-select></mat-form-field
    >
  </div>`,
  styles: [
    `
      .selector {
        display: grid;
        gap: 8px;
        font-size: 12px;
      }
      input,
      select {
        padding: 10px;
        border: 1px solid var(--line);
        border-radius: 7px;
        background: white;
        width: 100%;
        font: inherit;
        color: var(--ink);
      }
    `,
  ],
})
export class SelectorReferenciaComponent implements ControlValueAccessor {
  readonly etiqueta = input('Registro');
  readonly opciones = input<OpcionReferencia[]>([]);
  readonly valor = signal('');
  readonly busqueda = signal('');
  readonly deshabilitado = signal(false);
  readonly visibles = computed(() =>
    this.opciones().filter(
      (o) =>
        String(o.valor) === this.valor() ||
        normalizar(o.nombre).includes(normalizar(this.busqueda())),
    ),
  );
  private cambiar: (v: string) => void = () => {};
  tocar: () => void = () => {};
  elegir(v: string) {
    this.valor.set(v);
    this.cambiar(v);
    this.tocar();
  }
  writeValue(v: unknown) {
    this.valor.set(v == null ? '' : String(v));
    this.busqueda.set('');
  }
  registerOnChange(fn: (v: string) => void) {
    this.cambiar = fn;
  }
  registerOnTouched(fn: () => void) {
    this.tocar = fn;
  }
  setDisabledState(v: boolean) {
    this.deshabilitado.set(v);
  }
}
