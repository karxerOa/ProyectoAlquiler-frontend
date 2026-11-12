import {
  AfterViewInit,
  Directive,
  inject,
  OnDestroy,
  output,
  TemplateRef,
  ViewContainerRef,
} from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
@Directive({ selector: 'ng-template[appModal]', standalone: true })
export class ModalDirective implements AfterViewInit, OnDestroy {
  readonly closed = output<void>();
  private readonly template = inject(TemplateRef<unknown>);
  private readonly dialog = inject(MatDialog);
  private readonly container = inject(ViewContainerRef);
  private ref?: MatDialogRef<unknown>;
  private destroyed = false;
  ngAfterViewInit(): void {
    queueMicrotask(() => {
      if (this.destroyed) return;
      this.ref = this.dialog.open(this.template, {
        viewContainerRef: this.container,
        width: '680px',
        maxWidth: '96vw',
        maxHeight: '92dvh',
        autoFocus: 'first-tabbable',
        restoreFocus: true,
        panelClass: 'lucy-dialog',
        ariaLabel: 'Formulario de gestion',
      });
      this.ref.afterClosed().subscribe(() => {
        if (!this.destroyed) this.closed.emit();
      });
    });
  }
  ngOnDestroy(): void {
    this.destroyed = true;
    this.ref?.close();
  }
}
