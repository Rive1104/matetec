// src/app/app.ts
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css' // Este archivo sigue vacío, está bien.
})
export class App {
  // Borramos la propiedad "title" de aquí.
}