import { Component, inject, Injectable } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
@Component({
  selector: 'app-confirmacion',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule],
  template: `<h2 mat-dialog-title>Confirmar acción</h2>
    <mat-dialog-content>{{ message }}</mat-dialog-content
    ><mat-dialog-actions align="end"
      ><button mat-button [mat-dialog-close]="false">Cancelar</button
      ><button mat-flat-button [mat-dialog-close]="true">Confirmar</button></mat-dialog-actions
    >`,
})
export class ConfirmacionComponent {
  readonly message = inject<string>(MAT_DIALOG_DATA);
}
@Injectable({ providedIn: 'root' })
export class UiService {
  private readonly dialog = inject(MatDialog);
  private readonly snack = inject(MatSnackBar);
  async confirm(message: string): Promise<boolean> {
    return (
      (await firstValueFrom(
        this.dialog
          .open(ConfirmacionComponent, {
            data: message,
            width: '420px',
            autoFocus: 'first-tabbable',
          })
          .afterClosed(),
      )) === true
    );
  }
  notify(message: string): void {
    this.snack.open(message, 'Cerrar', { duration: 6000 });
  }
}
