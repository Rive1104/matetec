import { Component, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router'; // Importamos Router
import { CommonModule } from '@angular/common'; // Importamos CommonModule para *ngIf y *ngFor
import { datosStore, Player } from '../../datos.usuario'; // Importamos el store y el tipo Player

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, CommonModule], // Añadimos CommonModule
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit {

  showRetryList: boolean = false;
  playerList: Player[] = [];

  constructor(private router: Router) {}

  ngOnInit(): void {
    // Cargamos los datos por si acaso no están en memoria
    datosStore.loadInitialData();
  }

  toggleRetryList(): void {
    this.showRetryList = !this.showRetryList;
    
    if (this.showRetryList) {
        // Cargamos la lista de jugadores y la ordenamos por puntuación
        // Filtramos para mostrar solo los que tienen puntuación, o todos si prefieres.
        // Aquí mostramos todos los registrados para que cualquiera pueda reintentar.
        this.playerList = datosStore.getUsers().sort((a, b) => (b.puntuacion || 0) - (a.puntuacion || 0));
    }
  }

  retryGame(playerId: number): void {
      // Navegamos al juego con el ID seleccionado
      this.router.navigate(['/juego', playerId]);
  }

  salir(): void {
    window.close();
  }
}