import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

@Component({
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  selector: 'app-layout',
  standalone: true,
  styleUrl: './layout.component.css',
  templateUrl: './layout.component.html',
})
export class LayoutComponent {
  protected readonly navigation = [
    { label: 'Clientes', path: '/clientes' },
    { label: 'Empleados', path: '/empleados' },
  ];
}
