import { Application, Assets, Texture, Graphics, Rectangle } from 'pixi.js';
import { SceneManager } from './core/SceneManager';
import { EventEmitter } from './core/EventEmitter';
import { GameScene } from './scenes/GameScene';
import { FacebookMock } from './services/FacebookMock';
import { AudioService } from './services/AudioService';
import { AudioController } from './ui/AudioController';
import { GAME_EVENTS } from './game/constants';

/**
 * Main entry point for the Match-3 application.
 * Initializes PixiJS, loads assets and configures the game.
 */
class Match3Game {
  private app!: Application;
  private sceneManager!: SceneManager;
  private eventEmitter: EventEmitter;
  private facebookMock: FacebookMock;
  private audioService: AudioService;
  private audioController: AudioController;
  private isInitialized: boolean = false;
  private spriteSize: number = 99;
  private offsetX: number = 0;
  private offsetY: number = 0;

  constructor() {
    this.eventEmitter = new EventEmitter();
    this.facebookMock = FacebookMock.getInstance();
    this.audioService = AudioService.getInstance();
    this.audioController = new AudioController(this.audioService);
    // app will be initialized in initializePixiJS()
  }

  /**
   * Initializes the game application
   */
  async init(): Promise<void> {
    try {
      console.log('Starting Match-3 Game...');
      
      // Show loading screen
      this.showLoadingScreen();
      
      // Initialize PixiJS
      await this.initializePixiJS();
      
      // Initialize Facebook Mock
      await this.initializeFacebookMock();
      
      // Load assets
      await this.loadAssets();
      
      // Load audio
      await this.loadAudio();
      
      // Setup scenes
      this.setupScenes();
      
      // Setup global events
      this.setupGlobalEvents();
      
      // Initialize audio controls
      this.audioController.initialize();
      
      // Start the game
      await this.startGame();
      
      // Hide loading screen
      this.hideLoadingScreen();
      
      this.isInitialized = true;
      console.log('Match-3 Game initialized successfully');
      
    } catch (error) {
      console.error('Error initializing the game:', error);
      this.showError('Error initializing the game. Please reload the page.');
    }
  }

