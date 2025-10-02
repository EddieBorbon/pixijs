import { Container, Graphics } from 'pixi.js';
import { Gem } from './Gem';
import { 
  GemColor, 
  SpecialType, 
  BOARD_CONFIG, 
  ANIMATION_CONFIG, 
  SCORE_CONFIG,
  GAME_EVENTS,
  GAME_CONFIG,
  Position,
  Match
} from './constants';
import { EventEmitter } from '../core/EventEmitter';
import { AudioService } from '../services/AudioService';

/**
 * Tablero principal del juego Match-3.
 * Maneja toda la lógica del juego incluyendo swaps, matches, cascadas y relleno.
 */
export class Board extends Container {
  private gems: (Gem | null)[][];
  private selectedGem: Gem | null = null;
  private isProcessing: boolean = false;
  private score: number = 0;
  private moves: number = GAME_CONFIG.INITIAL_MOVES;
  private eventEmitter: EventEmitter;
  private audioService: AudioService;
  private currentCellSize: number = BOARD_CONFIG.CELL_SIZE;
  private currentGemSize: number = BOARD_CONFIG.GEM_SIZE;

  constructor(eventEmitter: EventEmitter) {
    super();
    this.eventEmitter = eventEmitter;
    this.audioService = AudioService.getInstance();
    this.gems = this.initializeBoard();
    this.setupEventListeners();
    this.addInitialGemsToContainer();
    
    // Hacer el tablero interactivo (nueva sintaxis de PixiJS v7+)
    this.eventMode = 'static';
    this.interactiveChildren = true;
  }

  /**
   * Inicializa el tablero con gemas aleatorias
   * @returns Matriz 2D de gemas inicializada
   */
  private initializeBoard(): (Gem | null)[][] {
    const board: (Gem | null)[][] = [];
    
    for (let row = 0; row < BOARD_CONFIG.ROWS; row++) {
      board[row] = [];
      for (let col = 0; col < BOARD_CONFIG.COLUMNS; col++) {
        board[row][col] = this.createRandomGem({ row, col });
      }
    }
    
    // Agregar algunas gemas especiales de prueba para mostrar todos los tipos
    this.addTestSpecialGems(board);
    
    // Asegurar que no hay matches iniciales
    this.removeInitialMatches(board);
    
    return board;
  }

  /**
   * Crea una gema aleatoria en la posición especificada
   * @param position - Posición donde crear la gema
   * @returns Nueva gema aleatoria
   */
  private createRandomGem(position: Position): Gem {
    const colors = Object.values(GemColor);
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    const gem = new Gem(randomColor, position);
    
    // Aplicar la configuración actual de tamaño
    gem.updateConfig(this.currentCellSize, this.currentGemSize);
    
    return gem;
  }

  /**
   * Agrega gemas especiales de prueba para mostrar todos los tipos
   * @param board - Tablero donde agregar las gemas especiales
   */
  private addTestSpecialGems(board: (Gem | null)[][]): void {
    // Color bomb en la esquina superior izquierda
    board[0][0] = new Gem(GemColor.YELLOW, { row: 0, col: 0 }, SpecialType.COLOR_BOMB);
    board[0][0].updateConfig(this.currentCellSize, this.currentGemSize);
    
    // Gema rayada horizontal en posición (1,1)
    board[1][1] = new Gem(GemColor.BLUE, { row: 1, col: 1 }, SpecialType.STRIPED_HORIZONTAL);
    board[1][1].updateConfig(this.currentCellSize, this.currentGemSize);
    
    // Gema rayada vertical en posición (2,2)
    board[2][2] = new Gem(GemColor.RED, { row: 2, col: 2 }, SpecialType.STRIPED_VERTICAL);
    board[2][2].updateConfig(this.currentCellSize, this.currentGemSize);
    
    // Gema envuelta en posición (3,3)
    board[3][3] = new Gem(GemColor.GREEN, { row: 3, col: 3 }, SpecialType.WRAPPED);
    board[3][3].updateConfig(this.currentCellSize, this.currentGemSize);
    
    // Más gemas especiales para mostrar variedad
    board[4][4] = new Gem(GemColor.PURPLE, { row: 4, col: 4 }, SpecialType.STRIPED_HORIZONTAL);
    board[4][4].updateConfig(this.currentCellSize, this.currentGemSize);
    
    board[5][5] = new Gem(GemColor.YELLOW, { row: 5, col: 5 }, SpecialType.WRAPPED);
    board[5][5].updateConfig(this.currentCellSize, this.currentGemSize);
    
    // Agregar obstáculos de prueba
    // Bloque derretible en posición (6,1)
    board[6][1] = new Gem(GemColor.YELLOW, { row: 6, col: 1 }, SpecialType.NORMAL, ObstacleType.MELTING_BLOCK);
    board[6][1].updateConfig(this.currentCellSize, this.currentGemSize);
    
    // Galleta en posición (6,3)
    board[6][3] = new Gem(GemColor.YELLOW, { row: 6, col: 3 }, SpecialType.NORMAL, ObstacleType.COOKIE);
    board[6][3].updateConfig(this.currentCellSize, this.currentGemSize);
    
    // Bomba en posición (7,5)
    board[7][5] = new Gem(GemColor.YELLOW, { row: 7, col: 5 }, SpecialType.NORMAL, ObstacleType.BOMB);
    board[7][5].updateConfig(this.currentCellSize, this.currentGemSize);
  }

