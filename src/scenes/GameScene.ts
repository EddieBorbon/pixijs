import { Container, Graphics, Text, TextStyle, Sprite, Assets } from 'pixi.js';
import { IScene } from './IScene';
import { Board } from '../game/Board';
import { EventEmitter } from '../core/EventEmitter';
import { ScoreDisplay } from '../ui/ScoreDisplay.js';
import { MovesDisplay } from '../ui/MovesDisplay.js';
import { BOARD_CONFIG, GAME_EVENTS, GAME_CONFIG } from '../game/constants';

/**
 * Escena principal del juego Match-3.
 * Maneja el tablero, la UI y la interacción del usuario.
 */
export class GameScene implements IScene {
  public readonly container: Container;
  
  private board: Board;
  private eventEmitter: EventEmitter;
  private scoreDisplay: ScoreDisplay;
  private movesDisplay: MovesDisplay;
  private background: Sprite | Graphics;
  private gameOverText: Text | null = null;
  private isGameOver: boolean = false;

  constructor(eventEmitter: EventEmitter) {
    this.container = new Container();
    this.eventEmitter = eventEmitter;
    
    // Crear componentes
    this.board = new Board(eventEmitter);
    this.scoreDisplay = new ScoreDisplay();
    this.movesDisplay = new MovesDisplay();
    
    // Crear fondo
    this.background = this.createBackground();
    
    // Configurar contenedor
    this.setupContainer();
    this.setupEventListeners();
  }

  /**
   * Inicializa la escena del juego
   * @param _data - Datos opcionales de inicialización
   */
  async enter(_data?: any): Promise<void> {
    console.log('Iniciando escena del juego');
    
    // Resetear estado del juego
    this.isGameOver = false;
    this.hideGameOverText();
    
    // Actualizar displays
    this.scoreDisplay.updateScore(0);
    this.movesDisplay.updateMoves(GAME_CONFIG.INITIAL_MOVES);
    
    // Configurar interacción del tablero
    this.setupBoardInteraction();
    
    console.log('Escena del juego inicializada');
  }

  /**
   * Limpia la escena cuando se sale
   */
  async exit(): Promise<void> {
    console.log('Saliendo de la escena del juego');
    
    // Limpiar listeners de eventos
    this.eventEmitter.off(GAME_EVENTS.SCORE_UPDATED, this.onScoreUpdated);
    this.eventEmitter.off(GAME_EVENTS.MOVES_UPDATED, this.onMovesUpdated);
    this.eventEmitter.off(GAME_EVENTS.GAME_OVER, this.onGameOver);
    
    // Destruir componentes
    this.board.destroy();
    this.scoreDisplay.destroy();
    this.movesDisplay.destroy();
  }

  /**
   * Actualiza la escena en cada frame
   * @param deltaTime - Tiempo transcurrido desde la última actualización
   */
  update(deltaTime: number): void {
    // Actualizar displays de UI
    this.scoreDisplay.update(deltaTime);
    this.movesDisplay.update(deltaTime);
  }

  /**
   * Maneja el redimensionamiento de la ventana
   * @param width - Nuevo ancho
   * @param height - Nuevo alto
   */
  resize(width: number, height: number): void {
    // Centrar el tablero
    const boardWidth = BOARD_CONFIG.COLUMNS * BOARD_CONFIG.CELL_SIZE;
    const boardHeight = BOARD_CONFIG.ROWS * BOARD_CONFIG.CELL_SIZE;
    
    this.board.x = (width - boardWidth) / 2;
    this.board.y = (height - boardHeight) / 2 + 50; // Offset para la UI superior
    
    // Reposicionar elementos de UI
    this.scoreDisplay.resize(width, height);
    this.movesDisplay.resize(width, height);
    
    // Actualizar fondo
    if (this.background instanceof Sprite) {
      this.background.width = width;
      this.background.height = height;
    } else {
      this.background.clear();
      this.background.beginFill(0x2c3e50);
      this.background.drawRect(0, 0, width, height);
      this.background.endFill();
    }
  }

  /**
   * Crea el fondo de la escena
   * @returns Sprite del fondo o Graphics como fallback
   */
  private createBackground(): Sprite | Graphics {
    // Intentar cargar el fondo personalizado
    const backgroundTexture = Assets.cache.get('background_blur');
    
    if (backgroundTexture) {
      const backgroundSprite = new Sprite(backgroundTexture);
      backgroundSprite.width = 800;
      backgroundSprite.height = 600;
      return backgroundSprite;
    } else {
      // Fallback a fondo sólido si no se puede cargar la imagen
      const background = new Graphics();
      background.beginFill(0x2c3e50); // Color azul oscuro
      background.drawRect(0, 0, 800, 600); // Tamaño inicial
      background.endFill();
      return background;
    }
  }


  /**
   * Configura el contenedor principal
   */
  private setupContainer(): void {
    // Agregar elementos al contenedor en orden de profundidad
    this.container.addChild(this.background);
    this.container.addChild(this.board);
    // Los displays de UI se manejan a través del HTML, no de PixiJS
    // this.container.addChild(this.scoreDisplay.container);
    // this.container.addChild(this.movesDisplay.container);
  }

  /**
   * Configura los listeners de eventos
   */
  private setupEventListeners(): void {
    this.eventEmitter.on(GAME_EVENTS.SCORE_UPDATED, this.onScoreUpdated.bind(this));
    this.eventEmitter.on(GAME_EVENTS.MOVES_UPDATED, this.onMovesUpdated.bind(this));
    this.eventEmitter.on(GAME_EVENTS.GAME_OVER, this.onGameOver.bind(this));
  }

  /**
   * Configura la interacción con el tablero
   */
  private setupBoardInteraction(): void {
    // El tablero ya está configurado para interacción en su constructor
    // Las gemas individuales manejan sus propios eventos
    console.log('Interacción del tablero configurada');
  }

  /**
   * Maneja la actualización de puntuación
   * @param score - Nueva puntuación
   */
  private onScoreUpdated(score: number): void {
    this.scoreDisplay.updateScore(score);
  }

  /**
   * Maneja la actualización de movimientos
   * @param moves - Movimientos restantes
   */
  private onMovesUpdated(moves: number): void {
    this.movesDisplay.updateMoves(moves);
  }

  /**
   * Maneja el fin del juego
   */
  private onGameOver(): void {
    this.isGameOver = true;
    this.showGameOverText();
  }

  /**
   * Muestra el texto de fin de juego
   */
  private showGameOverText(): void {
    if (this.gameOverText) {
      this.gameOverText.visible = true;
      return;
    }
    
    const style = new TextStyle({
      fontFamily: 'Arial',
      fontSize: 48,
      fill: 0xff0000,
      stroke: 0xffffff,
      strokeThickness: 4,
      align: 'center'
    });
    
    this.gameOverText = new Text('¡JUEGO TERMINADO!', style);
    this.gameOverText.anchor.set(0.5);
    this.gameOverText.x = 400; // Centro de la pantalla
    this.gameOverText.y = 300;
    
    this.container.addChild(this.gameOverText);
  }

  /**
   * Oculta el texto de fin de juego
   */
  private hideGameOverText(): void {
    if (this.gameOverText) {
      this.gameOverText.visible = false;
    }
  }

  /**
   * Obtiene el tablero del juego
   * @returns Instancia del tablero
   */
  getBoard(): Board {
    return this.board;
  }

  /**
   * Verifica si el juego ha terminado
   * @returns true si el juego ha terminado
   */
  isGameFinished(): boolean {
    return this.isGameOver;
  }
}
