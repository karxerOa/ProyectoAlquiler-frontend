import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-resumen',
  standalone: true,
  imports: [RouterLink],
  styleUrl: './resumen.component.css',
  templateUrl: './resumen.component.html',
})
export class ResumenComponent {}