import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { datosStore, Player } from '../../datos.usuario'; // Importamos Player y store

// Tipos locales para el juego
type Operand = {
  value: number;
  id: number;
  isDropped: boolean;
};

@Component({
  selector: 'app-game',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css']
})
export class GameComponent implements OnInit, OnDestroy {
  
  player: Player | undefined;
  level = 1;
  levelDescription = '';
  
  currentOperations: string[] = ['+']; 
  operands: Operand[] = [];
  targetResult = 0;
  droppedValues: (Operand | null)[] = [null, null]; 
  
  gameState: 'playing' | 'win' | 'lose' | 'finished' = 'playing';
  gameMessage = '';

  timeLeft = 30;
  maxTimeLevel = 30;
  timeSpentTotal = 0;
  timerInterval: any;
  
  levelsWon = 0;
  levelsLost = 0;
  finalScore = 0;
  isNewHighScore = false; // Nueva bandera para mostrar en el HTML si rompió récord

  constructor(private route: ActivatedRoute) {}

  ngOnInit(): void {
    const idFromRoute = this.route.snapshot.paramMap.get('id');
    if (idFromRoute) {
      const playerId = +idFromRoute; 
      // Importante: Obtenemos el jugador del store
      this.player = datosStore.getUserById(playerId);
    }
    this.startLevel();
  }

  ngOnDestroy(): void {
    clearInterval(this.timerInterval);
  }

  startLevel(): void {
    this.gameState = 'playing';
    this.gameMessage = '';
    this.operands = [];
    this.droppedValues.fill(null); // Limpiar slots
    
    // Configuración por Nivel
    if (this.level <= 2) {
      this.setupLevel('Suma', ['+'], 30, 2);
    } else if (this.level <= 4) {
      this.setupLevel('Resta', ['-'], 30, 2);
    } else if (this.level <= 6) {
      this.setupLevel('Multiplicación', ['×'], 30, 2);
    } else if (this.level <= 8) {
      this.setupLevel('División', ['÷'], 60, 2);
    } else {
      this.setupLevel('Operaciones Mixtas', [], 180, 3);
    }

    this.generateProblem();
    this.startTimer();
  }

  setupLevel(desc: string, ops: string[], time: number, slots: number) {
    this.levelDescription = desc;
    this.currentOperations = ops;
    this.timeLeft = time;
    this.maxTimeLevel = time;
    // Ajustar tamaño del array de slots si cambia (de 2 a 3)
    if (this.droppedValues.length !== slots) {
        this.droppedValues = new Array(slots).fill(null);
    }
  }

  generateProblem(): void {
    switch (this.level) {
      case 1: case 2: this.generateSimpleOp('+', this.level === 2 ? 4 : 3); break;
      case 3: case 4: this.generateSimpleOp('-', this.level === 4 ? 4 : 3); break;
      case 5: case 6: this.generateSimpleOp('×', 4); break;
      case 7: case 8: this.generateDivision(4); break;
      case 9: case 10: this.generateCombinedOp(5); break;
      default: this.finishGame(); return;
    }
  }

  generateSimpleOp(sign: string, numOperands: number) {
    let num1 = Math.floor(Math.random() * 10) + 2;
    let num2 = Math.floor(Math.random() * 10) + 2;
    
    if (sign === '+') this.targetResult = num1 + num2;
    if (sign === '-') {
      num1 = Math.floor(Math.random() * 15) + 5;
      num2 = Math.floor(Math.random() * (num1 - 1)) + 1;
      this.targetResult = num1 - num2;
    }
    if (sign === '×') this.targetResult = num1 * num2;

    this.fillOperands([num1, num2], numOperands);
  }

  generateDivision(numOperands: number) {
    const divisor = Math.floor(Math.random() * 9) + 2;
    const quotient = Math.floor(Math.random() * 9) + 2;
    const dividend = divisor * quotient;
    
    this.targetResult = quotient;
    this.fillOperands([dividend, divisor], numOperands);
  }

