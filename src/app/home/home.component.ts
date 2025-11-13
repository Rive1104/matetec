import { Component } from '@angular/core';
import { RouterLink } from '@angular/router'; // Importamos RouterLink para los botones

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink], // Añadimos RouterLink a las importaciones
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {

  // Función para el botón "Salir"
  salir(): void {
    // Cierra la pestaña actual del navegador
    // Nota: Por seguridad, los navegadores modernos pueden bloquear esto
    // si la pestaña no fue abierta por un script.
    window.close();
  }
}