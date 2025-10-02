import { Application, Assets, Texture, Graphics, Rectangle } from 'pixi.js';
import { SceneManager } from './core/SceneManager';
import { EventEmitter } from './core/EventEmitter';
import { GameScene } from './scenes/GameScene';
import { FacebookMock } from './services/FacebookMock';
import { GAME_EVENTS } from './game/constants';

/**
 * Punto de entrada principal de la aplicación Match-3.
 * Inicializa PixiJS, carga los assets y configura el juego.
 */
class Match3Game {
  private app!: Application;
  private sceneManager!: SceneManager;
  private eventEmitter: EventEmitter;
  private facebookMock: FacebookMock;
  private isInitialized: boolean = false;
  private spriteSize: number = 99;
  private offsetX: number = 0;
  private offsetY: number = 0;

  constructor() {
    this.eventEmitter = new EventEmitter();
    this.facebookMock = FacebookMock.getInstance();
    // app se inicializará en initializePixiJS()
  }

  /**
   * Inicializa la aplicación del juego
   */
  async init(): Promise<void> {
    try {
      console.log('Iniciando Match-3 Game...');
      
      // Mostrar pantalla de carga
      this.showLoadingScreen();
      
      // Inicializar PixiJS
      await this.initializePixiJS();
      
      // Inicializar Facebook Mock
      await this.initializeFacebookMock();
      
      // Cargar assets
      await this.loadAssets();
      
      // Configurar escenas
      this.setupScenes();
      
      // Configurar eventos globales
      this.setupGlobalEvents();
      
      // Iniciar el juego
      await this.startGame();
      
      // Ocultar pantalla de carga
      this.hideLoadingScreen();
      
      this.isInitialized = true;
      console.log('Match-3 Game inicializado correctamente');
      
    } catch (error) {
      console.error('Error al inicializar el juego:', error);
      this.showError('Error al inicializar el juego. Por favor, recarga la página.');
    }
  }

  /**
   * Inicializa PixiJS con la configuración apropiada
   */
  private async initializePixiJS(): Promise<void> {
    const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    
    if (!canvas) {
      throw new Error('Canvas no encontrado');
    }

    // En PixiJS v7+, usar Application directamente
    this.app = new Application({
      view: canvas,
      width: 600,
      height: 500,
      backgroundColor: 0x2c3e50,
      antialias: true,
      resolution: window.devicePixelRatio || 1,
      autoDensity: true,
    });

    // Configurar el stage para que sea interactivo
    this.app.stage.interactive = true;
    
    console.log('PixiJS inicializado');
  }

  /**
   * Inicializa el mock de Facebook Instant Games
   */
  private async initializeFacebookMock(): Promise<void> {
    try {
      await this.facebookMock.initializeAsync();
      console.log('Facebook Mock inicializado');
    } catch (error) {
      console.warn('Error al inicializar Facebook Mock:', error);
      // Continuar sin Facebook Mock
    }
  }

  /**
   * Carga los assets del juego
   */
  private async loadAssets(): Promise<void> {
    try {
      // Cargar el fondo del juego
      await this.loadBackground();
      
      // Cargar el atlas de dulces
      await this.loadCandyAtlas();
      
      console.log('Assets cargados correctamente');
      
    } catch (error) {
      console.error('Error al cargar assets:', error);
      throw error;
    }
  }

  /**
   * Carga el atlas de dulces desde el archivo
   */
  private async loadCandyAtlas(): Promise<void> {
    try {
      // Cargar la textura del atlas
      const atlasTexture = await Assets.load('/sprites/assets_candy.png');
      Assets.cache.set('candy_atlas', atlasTexture);
      
      // Crear texturas individuales para cada dulce
      this.createCandyTextures(atlasTexture);
      
      console.log('Atlas de dulces cargado correctamente');
    } catch (error) {
      console.warn('No se pudo cargar el atlas de dulces, usando texturas básicas:', error);
      // Fallback a texturas básicas
      const gemTextures = this.createBasicGemTextures();
      Object.entries(gemTextures).forEach(([name, texture]) => {
        Assets.cache.set(name, texture);
      });
    }
  }

