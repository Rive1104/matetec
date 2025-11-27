import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { datosStore } from '../../datos.usuario';

@Component({
  selector: 'app-scores',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './scores.component.html',
  styleUrls: ['./scores.component.css']
})
export class ScoresComponent implements OnInit {
  
  users: any[] = [];
  selectedUser: any = null;

  ngOnInit(): void {
    datosStore.loadInitialData();
    // Ordenar por puntuación descendente
    this.users = datosStore.getUsers()
      .filter(u => u.puntuacion !== undefined)
      .sort((a, b) => (b.puntuacion || 0) - (a.puntuacion || 0));
  }

  showDetails(user: any): void {
    this.selectedUser = user;
  }

  closeDetails(): void {
    this.selectedUser = null;
  }
}