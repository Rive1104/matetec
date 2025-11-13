// matetec/src/app/app.routes.ts

import { Routes } from '@angular/router';
// Importamos los componentes
import { HomeComponent } from './home/home.component';
import { GameComponent } from './game/game.component';
import { ScoresComponent } from './scores/scores.component';
// <-- 1. IMPORTAR el nuevo componente de registro -->
import { PlayerRegistrationComponent } from './player-registration/player-registration.component';

export const routes: Routes = [
  // Ruta por defecto (inicio)
  { path: '', component: HomeComponent },

  // <-- 2. AÑADIR la nueva ruta de registro -->
  { path: 'registro', component: PlayerRegistrationComponent },

  // <-- 3. MODIFICAR la ruta del juego para que acepte el ID del jugador -->
  { path: 'juego/:id', component: GameComponent },

  // Ruta para las puntuaciones
  { path: 'puntuaciones', component: ScoresComponent },
  
  // Redirige cualquier ruta desconocida al inicio
  { path: '**', redirectTo: '' }
];