  /**
   * Crea texturas individuales para cada dulce del atlas
   * @param atlasTexture - Textura del atlas completo
   */
  private createCandyTextures(atlasTexture: Texture): void {
    // Mapeo de nombres de texturas a posiciones en el atlas
    const textureMap = {
      // Dulces normales (fila 1, columnas 1-5)
      'gem_yellow': { row: 0, col: 0 },
      'gem_blue': { row: 0, col: 1 },
      'gem_red': { row: 0, col: 2 },
      'gem_green': { row: 0, col: 3 },
      'gem_purple': { row: 0, col: 4 },
      
      // Dulces rayados horizontales (fila 2, columnas 1-5)
      'gem_yellow_striped_h': { row: 1, col: 0 },
      'gem_blue_striped_h': { row: 1, col: 1 },
      'gem_red_striped_h': { row: 1, col: 2 },
      'gem_green_striped_h': { row: 1, col: 3 },
      'gem_purple_striped_h': { row: 1, col: 4 },
      
      // Dulces rayados verticales (fila 3, columnas 1-5)
      'gem_yellow_striped_v': { row: 2, col: 0 },
      'gem_blue_striped_v': { row: 2, col: 1 },
      'gem_red_striped_v': { row: 2, col: 2 },
      'gem_green_striped_v': { row: 2, col: 3 },
      'gem_purple_striped_v': { row: 2, col: 4 },
      
      // Dulce especial que combina con todos (fila 1, columna 6)
      'color_bomb': { row: 0, col: 5 },
      
      // Bloque que se derrite (fila 4, columnas 1-2)
      'block_melting_1': { row: 3, col: 0 },
      'block_melting_2': { row: 3, col: 1 },
      
      // Galleta que se destruye (fila 4, columnas 3-4)
      'cookie_destroyed': { row: 3, col: 2 },
      'cookie_intact': { row: 3, col: 3 },
      
      // Bomba que explota (fila 5, columna 3)
      'bomb': { row: 4, col: 2 },
    };
    
    // Crear texturas individuales usando la configuración dinámica
    Object.entries(textureMap).forEach(([name, position]) => {
      const frame = new Rectangle(
        this.offsetX + position.col * this.spriteSize,
        this.offsetY + position.row * this.spriteSize,
        this.spriteSize,
        this.spriteSize
      );
      
      // Crear una nueva textura desde el atlas
      const texture = new Texture(atlasTexture.baseTexture, frame);
      
      Assets.cache.set(name, texture);
    });
  }

  /**
   * Carga el fondo del juego desde el archivo
   */
  private async loadBackground(): Promise<void> {
    try {
      // Cargar la textura del fondo
      const backgroundTexture = await Assets.load('/sprites/background_blur.png');
      Assets.cache.set('background_blur', backgroundTexture);
      console.log('Fondo cargado correctamente');
    } catch (error) {
      console.warn('No se pudo cargar el fondo personalizado, usando fondo por defecto:', error);
    }
  }

  /**
   * Crea texturas básicas para las gemas (para demostración)
   */
  private createBasicGemTextures(): Record<string, Texture> {
    const textures: Record<string, Texture> = {};
    
    // Colores de las gemas
    const gemColors = {
      yellow: 0xffd700,
      blue: 0x4169e1,
      red: 0xdc143c,
      green: 0x228b22,
      purple: 0x8a2be2
    };
    
    // Crear texturas básicas para cada color usando Graphics
    Object.entries(gemColors).forEach(([color, hexColor]) => {
      const graphics = new Graphics();
      
      // Crear círculo principal
      graphics.beginFill(hexColor);
      graphics.drawCircle(32, 32, 28); // Círculo de 56px de diámetro
      graphics.endFill();
      
      // Agregar borde brillante
      graphics.lineStyle(4, 0xffffff, 0.8);
      graphics.drawCircle(32, 32, 28);
      
      // Agregar resplandor interno
      graphics.lineStyle(2, 0xffffff, 0.4);
      graphics.drawCircle(32, 32, 20);
      
      // Generar textura desde graphics
      textures[`gem_${color}`] = this.app.renderer.generateTexture(graphics);
    });
    
    return textures;
  }

  /**
   * Configura las escenas del juego
   */
  private setupScenes(): void {
    this.sceneManager = new SceneManager(this.app);
    
    // Crear y registrar la escena del juego
    const gameScene = new GameScene(this.eventEmitter);
    this.sceneManager.registerScene('game', gameScene);
    
    console.log('Escenas configuradas');
  }

  /**
   * Configura los eventos globales del juego
   */
  private setupGlobalEvents(): void {
    // Eventos de redimensionamiento
    window.addEventListener('resize', this.onResize.bind(this));
    
    // Eventos del juego
    this.eventEmitter.on(GAME_EVENTS.SCORE_UPDATED, this.onScoreUpdated.bind(this));
    this.eventEmitter.on(GAME_EVENTS.MOVES_UPDATED, this.onMovesUpdated.bind(this));
    this.eventEmitter.on(GAME_EVENTS.GAME_OVER, this.onGameOver.bind(this));
    
    console.log('Eventos globales configurados');
  }

  /**
   * Inicia el juego cambiando a la escena principal
   */
  private async startGame(): Promise<void> {
    await this.sceneManager.changeScene('game');
    
    // Iniciar el loop de renderizado
    this.app.ticker.add(this.onTick.bind(this));
    
    // Notificar a Facebook Mock que el juego ha comenzado
    try {
      await this.facebookMock.startGameAsync();
    } catch (error) {
      console.warn('Error al notificar inicio del juego a Facebook:', error);
    }
  }

