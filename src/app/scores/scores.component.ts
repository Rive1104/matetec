import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-scores',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div style="padding: 20px;">
      <h1>Página de Puntuaciones</h1>
      <p>Aquí se mostrarán los puntajes.</p>
      <a routerLink="/">Volver al inicio</a>
    </div>
  `
})
export class ScoresComponent { }