  /**
   * Elimina cualquier match inicial en el tablero
   * @param board - Tablero a limpiar
   */
  private removeInitialMatches(board: (Gem | null)[][]): void {
    let hasMatches = true;
    while (hasMatches) {
      const matches = this.findMatchesInBoard(board);
      if (matches.length === 0) {
        hasMatches = false;
      } else {
        matches.forEach(match => {
          match.positions.forEach(pos => {
            board[pos.row][pos.col] = this.createRandomGem(pos);
          });
        });
      }
    }
  }

  /**
   * Configura los listeners de eventos
   */
  private setupEventListeners(): void {
    // Los eventos de gemas se manejan directamente en cada gema
    // No necesitamos listeners adicionales aquí
  }

  /**
   * Agrega todas las gemas iniciales al contenedor
   */
  private addInitialGemsToContainer(): void {
    // Crear fondo del tablero
    this.createBoardBackground();
    
    // Agregar gemas y configurar eventos
    for (let row = 0; row < BOARD_CONFIG.ROWS; row++) {
      for (let col = 0; col < BOARD_CONFIG.COLUMNS; col++) {
        const gem = this.gems[row][col];
        if (gem) {
          this.addChild(gem.sprite);
          this.setupGemEvents(gem);
        }
      }
    }
  }

  /**
   * Configura los eventos de clic para una gema
   * @param gem - Gema a configurar
   */
  private setupGemEvents(gem: Gem): void {
    gem.sprite.on('pointerdown', () => {
      this.onGemClicked(gem);
    });
  }

  /**
   * Maneja el clic en una gema
   * @param gem - Gema clickeada
   */
  private onGemClicked(gem: Gem): void {
    if (this.isProcessing) return;
    
    if (this.selectedGem === null) {
      // Primera selección - sonido de selección
      this.audioService.playSoundEffect('select');
      this.selectedGem = gem;
      gem.setSelected(true);
      this.eventEmitter.emit(GAME_EVENTS.GEM_SELECTED, gem);
    } else if (this.selectedGem === gem) {
      // Deseleccionar la misma gema - sonido de toggle
      this.audioService.playSoundEffect('toggle');
      this.selectedGem.setSelected(false);
      this.selectedGem = null;
      this.eventEmitter.emit(GAME_EVENTS.GEM_DESELECTED, gem);
    } else if (this.selectedGem.isAdjacentTo(gem)) {
      // Intentar intercambio - sonido de switch
      this.audioService.playSoundEffect('switch');
      this.attemptSwap(this.selectedGem, gem);
    } else {
      // Seleccionar nueva gema - sonido de selección
      this.audioService.playSoundEffect('select');
      this.selectedGem.setSelected(false);
      this.selectedGem = gem;
      gem.setSelected(true);
      this.eventEmitter.emit(GAME_EVENTS.GEM_SELECTED, gem);
    }
  }

