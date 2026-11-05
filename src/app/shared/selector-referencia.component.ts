import { Component, computed, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { OpcionReferencia } from '../services/referencias.service';
import { normalizar } from '../model/catalogo';
@Component({
  selector: 'app-selector-referencia',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectorReferenciaComponent),
      multi: true,
    },
  ],
  template: `<label
    >{{ etiqueta()
    }}<input
      type="search"
      [attr.aria-label]="'Buscar ' + etiqueta()"
      placeholder="Buscar por nombre…"
      [disabled]="deshabilitado()"
      [value]="busqueda()"
      (input)="busqueda.set($any($event.target).value)"
      (blur)="tocar()"
    /><select
      [attr.aria-label]="etiqueta()"
      [disabled]="deshabilitado()"
      [value]="valor()"
      (change)="elegir($any($event.target).value)"
      (blur)="tocar()"
    >
      <option value="">Selecciona una opción</option>
      @for (o of visibles(); track o.valor) {
        <option [value]="o.valor">{{ o.nombre }}</option>
      }
    </select></label
  >`,
  styles: [
    `
      label {
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
