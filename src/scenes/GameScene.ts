import { Container, Graphics, Text, TextStyle, Sprite, Assets } from 'pixi.js';
import { IScene } from './IScene';
import { Board } from '../game/Board';
import { EventEmitter } from '../core/EventEmitter';
import { ScoreDisplay } from '../ui/ScoreDisplay.js';
import { MovesDisplay } from '../ui/MovesDisplay.js';
import { BOARD_CONFIG, GAME_EVENTS, GAME_CONFIG } from '../game/constants';

/**
 * Main game scene for Match-3.
 * Handles the board, UI and user interaction.
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
   * Initializes the game scene
   * @param _data - Optional initialization data
   */
  async enter(_data?: any): Promise<void> {
    console.log('Starting game scene');
    
    // Reset game state
    this.isGameOver = false;
    this.hideGameOverText();
    
    // Update displays
    this.scoreDisplay.updateScore(0);
    this.movesDisplay.updateMoves(GAME_CONFIG.INITIAL_MOVES);
    
    // Setup board interaction
    this.setupBoardInteraction();
    
    console.log('Game scene initialized');
  }

  /**
   * Cleans up the scene when exiting
   */
  async exit(): Promise<void> {
    console.log('Exiting game scene');
    
    // Clear event listeners
    this.eventEmitter.off(GAME_EVENTS.SCORE_UPDATED, this.onScoreUpdated);
    this.eventEmitter.off(GAME_EVENTS.MOVES_UPDATED, this.onMovesUpdated);
    this.eventEmitter.off(GAME_EVENTS.GAME_OVER, this.onGameOver);
    
    // Destroy components
    this.board.destroy();
    this.scoreDisplay.destroy();
    this.movesDisplay.destroy();
  }

  /**
   * Updates the scene each frame
   * @param deltaTime - Time elapsed since last update
   */
  update(deltaTime: number): void {
    // Update UI displays
    this.scoreDisplay.update(deltaTime);
    this.movesDisplay.update(deltaTime);
  }

  /**
   * Handles window resizing
   * @param width - New width
   * @param height - New height
   */
  resize(width: number, height: number): void {
    // Center the board
    const boardWidth = BOARD_CONFIG.COLUMNS * BOARD_CONFIG.CELL_SIZE;
    const boardHeight = BOARD_CONFIG.ROWS * BOARD_CONFIG.CELL_SIZE;
    
    this.board.x = (width - boardWidth) / 2;
    this.board.y = (height - boardHeight) / 2 + 50; // Offset for top UI
    
    // Reposition UI elements
    this.scoreDisplay.resize(width, height);
    this.movesDisplay.resize(width, height);
    
    // Update background
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
   * Creates the scene background
   * @returns Background sprite or Graphics as fallback
   */
  private createBackground(): Sprite | Graphics {
    // Try to load custom background
    const backgroundTexture = Assets.cache.get('background_blur');
    
    if (backgroundTexture) {
      const backgroundSprite = new Sprite(backgroundTexture);
      backgroundSprite.width = 800;
      backgroundSprite.height = 600;
      return backgroundSprite;
    } else {
      // Fallback to solid background if image cannot be loaded
      const background = new Graphics();
      background.beginFill(0x2c3e50); // Dark blue color
      background.drawRect(0, 0, 800, 600); // Initial size
      background.endFill();
      return background;
    }
  }


  /**
   * Sets up the main container
   */
  private setupContainer(): void {
    // Add elements to container in depth order
    this.container.addChild(this.background);
    this.container.addChild(this.board);
    // UI displays are handled through HTML, not PixiJS
    // this.container.addChild(this.scoreDisplay.container);
    // this.container.addChild(this.movesDisplay.container);
  }

  /**
   * Sets up event listeners
   */
  private setupEventListeners(): void {
    this.eventEmitter.on(GAME_EVENTS.SCORE_UPDATED, this.onScoreUpdated.bind(this));
    this.eventEmitter.on(GAME_EVENTS.MOVES_UPDATED, this.onMovesUpdated.bind(this));
    this.eventEmitter.on(GAME_EVENTS.GAME_OVER, this.onGameOver.bind(this));
  }

  /**
   * Sets up board interaction
   */
  private setupBoardInteraction(): void {
    // Board is already configured for interaction in its constructor
    // Individual gems handle their own events
    console.log('Board interaction configured');
  }

  /**
   * Handles score updates
   * @param score - New score
   */
  private onScoreUpdated(score: number): void {
    this.scoreDisplay.updateScore(score);
  }

  /**
   * Handles moves updates
   * @param moves - Remaining moves
   */
  private onMovesUpdated(moves: number): void {
    this.movesDisplay.updateMoves(moves);
  }

  /**
   * Handles game over
   */
  private onGameOver(): void {
    this.isGameOver = true;
    this.showGameOverText();
  }

  /**
   * Shows game over text
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
    
    this.gameOverText = new Text('GAME OVER!', style);
    this.gameOverText.anchor.set(0.5);
    this.gameOverText.x = 400; // Center of screen
    this.gameOverText.y = 300;
    
    this.container.addChild(this.gameOverText);
  }

  /**
   * Hides game over text
   */
  private hideGameOverText(): void {
    if (this.gameOverText) {
      this.gameOverText.visible = false;
    }
  }

  /**
   * Gets the game board
   * @returns Board instance
   */
  getBoard(): Board {
    return this.board;
  }

  /**
   * Checks if the game has finished
   * @returns true if the game has finished
   */
  isGameFinished(): boolean {
    return this.isGameOver;
  }
}