  /**
   * Initializes PixiJS with appropriate configuration
   */
  private async initializePixiJS(): Promise<void> {
    const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    
    if (!canvas) {
      throw new Error('Canvas not found');
    }

    // In PixiJS v7+, use Application directly
    this.app = new Application({
      view: canvas,
      width: 600,
      height: 500,
      backgroundColor: 0x2c3e50,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    // Configure the stage to be interactive
    this.app.stage.interactive = true;
    
    console.log('PixiJS initialized');
  }

  /**
   * Initializes Facebook Instant Games mock
   */
  private async initializeFacebookMock(): Promise<void> {
    try {
      await this.facebookMock.initializeAsync();
      console.log('Facebook Mock initialized');
    } catch (error) {
      console.warn('Error initializing Facebook Mock:', error);
      // Continue without Facebook Mock
    }
  }

  /**
   * Loads game assets
   */
  private async loadAssets(): Promise<void> {
    try {
      // Load game background
      await this.loadBackground();
      
      // Load candy atlas
      await this.loadCandyAtlas();
      
      console.log('Assets loaded successfully');
      
    } catch (error) {
      console.error('Error loading assets:', error);
      throw error;
    }
  }

  /**
   * Loads game audio files
   */
  private async loadAudio(): Promise<void> {
    try {
      // Load background music
      await this.audioService.loadBackgroundMusic('/music/jump and run - tropics.ogg');
      
      // Load sound effects
      await this.loadSoundEffects();
      
      console.log('Audio loaded successfully');
      
    } catch (error) {
      console.error('Error loading audio:', error);
      // Don't throw error so game can continue without audio
    }
  }

  /**
   * Loads all sound effects
   */
  private async loadSoundEffects(): Promise<void> {
    const soundEffects = [
      // Selection and interaction sounds
      { name: 'select', path: '/sfx/sfx_select.ogg' },
      { name: 'switch', path: '/sfx/sfx_switch.ogg' },
      { name: 'toggle', path: '/sfx/sfx_toggle.ogg' },
      
      // Successful match sounds
      { name: 'match_normal', path: '/sfx/sfx_explosionNormal.ogg' },
      { name: 'match_special', path: '/sfx/sfx_explosionFlash.ogg' },
      { name: 'match_goo', path: '/sfx/sfx_explosionGoo.ogg' },
      { name: 'good1', path: '/sfx/good1.wav' },
      { name: 'good2', path: '/sfx/good2.wav' },
      
      // Error/invalid move sounds
      { name: 'wrong', path: '/sfx/wrong.wav' },
      { name: 'wrong2', path: '/sfx/wrong2.wav' },
      { name: 'hurt', path: '/sfx/sfx_hurt.ogg' },
      
      // Special game sounds
      { name: 'health', path: '/sfx/sfx_health.ogg' },
      { name: 'wave_clear', path: '/sfx/sfx_waveclear.ogg' },
      { name: 'resurrect', path: '/sfx/sfx_resurrect.ogg' },
      { name: 'shocked', path: '/sfx/sfx_shocked.ogg' },
      { name: 'ray', path: '/sfx/sfx_ray.ogg' },
      
      // Game over sounds
      { name: 'game_over', path: '/sfx/sfx_death.ogg' },
      { name: 'alarm', path: '/sfx/sfx_alarm.ogg' },
    ];

    for (const effect of soundEffects) {
      try {
        await this.audioService.loadSoundEffect(effect.name, effect.path);
      } catch (error) {
        console.warn(`Could not load sound effect ${effect.name}:`, error);
      }
    }
  }

  /**
   * Loads candy atlas from file
   */
  private async loadCandyAtlas(): Promise<void> {
    try {
      // Load atlas texture
      const atlasTexture = await Assets.load('/sprites/assets_candy.png');
      Assets.cache.set('candy_atlas', atlasTexture);
      
      // Create individual textures for each candy
      this.createCandyTextures(atlasTexture);
      
      console.log('Candy atlas loaded successfully');
    } catch (error) {
      console.warn('Could not load candy atlas, using basic textures:', error);
      // Fallback to basic textures
      const gemTextures = this.createBasicGemTextures();
      Object.entries(gemTextures).forEach(([name, texture]) => {
        Assets.cache.set(name, texture);
      });
    }
  }

  /**
   * Creates individual textures for each candy from the atlas
   * @param atlasTexture - Complete atlas texture
   */
  private createCandyTextures(atlasTexture: Texture): void {
    // Mapping of texture names to positions in the atlas
    const textureMap = {
      // Normal candies (row 1, columns 1-5)
      'gem_yellow': { row: 0, col: 0 },
      'gem_blue': { row: 0, col: 1 },
      'gem_red': { row: 0, col: 2 },
      'gem_green': { row: 0, col: 3 },
      'gem_purple': { row: 0, col: 4 },
      
      // Horizontal striped candies (row 2, columns 1-5)
      'gem_yellow_striped_h': { row: 1, col: 0 },
      'gem_blue_striped_h': { row: 1, col: 1 },
      'gem_red_striped_h': { row: 1, col: 2 },
      'gem_green_striped_h': { row: 1, col: 3 },
      'gem_purple_striped_h': { row: 1, col: 4 },
      
      // Vertical striped candies (row 3, columns 1-5)
      'gem_yellow_striped_v': { row: 2, col: 0 },
      'gem_blue_striped_v': { row: 2, col: 1 },
      'gem_red_striped_v': { row: 2, col: 2 },
      'gem_green_striped_v': { row: 2, col: 3 },
      'gem_purple_striped_v': { row: 2, col: 4 },
      
      // Wrapped candies (row 4, columns 1-5)
      'gem_yellow_wrapped': { row: 3, col: 0 },
      'gem_blue_wrapped': { row: 3, col: 1 },
      'gem_red_wrapped': { row: 3, col: 2 },
      'gem_green_wrapped': { row: 3, col: 3 },
      'gem_purple_wrapped': { row: 3, col: 4 },
      
      // Special candy that combines with all (row 1, column 6)
      'color_bomb': { row: 0, col: 5 },
      
      // Melting block (row 4, columns 1-2)
      'block_melting_intact': { row: 3, col: 1 },    // Estado inicial (fila 4, col 2)
      'block_melting_damaged': { row: 3, col: 0 },   // Estado derretido (fila 4, col 1)
      
      // Cookie that gets destroyed (row 4, columns 3-4)
      'cookie_intact': { row: 3, col: 3 },          // Estado inicial (fila 4, col 4)
      'cookie_destroyed': { row: 3, col: 2 },       // Estado agrietado (fila 4, col 3)
      
      // Bomb that explodes (row 6, column 3)
      'bomb': { row: 5, col: 2 },
    };
    
    // Create individual textures using dynamic configuration
    Object.entries(textureMap).forEach(([name, position]) => {
      const frame = new Rectangle(
        this.offsetX + position.col * this.spriteSize,
        this.offsetY + position.row * this.spriteSize,
        this.spriteSize,
        this.spriteSize
      );
      
      // Create a new texture from the atlas
      const texture = new Texture(atlasTexture.baseTexture, frame);
      
      Assets.cache.set(name, texture);
      
      // Log to verify that special textures are loaded
      if (name.includes('striped') || name.includes('wrapped') || name.includes('color_bomb')) {
        console.log(`Special texture loaded: ${name} at position (${position.row}, ${position.col})`);
      }
    });
  }

  /**
   * Loads game background from file
   */
  private async loadBackground(): Promise<void> {
    try {
      // Load background texture
      const backgroundTexture = await Assets.load('/sprites/background_blur.png');
      Assets.cache.set('background_blur', backgroundTexture);
      console.log('Background loaded successfully');
    } catch (error) {
      console.warn('Could not load custom background, using default background:', error);
    }
  }

  /**
   * Creates basic textures for gems (for demonstration)
   */
  private createBasicGemTextures(): Record<string, Texture> {
    const textures: Record<string, Texture> = {};
    
    // Gem colors
    const gemColors = {
      yellow: 0xffd700,
      blue: 0x4169e1,
      red: 0xdc143c,
      green: 0x228b22,
      purple: 0x8a2be2
    };
    
    // Create basic textures for each color using Graphics
    Object.entries(gemColors).forEach(([color, hexColor]) => {
      const graphics = new Graphics();
      
      // Create main circle
      graphics.beginFill(hexColor);
      graphics.drawCircle(32, 32, 28); // Circle of 56px diameter
      graphics.endFill();
      
      // Add bright border
      graphics.lineStyle(4, 0xffffff, 0.8);
      graphics.drawCircle(32, 32, 28);
      
      // Add internal glow
      graphics.lineStyle(2, 0xffffff, 0.4);
      graphics.drawCircle(32, 32, 20);
      
      // Generate texture from graphics
      textures[`gem_${color}`] = this.app.renderer.generateTexture(graphics);
    });
    
    return textures;
  }

  /**
   * Sets up game scenes
   */
  private setupScenes(): void {
    this.sceneManager = new SceneManager(this.app);
    
    // Create and register the game scene
    const gameScene = new GameScene(this.eventEmitter);
    this.sceneManager.registerScene('game', gameScene);
    
    console.log('Scenes configured');
  }

  /**
   * Sets up global game events
   */
  private setupGlobalEvents(): void {
    // Resize events
    window.addEventListener('resize', this.onResize.bind(this));
    
    // Game events
    this.eventEmitter.on(GAME_EVENTS.SCORE_UPDATED, this.onScoreUpdated.bind(this));
    this.eventEmitter.on(GAME_EVENTS.MOVES_UPDATED, this.onMovesUpdated.bind(this));
    this.eventEmitter.on(GAME_EVENTS.GAME_OVER, this.onGameOver.bind(this));
    
    console.log('Global events configured');
  }

  /**
   * Starts the game by changing to the main scene
   */
  private async startGame(): Promise<void> {
    await this.sceneManager.changeScene('game');
    
    // Start render loop
    this.app.ticker.add(this.onTick.bind(this));
    
    // Start background music
    await this.audioService.playBackgroundMusic();
    
    // Notify Facebook Mock that the game has started
    try {
      await this.facebookMock.startGameAsync();
    } catch (error) {
      console.warn('Error notifying game start to Facebook:', error);
    }
  }

  /**
   * Main game loop
   * @param ticker - PixiJS ticker
   */
  private onTick(ticker: any): void {
    const deltaTime = ticker.deltaTime;
    this.sceneManager.update(deltaTime);
  }

  /**
   * Handles window resizing
   */
  private onResize(): void {
    if (!this.isInitialized) return;
    
    const container = document.getElementById('game-container');
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const newWidth = Math.min(800, containerRect.width);
    const newHeight = Math.min(600, containerRect.height);
    
    this.app.renderer.resize(newWidth, newHeight);
    
    // Notify current scene about resizing
    const currentScene = this.sceneManager.getCurrentScene();
    if (currentScene) {
      currentScene.resize(newWidth, newHeight);
    }
  }

  /**
   * Handles score updates
   * @param score - New score
   */
  private onScoreUpdated(score: number): void {
    const scoreElement = document.getElementById('score-display');
    if (scoreElement) {
      scoreElement.textContent = score.toString();
    }
    
    // Notify Facebook Mock
    this.facebookMock.setScoreAsync(score).catch(error => {
      console.warn('Error updating score on Facebook:', error);
    });
  }

  /**
   * Handles moves updates
   * @param moves - Remaining moves
   */
  private onMovesUpdated(moves: number): void {
    const movesElement = document.getElementById('moves-display');
    if (movesElement) {
      movesElement.textContent = moves.toString();
      
      // Add warning class if few moves remain
      if (moves <= 5) {
        movesElement.classList.add('low');
      } else {
        movesElement.classList.remove('low');
      }
    }
  }

  /**
   * Handles game over
   */
  private async onGameOver(): Promise<void> {
    console.log('Game finished');
    
    // Notify Facebook Mock that the game has ended
    try {
      await this.facebookMock.endGameAsync();
    } catch (error) {
      console.warn('Error notifying game end to Facebook:', error);
    }
  }

  /**
   * Shows loading screen
   */
  private showLoadingScreen(): void {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.classList.remove('hidden');
    }
  }

  /**
   * Hides loading screen
   */
  private hideLoadingScreen(): void {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      setTimeout(() => {
        loadingScreen.classList.add('hidden');
      }, 500); // Small delay to smooth the transition
    }
  }

