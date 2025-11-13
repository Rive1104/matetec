import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { datosStore } from '../../datos.usuario';

// (Definición de 'Player' y 'Operand'...)
type Player = {
    id: number;
    name: string;
    age: number;
    sexo: string;
};
type Operand = {
  value: number;
  id: number;
  isDropped: boolean;
};

//@Component({
//  selector: 'app-game',
//  standalone: true,
//  imports: [RouterLink, CommonModule],
//  templateUrl: './game.component.html',
//  styleUrls: ['./game.component.css']
//})

@Component({
  selector:'app-game',
  standalone: true,
  imports:[RouterLink, CommonModule],
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})

export class GameComponent implements OnInit, OnDestroy {
  
  // Datos del jugador y nivel
  player: Player | undefined;
  level = 1;
  levelDescription = '';
  // <-- MODIFICADO: Añadimos el signo de multiplicación (×) -->
  currentOperation: '+' | '-' | '×' = '+'; 

  // Estado del juego
  operands: Operand[] = [];
  targetResult = 0;
  droppedValues: Operand[] = [];
  gameState: 'playing' | 'win' | 'lose' = 'playing';
  gameMessage = '';

  // Temporizador
  timeLeft = 30;
  timerInterval: any;

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    // Cargar jugador
    const idFromRoute = this.route.snapshot.paramMap.get('id');
    if (idFromRoute) {
      const playerId = +idFromRoute; 
      this.player = datosStore.getUserById(playerId);
    }
    this.startLevel();
  }

  ngOnDestroy(): void {
    clearInterval(this.timerInterval);
  }

  startLevel(): void {
    // 1. Resetear estado
    this.gameState = 'playing';
    this.gameMessage = '';
    this.droppedValues = [];
    this.timeLeft = 30;
    this.operands = [];

    // --- Asignar operación y descripción ---
    if (this.level <= 2) {
      this.levelDescription = 'Suma';
      this.currentOperation = '+';
    } else if (this.level <= 4) {
      this.levelDescription = 'Resta';
      this.currentOperation = '-';
    } else if (this.level <= 6) { // <-- MODIFICADO: Niveles 5 y 6
      this.levelDescription = 'Multiplicación';
      this.currentOperation = '×'; // Usamos el símbolo 'times'
    } else {
      this.levelDescription = 'Próximamente';
    }

    // Lógica de generación basada en el nivel
    switch (this.level) {
      case 1: // Nivel 1: Suma (3 op, 1 par)
      {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        this.targetResult = num1 + num2;
        let distractor = Math.floor(Math.random() * 10) + 1;
        while (distractor + num1 === this.targetResult || distractor + num2 === this.targetResult || distractor === num1 || distractor === num2) {
          distractor = Math.floor(Math.random() * 10) + 1;
        }
        const tempOperands = [
          { value: num1, id: 1, isDropped: false },
          { value: num2, id: 2, isDropped: false },
          { value: distractor, id: 3, isDropped: false }
        ];
        this.operands = this.shuffleArray(tempOperands);
        break;
      }
      
      case 2: // Nivel 2: Suma (4 op, 2 pares)
      {
        const target = Math.floor(Math.random() * 11) + 10; // 10-20
        this.targetResult = target;
        const num1 = Math.floor(Math.random() * (target - 1)) + 1;
        const num2 = target - num1;
        let num3 = Math.floor(Math.random() * (target - 1)) + 1;
        while (num3 === num1 || num3 === num2) {
          num3 = Math.floor(Math.random() * (target - 1)) + 1;
        }
        const num4 = target - num3;
        const tempOperands = [
          { value: num1, id: 1, isDropped: false },
          { value: num2, id: 2, isDropped: false },
          { value: num3, id: 3, isDropped: false },
          { value: num4, id: 4, isDropped: false }
        ];
        this.operands = this.shuffleArray(tempOperands);
        break;
      }

      case 3: // Nivel 3: Resta (3 op, 1 par)
      {
        const num1 = Math.floor(Math.random() * 10) + 5; // 5-14
        const num2 = Math.floor(Math.random() * (num1 - 1)) + 1;
        this.targetResult = num1 - num2;
        let distractor = Math.floor(Math.random() * 10) + 1;
        while (distractor === num1 || distractor === num2 || Math.abs(distractor - num1) === this.targetResult || Math.abs(distractor - num2) === this.targetResult) {
          distractor = Math.floor(Math.random() * 10) + 1;
        }
        const tempOperands = [
          { value: num1, id: 1, isDropped: false },
          { value: num2, id: 2, isDropped: false },
          { value: distractor, id: 3, isDropped: false }
        ];
        this.operands = this.shuffleArray(tempOperands);
        break;
      }

      case 4: // Nivel 4: Resta (4 op, 2 pares)
      {
        const target = Math.floor(Math.random() * 5) + 3; // 3-7
        this.targetResult = target;
        const num1 = Math.floor(Math.random() * 10) + target + 1;
        const num2 = num1 - target;
        let num3 = Math.floor(Math.random() * 10) + target + 1;
        while (num3 === num1 || num3 === num2) {
          num3 = Math.floor(Math.random() * 10) + target + 1;
        }
        const num4 = num3 - target;
        const tempOperands = [
          { value: num1, id: 1, isDropped: false },
          { value: num2, id: 2, isDropped: false },
          { value: num3, id: 3, isDropped: false },
          { value: num4, id: 4, isDropped: false }
        ];
        this.operands = this.shuffleArray(tempOperands);
        break;
      }

      // --- NUEVO: Nivel 5 ---
      case 5: // Nivel 5: Multiplicación (4 op, 1 par)
      {
        // 2. Generar el problema
        const num1 = Math.floor(Math.random() * 4) + 2; // 2 a 5
        const num2 = Math.floor(Math.random() * 4) + 2; // 2 a 5
        this.targetResult = num1 * num2; // ej. 4 * 3 = 12

        // Generar dos distractores
        let distractor1 = Math.floor(Math.random() * 5) + 1; // 1 a 5
        while (distractor1 === num1 || distractor1 === num2) {
          distractor1 = Math.floor(Math.random() * 5) + 1;
        }
        let distractor2 = Math.floor(Math.random() * 5) + 1;
        while (distractor2 === num1 || distractor2 === num2 || distractor2 === distractor1) {
          distractor2 = Math.floor(Math.random() * 5) + 1;
        }
        
        // 3. Crear y mezclar
        const tempOperands = [
          { value: num1, id: 1, isDropped: false },
          { value: num2, id: 2, isDropped: false },
          { value: distractor1, id: 3, isDropped: false },
          { value: distractor2, id: 4, isDropped: false }
        ];
        this.operands = this.shuffleArray(tempOperands);
        break; // Fin del case 5
      }

      // --- NUEVO: Nivel 6 ---
      case 6: // Nivel 6: Multiplicación (4 op, 2 pares)
      {
        // 2. Generar el problema (Usamos un resultado fijo con 2 pares, ej. 12)
        this.targetResult = 12;
        
        // Pares: (2, 6) y (3, 4)
        
        // 3. Crear y mezclar
        const tempOperands = [
          { value: 2, id: 1, isDropped: false },
          { value: 6, id: 2, isDropped: false },
          { value: 3, id: 3, isDropped: false },
          { value: 4, id: 4, isDropped: false }
        ];
        this.operands = this.shuffleArray(tempOperands);
        break; // Fin del case 6
      }

      default:
        // Nivel 7+ (por ahora, que repita el Nivel 6)
        if (this.level > 10) {
          this.gameMessage = "¡Juego Completado!";
          this.gameState = 'win';
          clearInterval(this.timerInterval);
          setTimeout(() => { this.level = 1; this.startLevel(); }, 2000);
          return;
        }
        this.level = 6;
        this.startLevel();
        return;
    }

    // 4. Iniciar temporizador
    this.startTimer();
  }

  startTimer(): void {
    clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      this.timeLeft--;
      if (this.timeLeft <= 0) {
        this.endGame('lose_time');
      }
    }, 1000);
  }

  // --- Lógica de Arrastrar y Soltar ---
  onDragStart(event: DragEvent, operand: Operand): void {
    if (operand.isDropped || this.gameState !== 'playing') {
      event.preventDefault();
      return;
    }
    event.dataTransfer?.setData('text/plain', operand.id.toString());
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault(); 
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    if (this.gameState !== 'playing') return;

    const operandId = Number(event.dataTransfer?.getData('text/plain'));
    const operand = this.operands.find(op => op.id === operandId);

    if (operand && !operand.isDropped) {
      operand.isDropped = true;
      this.droppedValues.push(operand);
    }

    if (this.droppedValues.length === 2) {
      this.checkResult();
    }
  }

  // --- Lógica del Juego ---
  checkResult(): void {
    const val1 = this.droppedValues[0].value;
    const val2 = this.droppedValues[1].value;
    let result = 0;

    // <-- MODIFICADO: Añadimos el caso de '×' -->
    if (this.currentOperation === '+') {
      result = val1 + val2;
    } else if (this.currentOperation === '-') {
      result = Math.abs(val1 - val2);
    } else if (this.currentOperation === '×') {
      result = val1 * val2;
    }

    if (result === this.targetResult) {
      this.endGame('win');
    } else {
      this.endGame('lose_wrong');
    }
  }

  endGame(result: 'win' | 'lose_time' | 'lose_wrong'): void {
    clearInterval(this.timerInterval);
    
    if (result === 'win') {
      this.gameState = 'win';
      this.gameMessage = '¡CORRECTO!';
    } else if (result === 'lose_wrong') {
      this.gameState = 'lose';
      this.gameMessage = '¡Resultado incorrecto!';
    } else if (result === 'lose_time') {
      this.gameState = 'lose';
      this.gameMessage = '¡Se acabó el tiempo!';
    }

    // Pasar al siguiente nivel
    setTimeout(() => {
      this.level++;
      this.startLevel(); 
    }, 2000);
  }

  // Función para mezclar
  shuffleArray(array: any[]): any[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }
}