  /**
   * Loop principal del juego
   * @param ticker - Ticker de PixiJS
   */
  private onTick(ticker: any): void {
    const deltaTime = ticker.deltaTime;
    this.sceneManager.update(deltaTime);
  }

  /**
   * Maneja el redimensionamiento de la ventana
   */
  private onResize(): void {
    if (!this.isInitialized) return;
    
    const container = document.getElementById('game-container');
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const newWidth = Math.min(800, containerRect.width);
    const newHeight = Math.min(600, containerRect.height);
    
    this.app.renderer.resize(newWidth, newHeight);
    
    // Notificar a la escena actual sobre el redimensionamiento
    const currentScene = this.sceneManager.getCurrentScene();
    if (currentScene) {
      currentScene.resize(newWidth, newHeight);
    }
  }

  /**
   * Maneja la actualización de puntuación
   * @param score - Nueva puntuación
   */
  private onScoreUpdated(score: number): void {
    const scoreElement = document.getElementById('score-display');
    if (scoreElement) {
      scoreElement.textContent = score.toString();
    }
    
    // Notificar a Facebook Mock
    this.facebookMock.setScoreAsync(score).catch(error => {
      console.warn('Error al actualizar puntuación en Facebook:', error);
    });
  }

  /**
   * Maneja la actualización de movimientos
   * @param moves - Movimientos restantes
   */
  private onMovesUpdated(moves: number): void {
    const movesElement = document.getElementById('moves-display');
    if (movesElement) {
      movesElement.textContent = moves.toString();
      
      // Agregar clase de advertencia si quedan pocos movimientos
      if (moves <= 5) {
        movesElement.classList.add('low');
      } else {
        movesElement.classList.remove('low');
      }
    }
  }

  /**
   * Maneja el fin del juego
   */
  private async onGameOver(): Promise<void> {
    console.log('Juego terminado');
    
    // Notificar a Facebook Mock que el juego ha terminado
    try {
      await this.facebookMock.endGameAsync();
    } catch (error) {
      console.warn('Error al notificar fin del juego a Facebook:', error);
    }
  }

  /**
   * Muestra la pantalla de carga
   */
  private showLoadingScreen(): void {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      loadingScreen.classList.remove('hidden');
    }
  }

  /**
   * Oculta la pantalla de carga
   */
  private hideLoadingScreen(): void {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
      setTimeout(() => {
        loadingScreen.classList.add('hidden');
      }, 500); // Pequeño delay para suavizar la transición
    }
  }

  /**
   * Muestra un mensaje de error
   * @param message - Mensaje de error a mostrar
   */
  public showError(message: string): void {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
      errorElement.textContent = message;
      errorElement.style.display = 'block';
    }
  }

  /**
   * Actualiza la configuración del spritesheet
   * @param spriteSize - Nuevo tamaño de sprite
   * @param offsetX - Nuevo offset X
   * @param offsetY - Nuevo offset Y
   */
  public updateSpriteConfig(spriteSize: number, offsetX: number, offsetY: number): void {
    this.spriteSize = spriteSize;
    this.offsetX = offsetX;
    this.offsetY = offsetY;
    
    // Recargar las texturas con la nueva configuración
    const atlasTexture = Assets.cache.get('candy_atlas');
    if (atlasTexture) {
      this.createCandyTextures(atlasTexture as Texture);
    }
  }

  /**
   * Obtiene la configuración actual del spritesheet
   */
  public getSpriteConfig(): { spriteSize: number; offsetX: number; offsetY: number } {
    return {
      spriteSize: this.spriteSize,
      offsetX: this.offsetX,
      offsetY: this.offsetY,
    };
  }

  /**
   * Destruye la aplicación y libera recursos
   */
  destroy(): void {
    if (this.app) {
      this.app.destroy(true);
    }
    
    window.removeEventListener('resize', this.onResize.bind(this));
  }
}

// Inicializar el juego cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', async () => {
  const game = new Match3Game();
  
  // Hacer el juego accesible globalmente para el debug
  (window as any).match3Game = game;
  
  // Manejar errores no capturados
  window.addEventListener('error', (event) => {
    console.error('Error no capturado:', event.error);
    game.showError('Ha ocurrido un error inesperado. Por favor, recarga la página.');
  });
  
  // Manejar promesas rechazadas
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Promesa rechazada:', event.reason);
    game.showError('Ha ocurrido un error inesperado. Por favor, recarga la página.');
  });
  
  try {
    await game.init();
  } catch (error) {
    console.error('Error fatal al inicializar el juego:', error);
  }
});

// Exportar para uso global si es necesario
export { Match3Game };
