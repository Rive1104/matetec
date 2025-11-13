// matetec/src/app/player-registration/player-registration.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
// Importamos los módulos de formularios reactivos
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { datosStore } from '../../datos.usuario'; // Importamos el store

@Component({
  selector: 'app-player-registration',
  standalone: true,
  // Asegúrate de importar ReactiveFormsModule y CommonModule
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './player-registration.component.html',
  styleUrl: './player-registration.component.css'
})
export class PlayerRegistrationComponent {

  // Inyectamos el Router para la navegación
  constructor(private router: Router) { } 

  // Definimos el formulario con los campos requeridos
  playerForm = new FormGroup({
    name: new FormControl('', Validators.required),
    age: new FormControl<number | null>(null, [Validators.required, Validators.min(5)]), // Edad mínima 5 años
    sexo: new FormControl('', Validators.required), // <-- CAMBIO: de 'email' a 'sexo'
  });

  submitPlayer(): void {
    if (this.playerForm.invalid) {
      this.playerForm.markAllAsTouched();
      return;
    }
    
    // Creamos el objeto del jugador (asegurándonos de que no es nulo)
    const playerData = {
        name: this.playerForm.value.name!,
        age: this.playerForm.value.age!,
        sexo: this.playerForm.value.sexo!
    };

    // Llama al método del store para agregar el jugador
    // (Modificaremos 'datosStore' para que 'addUser' devuelva el nuevo jugador)
    const newPlayer = datosStore.addUser(playerData);
    
    // Navega a la página del juego, pasando el ID del nuevo jugador
    this.router.navigate(['/juego', newPlayer.id]); 
  }
}