  /**
   * Crea el fondo visual del tablero
   */
  private createBoardBackground(): void {
    const graphics = new Graphics();
    
    // Fondo principal
    graphics.beginFill(0x34495e, 0.3);
    graphics.drawRoundedRect(0, 0, BOARD_CONFIG.COLUMNS * BOARD_CONFIG.CELL_SIZE, BOARD_CONFIG.ROWS * BOARD_CONFIG.CELL_SIZE, 10);
    graphics.endFill();
    
    // Líneas de la cuadrícula
    graphics.lineStyle(1, 0xffffff, 0.2);
    
    // Líneas verticales
    for (let col = 0; col <= BOARD_CONFIG.COLUMNS; col++) {
      const x = col * BOARD_CONFIG.CELL_SIZE;
      graphics.moveTo(x, 0);
      graphics.lineTo(x, BOARD_CONFIG.ROWS * BOARD_CONFIG.CELL_SIZE);
    }
    
    // Líneas horizontales
    for (let row = 0; row <= BOARD_CONFIG.ROWS; row++) {
      const y = row * BOARD_CONFIG.CELL_SIZE;
      graphics.moveTo(0, y);
      graphics.lineTo(BOARD_CONFIG.COLUMNS * BOARD_CONFIG.CELL_SIZE, y);
    }
    
    this.addChildAt(graphics, 0); // Agregar al fondo
  }


  /**
   * Intenta intercambiar dos gemas adyacentes
   * @param gem1 - Primera gema
   * @param gem2 - Segunda gema
   */
  private async attemptSwap(gem1: Gem, gem2: Gem): Promise<void> {
    if (this.isProcessing) return;
    
    this.isProcessing = true;
    this.eventEmitter.emit(GAME_EVENTS.SWAP_STARTED, { gem1, gem2 });
    
    // Realizar el intercambio con animación
    await this.swapGems(gem1, gem2);
    
    // Verificar si el intercambio crea matches
    const matches = this.findMatchesInBoard(this.gems);
    
    if (matches.length > 0) {
      // El intercambio es válido, procesar matches
      await this.processMatches(matches);
      this.moves--;
      this.eventEmitter.emit(GAME_EVENTS.MOVES_UPDATED, this.moves);
      
      if (this.moves <= 0) {
        // Reproducir sonido de fin de juego
        this.audioService.playSoundEffect('game_over');
        this.eventEmitter.emit(GAME_EVENTS.GAME_OVER);
      } else if (this.moves <= 5) {
        // Reproducir sonido de advertencia cuando quedan pocos movimientos
        this.audioService.playSoundEffect('alarm');
      }
    } else {
      // El intercambio no es válido, reproducir sonido de error
      this.audioService.playSoundEffect('wrong');
      await this.swapGems(gem1, gem2);
    }
    
    // Limpiar selección
    gem1.setSelected(false);
    gem2.setSelected(false);
    this.selectedGem = null;
    
    this.isProcessing = false;
    this.eventEmitter.emit(GAME_EVENTS.SWAP_COMPLETED);
  }

  /**
   * Intercambia dos gemas en el tablero con animación
   * @param gem1 - Primera gema
   * @param gem2 - Segunda gema
   */
  private async swapGems(gem1: Gem, gem2: Gem): Promise<void> {
    const pos1 = gem1.position;
    const pos2 = gem2.position;
    
    // Animar el movimiento de las gemas
    await Promise.all([
      this.animateGemToPosition(gem1, pos2),
      this.animateGemToPosition(gem2, pos1)
    ]);
    
    // Intercambiar en el array después de la animación
    this.gems[pos1.row][pos1.col] = gem2;
    this.gems[pos2.row][pos2.col] = gem1;
  }

