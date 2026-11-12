import { Directive, inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
/** Presentation only: the API remains responsible for authorization. */
@Directive({
  selector: '[appSoloEscritura]',
  standalone: true,
  host: { '[style.display]': 'auth.canWrite() ? null : "none"' },
})
export class SoloEscrituraDirective {
  readonly auth = inject(AuthService);
}