  generateCombinedOp(numOperands: number) {
    const ops = ['+', '-', '×'];
    const op1 = ops[Math.floor(Math.random() * ops.length)];
    const op2 = ops[Math.floor(Math.random() * ops.length)];
    this.currentOperations = [op1, op2];

    const n1 = Math.floor(Math.random() * 9) + 1;
    const n2 = Math.floor(Math.random() * 9) + 1;
    const n3 = Math.floor(Math.random() * 9) + 1;
    
    // Conversión segura para cálculo
    const safeOp1 = op1 === '×' ? '*' : op1;
    const safeOp2 = op2 === '×' ? '*' : op2;
    
    // eslint-disable-next-line no-eval
    let res = eval(`${n1} ${safeOp1} ${n2} ${safeOp2} ${n3}`);
    
    if (!Number.isInteger(res) || res < 0) {
      this.generateCombinedOp(numOperands);
      return;
    }

    this.targetResult = res;
    this.fillOperands([n1, n2, n3], numOperands);
  }

  fillOperands(correctValues: number[], total: number) {
    let list = correctValues.map((v, i) => ({ value: v, id: i, isDropped: false }));
    while (list.length < total) {
      const dist = Math.floor(Math.random() * 20) + 1;
      if (!list.find(x => x.value === dist)) {
        list.push({ value: dist, id: list.length, isDropped: false });
      }
    }
    this.operands = this.shuffleArray(list);
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

  onDragStart(event: DragEvent, operand: Operand): void {
    if (operand.isDropped || this.gameState !== 'playing') return;
    event.dataTransfer?.setData('text/plain', operand.id.toString());
  }
  
  onDragOver(event: DragEvent): void {
    event.preventDefault();
  }

  onDrop(event: DragEvent, slotIndex: number): void {
    event.preventDefault();
    if (this.gameState !== 'playing') return;
    if (this.droppedValues[slotIndex] !== null) return;

    const opId = Number(event.dataTransfer?.getData('text/plain'));
    const op = this.operands.find(o => o.id === opId);

    if (op && !op.isDropped) {
      op.isDropped = true;
      this.droppedValues[slotIndex] = op;
    }

    if (!this.droppedValues.includes(null)) {
      this.checkResult();
    }
  }

  checkResult(): void {
    const values = this.droppedValues.map(v => v!.value);
    let result = 0;

    if (this.level <= 8) {
      const v1 = values[0];
      const v2 = values[1];
      const op = this.currentOperations[0];
      if (op === '+') result = v1 + v2;
      else if (op === '-') result = Math.abs(v1 - v2);
      else if (op === '×') result = v1 * v2;
      else if (op === '÷') result = v1 / v2;
    } else {
      const v1 = values[0];
      const v2 = values[1];
      const v3 = values[2];
      const op1 = this.currentOperations[0] === '×' ? '*' : this.currentOperations[0];
      const op2 = this.currentOperations[1] === '×' ? '*' : this.currentOperations[1];
      // eslint-disable-next-line no-eval
      result = eval(`${v1} ${op1} ${v2} ${op2} ${v3}`);
    }

    if (result === this.targetResult) {
      this.endGame('win');
    } else {
      this.endGame('lose_wrong');
    }
  }

  endGame(result: 'win' | 'lose_time' | 'lose_wrong'): void {
    clearInterval(this.timerInterval);
    const timeSpent = this.maxTimeLevel - this.timeLeft;
    this.timeSpentTotal += timeSpent;

    if (result === 'win') {
      this.levelsWon++;
      this.gameState = 'win';
      this.gameMessage = '¡CORRECTO!';
    } else {
      this.levelsLost++;
      this.gameState = 'lose';
      this.gameMessage = result === 'lose_time' ? '¡Tiempo Agotado!' : '¡Incorrecto!';
    }

    setTimeout(() => {
      this.level++;
      if (this.level > 10) {
        this.finishGame();
      } else {
        this.startLevel();
      }
    }, 2000);
  }

  finishGame(): void {
    this.gameState = 'finished';
    const totalTimeLimit = (30 * 6) + (60 * 2) + (180 * 2); 
    const timeBonus = Math.max(0, (totalTimeLimit - this.timeSpentTotal) * 5);
    this.finalScore = (this.levelsWon * 1000) + timeBonus;

    // --- LÓGICA DE ACTUALIZACIÓN DE PUNTUACIÓN ---
    if (this.player) {
      const previousHighScore = this.player.puntuacion || 0;
      
      // Solo actualizamos si la nueva puntuación es mayor
      if (this.finalScore > previousHighScore) {
          this.player.puntuacion = this.finalScore;
          datosStore.updateUser(this.player);
          this.isNewHighScore = true;
      } else {
          this.isNewHighScore = false;
      }
    }
  }

  shuffleArray(array: any[]): any[] {
    return array.sort(() => Math.random() - 0.5);
  }
}