  /**
   * Anima una gema hacia una nueva posición
   * @param gem - Gema a animar
   * @param newPosition - Nueva posición
   */
  private animateGemToPosition(gem: Gem, newPosition: Position): Promise<void> {
    return new Promise((resolve) => {
      // Verificar que el sprite existe antes de animar
      if (!gem.sprite || gem.sprite.destroyed) {
        resolve();
        return;
      }
      
      const startX = gem.sprite.x;
      const startY = gem.sprite.y;
      const endX = newPosition.col * BOARD_CONFIG.CELL_SIZE + BOARD_CONFIG.CELL_SIZE / 2;
      const endY = newPosition.row * BOARD_CONFIG.CELL_SIZE + BOARD_CONFIG.CELL_SIZE / 2;
      
      const duration = ANIMATION_CONFIG.SWAP_DURATION;
      const startTime = Date.now();
      
      const animate = () => {
        // Verificar que el sprite aún existe durante la animación
        if (!gem.sprite || gem.sprite.destroyed) {
          resolve();
          return;
        }
        
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Usar easing suave (ease-out)
        const easeProgress = 1 - Math.pow(1 - progress, 3);
        
        gem.sprite.x = startX + (endX - startX) * easeProgress;
        gem.sprite.y = startY + (endY - startY) * easeProgress;
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Actualizar la posición lógica
          gem.setPosition(newPosition);
          resolve();
        }
      };
      
      animate();
    });
  }

  /**
   * Procesa todos los matches encontrados
   * @param matches - Array de matches a procesar
   */
  private async processMatches(matches: Match[]): Promise<void> {
    // Reproducir sonido de match exitoso
    this.playMatchSound(matches);
    
    // Calcular puntuación
    let totalScore = 0;
    matches.forEach(match => {
      totalScore += this.calculateMatchScore(match);
    });
    
    this.score += totalScore;
    this.eventEmitter.emit(GAME_EVENTS.SCORE_UPDATED, this.score);
    
    // Crear gemas especiales si es necesario
    const specialGems = this.createSpecialGems(matches);
    this.eventEmitter.emit(GAME_EVENTS.SPECIAL_GEM_CREATED, specialGems);
    
    // Eliminar gemas matched
    await this.removeMatchedGems(matches);
    
    // Dañar obstáculos adyacentes a los matches
    await this.damageAdjacentObstacles(matches);
    
    // Procesar gemas especiales
    await this.processSpecialGems(specialGems);
    
    // Hacer caer las gemas
    await this.dropGems();
    
    // Rellenar espacios vacíos
    await this.refillBoard();
    
    // Verificar nuevos matches después del relleno
    const newMatches = this.findMatchesInBoard(this.gems);
    if (newMatches.length > 0) {
      await this.processMatches(newMatches);
    }
    
    this.eventEmitter.emit(GAME_EVENTS.MATCH_PROCESSED, matches);
  }

  /**
   * Reproduce el sonido apropiado según el tipo de match
   * @param matches - Matches encontrados
   */
  private playMatchSound(matches: Match[]): void {
    const totalMatches = matches.length;
    const hasSpecialMatch = matches.some(match => match.positions.length >= 4);
    
    if (hasSpecialMatch) {
      // Match especial (4+ gemas)
      this.audioService.playSoundEffect('match_special');
    } else if (totalMatches > 1) {
      // Múltiples matches
      this.audioService.playSoundEffect('good2');
    } else {
      // Match normal
      this.audioService.playSoundEffect('match_normal');
    }
  }

  /**
   * Encuentra todos los matches en el tablero actual
   * @param board - Tablero a analizar
   * @returns Array de matches encontrados
   */
  findMatchesInBoard(board: (Gem | null)[][]): Match[] {
    const matches: Match[] = [];
    const visited = new Set<string>();
    
    for (let row = 0; row < BOARD_CONFIG.ROWS; row++) {
      for (let col = 0; col < BOARD_CONFIG.COLUMNS; col++) {
        const gem = board[row][col];
        if (gem && !visited.has(`${row},${col}`)) {
          const match = this.findMatchFromPosition(board, row, col, visited);
          if (match && match.positions.length >= BOARD_CONFIG.MIN_MATCH_LENGTH) {
            matches.push(match);
          }
        }
      }
    }
    
    return matches;
  }

  /**
   * Encuentra un match comenzando desde una posición específica
   * @param board - Tablero a analizar
   * @param startRow - Fila de inicio
   * @param startCol - Columna de inicio
   * @param visited - Set de posiciones ya visitadas
   * @returns Match encontrado o null
   */
  private findMatchFromPosition(
    board: (Gem | null)[][],
    startRow: number,
    startCol: number,
    visited: Set<string>
  ): Match | null {
    const gem = board[startRow][startCol];
    if (!gem) return null;
    
    const match: Position[] = [];
    const color = gem.color;
    
    // Buscar matches horizontales
    const horizontalMatch = this.findHorizontalMatch(board, startRow, startCol, color);
    if (horizontalMatch.length >= BOARD_CONFIG.MIN_MATCH_LENGTH) {
      horizontalMatch.forEach(pos => {
        if (!visited.has(`${pos.row},${pos.col}`)) {
          match.push(pos);
          visited.add(`${pos.row},${pos.col}`);
        }
      });
    }
    
    // Buscar matches verticales
    const verticalMatch = this.findVerticalMatch(board, startRow, startCol, color);
    if (verticalMatch.length >= BOARD_CONFIG.MIN_MATCH_LENGTH) {
      verticalMatch.forEach(pos => {
        if (!visited.has(`${pos.row},${pos.col}`)) {
          match.push(pos);
          visited.add(`${pos.row},${pos.col}`);
        }
      });
    }
    
    return match.length >= BOARD_CONFIG.MIN_MATCH_LENGTH ? {
      positions: match,
      color: color
    } : null;
  }

  /**
   * Encuentra matches horizontales desde una posición
   */
  private findHorizontalMatch(
    board: (Gem | null)[][],
    row: number,
    col: number,
    color: GemColor
  ): Position[] {
    const match: Position[] = [];
    
    // Buscar hacia la izquierda
    for (let c = col; c >= 0; c--) {
      const gem = board[row][c];
      if (gem && gem.canMatchWith({ color } as Gem)) {
        match.push({ row, col: c });
      } else {
        break;
      }
    }
    
    // Buscar hacia la derecha
    for (let c = col + 1; c < BOARD_CONFIG.COLUMNS; c++) {
      const gem = board[row][c];
      if (gem && gem.canMatchWith({ color } as Gem)) {
        match.push({ row, col: c });
      } else {
        break;
      }
    }
    
    return match;
  }

  /**
   * Encuentra matches verticales desde una posición
   */
  private findVerticalMatch(
    board: (Gem | null)[][],
    row: number,
    col: number,
    color: GemColor
  ): Position[] {
    const match: Position[] = [];
    
    // Buscar hacia arriba
    for (let r = row; r >= 0; r--) {
      const gem = board[r][col];
      if (gem && gem.canMatchWith({ color } as Gem)) {
        match.push({ row: r, col });
      } else {
        break;
      }
    }
    
    // Buscar hacia abajo
    for (let r = row + 1; r < BOARD_CONFIG.ROWS; r++) {
      const gem = board[r][col];
      if (gem && gem.canMatchWith({ color } as Gem)) {
        match.push({ row: r, col });
      } else {
        break;
      }
    }
    
    return match;
  }

  /**
   * Calcula la puntuación de un match
   * @param match - Match a evaluar
   * @returns Puntuación del match
   */
  private calculateMatchScore(match: Match): number {
    const length = match.positions.length;
    let baseScore = 0;
    
    if (length === 3) baseScore = SCORE_CONFIG.MATCH_3;
    else if (length === 4) baseScore = SCORE_CONFIG.MATCH_4;
    else if (length >= 5) baseScore = SCORE_CONFIG.MATCH_5;
    
    return baseScore;
  }

  /**
   * Crea gemas especiales basándose en los matches
   * @param matches - Matches que crean gemas especiales
   * @returns Array de gemas especiales creadas
   */
  private createSpecialGems(matches: Match[]): Gem[] {
    const specialGems: Gem[] = [];
    
    matches.forEach(match => {
      if (match.positions.length === 4) {
        // Crear gema rayada
        const centerPos = match.positions[Math.floor(match.positions.length / 2)];
        const specialType = this.determineStripedDirection(match);
        const specialGem = new Gem(match.color, centerPos, specialType);
        specialGems.push(specialGem);
      } else if (match.positions.length >= 5) {
        // Crear bomba de color
        const centerPos = match.positions[Math.floor(match.positions.length / 2)];
        const specialGem = new Gem(match.color, centerPos, SpecialType.COLOR_BOMB);
        specialGems.push(specialGem);
      }
    });
    
    // Buscar patrones de L o T para crear gemas envueltas
    const wrappedGems = this.findWrappedPatterns(matches);
    specialGems.push(...wrappedGems);
    
    return specialGems;
  }

  /**
   * Determina la dirección de una gema rayada basándose en el match
   * @param match - Match que crea la gema rayada
   * @returns Tipo especial de gema rayada
   */
  private determineStripedDirection(match: Match): SpecialType {
    const firstPos = match.positions[0];
    const lastPos = match.positions[match.positions.length - 1];
    
    // Si todas las posiciones están en la misma fila, es horizontal
    if (firstPos.row === lastPos.row) {
      return SpecialType.STRIPED_HORIZONTAL;
    } else {
      return SpecialType.STRIPED_VERTICAL;
    }
  }

  /**
   * Busca patrones de L o T para crear gemas envueltas
   * @param matches - Matches existentes
   * @returns Array de gemas envueltas creadas
   */
  private findWrappedPatterns(matches: Match[]): Gem[] {
    const wrappedGems: Gem[] = [];
    
    // Agrupar matches por color
    const matchesByColor = new Map<GemColor, Match[]>();
    matches.forEach(match => {
      if (!matchesByColor.has(match.color)) {
        matchesByColor.set(match.color, []);
      }
      matchesByColor.get(match.color)!.push(match);
    });
    
    // Buscar patrones de L o T para cada color
    matchesByColor.forEach((colorMatches, color) => {
      if (colorMatches.length >= 2) {
        // Buscar intersecciones entre matches
        for (let i = 0; i < colorMatches.length; i++) {
          for (let j = i + 1; j < colorMatches.length; j++) {
            const intersection = this.findMatchIntersection(colorMatches[i], colorMatches[j]);
            if (intersection) {
              // Crear gema envuelta en la intersección
              const wrappedGem = new Gem(color, intersection, SpecialType.WRAPPED);
              wrappedGems.push(wrappedGem);
            }
          }
        }
      }
    });
    
    return wrappedGems;
  }

  /**
   * Encuentra la intersección entre dos matches
   * @param match1 - Primer match
   * @param match2 - Segundo match
   * @returns Posición de intersección o null si no hay intersección
   */
  private findMatchIntersection(match1: Match, match2: Match): Position | null {
    for (const pos1 of match1.positions) {
      for (const pos2 of match2.positions) {
        if (pos1.row === pos2.row && pos1.col === pos2.col) {
          return pos1;
        }
      }
    }
    return null;
  }

  /**
   * Elimina las gemas que forman matches con animación
   * @param matches - Matches a eliminar
   */
  private async removeMatchedGems(matches: Match[]): Promise<void> {
    const removePromises: Promise<void>[] = [];
    
    matches.forEach(match => {
      match.positions.forEach(pos => {
        const gem = this.gems[pos.row][pos.col];
        if (gem) {
          // Animar la eliminación de la gema
          const removePromise = this.animateGemRemoval(gem);
          removePromises.push(removePromise);
          
          this.gems[pos.row][pos.col] = null;
        }
      });
    });
    
    // Esperar a que todas las animaciones de eliminación terminen
    await Promise.all(removePromises);
  }

  /**
   * Daña obstáculos adyacentes a los matches
   * @param matches - Matches que causan el daño
   */
  private async damageAdjacentObstacles(matches: Match[]): Promise<void> {
    const damagedObstacles: Gem[] = [];
    
    matches.forEach(match => {
      match.positions.forEach(pos => {
        // Verificar las 4 direcciones adyacentes
        const directions = [
          { row: pos.row - 1, col: pos.col }, // Arriba
          { row: pos.row + 1, col: pos.col }, // Abajo
          { row: pos.row, col: pos.col - 1 }, // Izquierda
          { row: pos.row, col: pos.col + 1 }, // Derecha
        ];
        
        directions.forEach(adjPos => {
          // Verificar que la posición esté dentro del tablero
          if (adjPos.row >= 0 && adjPos.row < BOARD_CONFIG.ROWS &&
              adjPos.col >= 0 && adjPos.col < BOARD_CONFIG.COLUMNS) {
            
            const adjacentGem = this.gems[adjPos.row][adjPos.col];
            if (adjacentGem && adjacentGem.isObstacle()) {
              // Dañar el obstáculo
              adjacentGem.damageObstacle();
              damagedObstacles.push(adjacentGem);
            }
          }
        });
      });
    });
    
    // Animar el cambio de estado de los obstáculos dañados
    if (damagedObstacles.length > 0) {
      await this.animateObstacleDamage(damagedObstacles);
    }
  }

  /**
   * Anima el daño a obstáculos
   * @param obstacles - Obstáculos dañados
   */
  private async animateObstacleDamage(obstacles: Gem[]): Promise<void> {
    const damagePromises: Promise<void>[] = [];
    
    obstacles.forEach(obstacle => {
      const damagePromise = new Promise<void>((resolve) => {
        // Actualizar la textura inmediatamente
        obstacle.updateTexture();
        
        // Pequeña animación de "shake" para mostrar el daño
        const originalX = obstacle.sprite.x;
        const originalY = obstacle.sprite.y;
        const duration = 200;
        const startTime = Date.now();
        
        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          
          // Efecto de shake
          const shakeIntensity = 3 * (1 - progress);
          const shakeX = (Math.random() - 0.5) * shakeIntensity;
          const shakeY = (Math.random() - 0.5) * shakeIntensity;
          
          obstacle.sprite.x = originalX + shakeX;
          obstacle.sprite.y = originalY + shakeY;
          
          if (progress < 1) {
            requestAnimationFrame(animate);
          } else {
            // Restaurar posición original
            obstacle.sprite.x = originalX;
            obstacle.sprite.y = originalY;
            resolve();
          }
        };
        
        animate();
      });
      
      damagePromises.push(damagePromise);
    });
    
    await Promise.all(damagePromises);
  }

  /**
   * Anima la eliminación de una gema
   * @param gem - Gema a eliminar
   */
  private animateGemRemoval(gem: Gem): Promise<void> {
    return new Promise((resolve) => {
      const duration = ANIMATION_CONFIG.EXPLOSION_DURATION;
      const startTime = Date.now();
      const baseScale = gem.gemSize / 64; // Escalado base correcto
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Efecto de explosión: escalar hacia arriba y desvanecer
        const scaleProgress = 1 + progress * 0.5; // Crecer un 50%
        const alphaProgress = 1 - progress;
        
        // Aplicar el escalado base multiplicado por el efecto de explosión
        gem.sprite.scale.set(baseScale * scaleProgress);
        gem.sprite.alpha = alphaProgress;
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          gem.destroy();
          resolve();
        }
      };
      
      animate();
    });
  }

  /**
   * Procesa las gemas especiales activadas
   * @param specialGems - Gemas especiales a procesar
   */
  private async processSpecialGems(specialGems: Gem[]): Promise<void> {
    for (const gem of specialGems) {
      if (gem.isStriped()) {
        await this.processStripedGem(gem);
      } else if (gem.isColorBomb()) {
        await this.processColorBomb(gem);
      }
    }
  }

  /**
   * Procesa una gema rayada
   * @param gem - Gema rayada a procesar
   */
  private async processStripedGem(gem: Gem): Promise<void> {
    // Reproducir sonido especial para gema rayada
    this.audioService.playSoundEffect('ray');
    
    const positions: Position[] = [];
    
    if (gem.specialType === SpecialType.STRIPED_HORIZONTAL) {
      // Eliminar toda la fila
      for (let col = 0; col < BOARD_CONFIG.COLUMNS; col++) {
        positions.push({ row: gem.position.row, col });
      }
    } else {
      // Eliminar toda la columna
      for (let row = 0; row < BOARD_CONFIG.ROWS; row++) {
        positions.push({ row, col: gem.position.col });
      }
    }
    
    await this.removeGemsAtPositions(positions);
  }

  /**
   * Procesa una bomba de color
   * @param gem - Bomba de color a procesar
   */
  private async processColorBomb(gem: Gem): Promise<void> {
    // Reproducir sonido especial para bomba de color
    this.audioService.playSoundEffect('match_goo');
    
    // Eliminar todas las gemas del mismo color
    const positions: Position[] = [];
    
    for (let row = 0; row < BOARD_CONFIG.ROWS; row++) {
      for (let col = 0; col < BOARD_CONFIG.COLUMNS; col++) {
        const boardGem = this.gems[row][col];
        if (boardGem && boardGem.color === gem.color) {
          positions.push({ row, col });
        }
      }
    }
    
    await this.removeGemsAtPositions(positions);
  }

  /**
   * Elimina gemas en posiciones específicas
   * @param positions - Posiciones donde eliminar gemas
   */
  private async removeGemsAtPositions(positions: Position[]): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, ANIMATION_CONFIG.EXPLOSION_DURATION));
    
    positions.forEach(pos => {
      const gem = this.gems[pos.row][pos.col];
      if (gem) {
        gem.destroy();
        this.gems[pos.row][pos.col] = null;
      }
    });
  }

  /**
   * Hace caer las gemas para llenar espacios vacíos con animación
   */
  private async dropGems(): Promise<void> {
    const dropPromises: Promise<void>[] = [];
    
    for (let col = 0; col < BOARD_CONFIG.COLUMNS; col++) {
      let writeIndex = BOARD_CONFIG.ROWS - 1;
      
      for (let row = BOARD_CONFIG.ROWS - 1; row >= 0; row--) {
        const gem = this.gems[row][col];
        if (gem) {
          if (row !== writeIndex) {
            // Animar la caída de la gema
            const dropPromise = this.animateGemDrop(gem, { row: writeIndex, col });
            dropPromises.push(dropPromise);
            
            this.gems[writeIndex][col] = gem;
            this.gems[row][col] = null;
          }
          writeIndex--;
        }
      }
    }
    
    // Esperar a que todas las animaciones de caída terminen
    await Promise.all(dropPromises);
  }

  /**
   * Anima la caída de una gema
   * @param gem - Gema que cae
   * @param newPosition - Nueva posición
   */
  private animateGemDrop(gem: Gem, newPosition: Position): Promise<void> {
    return new Promise((resolve) => {
      const startY = gem.sprite.y;
      const endY = newPosition.row * BOARD_CONFIG.CELL_SIZE + BOARD_CONFIG.CELL_SIZE / 2;
      
      const duration = ANIMATION_CONFIG.FALL_DURATION;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Usar easing más natural para la caída
        const easeProgress = progress * progress;
        
        gem.sprite.y = startY + (endY - startY) * easeProgress;
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          gem.setPosition(newPosition);
          resolve();
        }
      };
      
      animate();
    });
  }

  /**
   * Rellena espacios vacíos con nuevas gemas con animación
   */
  private async refillBoard(): Promise<void> {
    const refillPromises: Promise<void>[] = [];
    
    for (let col = 0; col < BOARD_CONFIG.COLUMNS; col++) {
      for (let row = 0; row < BOARD_CONFIG.ROWS; row++) {
        if (this.gems[row][col] === null) {
          const newGem = this.createRandomGem({ row, col });
          this.gems[row][col] = newGem;
          this.addChild(newGem.sprite);
          
          // Configurar eventos para la nueva gema
          this.setupGemEvents(newGem);
          
          // Animar la aparición de la nueva gema
          const refillPromise = this.animateGemAppear(newGem);
          refillPromises.push(refillPromise);
        }
      }
    }
    
    // Esperar a que todas las animaciones de aparición terminen
    await Promise.all(refillPromises);
  }

  /**
   * Anima la aparición de una nueva gema
   * @param gem - Gema que aparece
   */
  private animateGemAppear(gem: Gem): Promise<void> {
    return new Promise((resolve) => {
      // Empezar con escala 0 y alpha 0
      const baseScale = gem.gemSize / 64; // Escalado base correcto
      gem.sprite.scale.set(0);
      gem.sprite.alpha = 0;
      
      const duration = ANIMATION_CONFIG.REFILL_DELAY;
      const startTime = Date.now();
      
      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing elástico para la aparición
        const easeProgress = 1 - Math.pow(1 - progress, 4);
        
        // Aplicar el escalado base multiplicado por el progreso de animación
        gem.sprite.scale.set(baseScale * easeProgress);
        gem.sprite.alpha = easeProgress;
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // Asegurar que el escalado final sea correcto
          gem.sprite.scale.set(baseScale);
          gem.sprite.alpha = 1;
          resolve();
        }
      };
      
      animate();
    });
  }

  /**
   * Obtiene la gema en una posición específica
   * @param position - Posición a consultar
   * @returns Gema en esa posición o null
   */
  getGemAt(position: Position): Gem | null {
    if (this.isValidPosition(position)) {
      return this.gems[position.row][position.col];
    }
    return null;
  }

  /**
   * Verifica si una posición es válida en el tablero
   * @param position - Posición a verificar
   * @returns true si la posición es válida
   */
  private isValidPosition(position: Position): boolean {
    return position.row >= 0 && position.row < BOARD_CONFIG.ROWS &&
           position.col >= 0 && position.col < BOARD_CONFIG.COLUMNS;
  }

  /**
   * Obtiene la puntuación actual
   */
  getScore(): number {
    return this.score;
  }

  /**
   * Obtiene los movimientos restantes
   */
  getMoves(): number {
    return this.moves;
  }

  /**
   * Verifica si el juego está procesando
   */
  isGameProcessing(): boolean {
    return this.isProcessing;
  }

  /**
   * Destruye el tablero y libera recursos
   */
  /**
   * Actualiza la configuración del tablero dinámicamente
   * @param cellSize - Nuevo tamaño de celda
   * @param gemSize - Nuevo tamaño de gema
   */
  public updateConfig(cellSize: number, gemSize: number): void {
    this.currentCellSize = cellSize;
    this.currentGemSize = gemSize;
    
    // Actualizar todas las gemas existentes
    this.gems.forEach(row => {
      row.forEach(gem => {
        if (gem) {
          gem.updateConfig(cellSize, gemSize);
        }
      });
    });
    
    // Recrear el fondo del tablero
    this.removeChildren();
    this.createBoardBackground();
    this.addInitialGemsToContainer();
  }

  /**
   * Obtiene la configuración actual del tablero
   */
  public getCurrentConfig(): { cellSize: number; gemSize: number } {
    return {
      cellSize: this.currentCellSize,
      gemSize: this.currentGemSize,
    };
  }

  destroy(): void {
    this.gems.forEach(row => {
      row.forEach(gem => {
        if (gem) {
          gem.destroy();
        }
      });
    });
    super.destroy();
  }
}
