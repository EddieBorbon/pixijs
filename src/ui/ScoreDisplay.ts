import { Container, Text, TextStyle, Graphics } from 'pixi.js';

/**
 * Componente de UI que muestra la puntuación actual del jugador.
 * Incluye animaciones y efectos visuales para hacer el juego más atractivo.
 */
export class ScoreDisplay {
  public readonly container: Container;
  
  private scoreText!: Text;
  private background!: Graphics;
  private currentScore: number = 0;
  private targetScore: number = 0;
  private animationSpeed: number = 0.1;

  constructor() {
    this.container = new Container();
    this.setupUI();
  }

  /**
   * Configura los elementos de UI del display de puntuación
   */
  private setupUI(): void {
    // Crear fondo
    this.background = new Graphics();
    this.background.beginFill(0x34495e, 0.8);
    this.background.drawRoundedRect(0, 0, 200, 60, 10);
    this.background.endFill();
    
    // Crear texto de etiqueta
    const labelStyle = new TextStyle({
      fontFamily: 'Arial',
      fontSize: 16,
      fill: 0xffffff,
      align: 'center'
    });
    
    const labelText = new Text('PUNTUACIÓN', labelStyle);
    labelText.anchor.set(0.5);
    labelText.x = 100;
    labelText.y = 15;
    
    // Crear texto de puntuación
    const scoreStyle = new TextStyle({
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0xf39c12,
      fontWeight: 'bold',
      align: 'center'
    });
    
    this.scoreText = new Text('0', scoreStyle);
    this.scoreText.anchor.set(0.5);
    this.scoreText.x = 100;
    this.scoreText.y = 40;
    
    // Agregar elementos al contenedor
    this.container.addChild(this.background);
    this.container.addChild(labelText);
    this.container.addChild(this.scoreText);
  }

  /**
   * Actualiza la puntuación mostrada
   * @param score - Nueva puntuación
   */
  updateScore(score: number): void {
    this.targetScore = score;
  }

  /**
   * Actualiza el componente en cada frame
   * @param deltaTime - Tiempo transcurrido desde la última actualización
   */
  update(deltaTime: number): void {
    // Animar la puntuación hacia el valor objetivo
    if (this.currentScore !== this.targetScore) {
      const difference = this.targetScore - this.currentScore;
      const change = difference * this.animationSpeed * (deltaTime / 16.67); // Normalizar a 60fps
      
      if (Math.abs(difference) < 1) {
        this.currentScore = this.targetScore;
      } else {
        this.currentScore += change;
      }
      
      this.scoreText.text = Math.floor(this.currentScore).toString();
      
      // Efecto visual cuando se actualiza la puntuación
      if (this.currentScore !== this.targetScore) {
        this.scoreText.scale.set(1.1);
      } else {
        this.scoreText.scale.set(1.0);
      }
    }
  }

  /**
   * Maneja el redimensionamiento de la ventana
   * @param width - Nuevo ancho de la ventana
   * @param height - Nuevo alto de la ventana
   */
  resize(_width: number, _height: number): void {
    // Posicionar en la esquina superior izquierda
    this.container.x = 20;
    this.container.y = 20;
  }

  /**
   * Obtiene la puntuación actual
   * @returns Puntuación actual
   */
  getCurrentScore(): number {
    return Math.floor(this.currentScore);
  }

  /**
   * Obtiene la puntuación objetivo
   * @returns Puntuación objetivo
   */
  getTargetScore(): number {
    return this.targetScore;
  }

  /**
   * Establece la velocidad de animación
   * @param speed - Velocidad de animación (0-1)
   */
  setAnimationSpeed(speed: number): void {
    this.animationSpeed = Math.max(0, Math.min(1, speed));
  }

  /**
   * Destruye el componente y libera recursos
   */
  destroy(): void {
    this.container.destroy();
  }
}