  /**
   * Shows an error message
   * @param message - Error message to show
   */
  public showError(message: string): void {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
  }

  /**
   * Updates spritesheet configuration
   * @param spriteSize - New sprite size
   * @param offsetX - New X offset
   * @param offsetY - New Y offset
   */
  public updateSpriteConfig(spriteSize: number, offsetX: number, offsetY: number): void {
    this.spriteSize = spriteSize;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    
    // Reload textures with new configuration
    const atlasTexture = Assets.cache.get('candy_atlas');
    if (atlasTexture) {
      this.createCandyTextures(atlasTexture as Texture);
    }
  }

  /**
   * Gets current spritesheet configuration
   */
  public getSpriteConfig(): { spriteSize: number; offsetX: number; offsetY: number } {
    return {
      spriteSize: this.spriteSize,
      offsetX: this.offsetX,
      offsetY: this.offsetY,
    };
  }

  /**
   * Gets the audio service
   */
  getAudioService(): AudioService {
    return this.audioService;
  }

  /**
   * Destroys the application and frees resources
   */
  destroy(): void {
    if (this.app) {
      this.app.destroy(true);
    }
    
    // Destroy audio service and controller
    this.audioController.destroy();
    this.audioService.destroy();
    
    window.removeEventListener('resize', this.onResize.bind(this));
  }
}

// Initialize the game when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  const game = new Match3Game();
  
  // Make the game globally accessible for debugging
  (window as any).match3Game = game;
  
  // Handle uncaught errors
  window.addEventListener('error', (event) => {
    console.error('Uncaught error:', event.error);
    game.showError('An unexpected error occurred. Please reload the page.');
  });
  
  // Handle rejected promises
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Rejected promise:', event.reason);
    game.showError('An unexpected error occurred. Please reload the page.');
  });
  
  try {
    await game.init();
  } catch (error) {
    console.error('Fatal error initializing the game:', error);
  }
});

// Export for global use if needed
export { Match3Game };
