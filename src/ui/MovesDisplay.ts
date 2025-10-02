import { Container, Text, TextStyle, Graphics } from 'pixi.js';

/**
 * Componente de UI que muestra los movimientos restantes del jugador.
 * Incluye indicadores visuales cuando quedan pocos movimientos.
 */
export class MovesDisplay {
  public readonly container: Container;
  
  private movesText!: Text;
  private background!: Graphics;
  private currentMoves: number = 0;
  private warningThreshold: number = 5; // Mostrar advertencia cuando queden 5 o menos movimientos

  constructor() {
    this.container = new Container();
    this.setupUI();
  }

  /**
   * Configura los elementos de UI del display de movimientos
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
    
    const labelText = new Text('MOVIMIENTOS', labelStyle);
    labelText.anchor.set(0.5);
    labelText.x = 100;
    labelText.y = 15;
    
    // Crear texto de movimientos
    const movesStyle = new TextStyle({
      fontFamily: 'Arial',
      fontSize: 24,
      fill: 0x27ae60,
      fontWeight: 'bold',
      align: 'center'
    });
    
    this.movesText = new Text('0', movesStyle);
    this.movesText.anchor.set(0.5);
    this.movesText.x = 100;
    this.movesText.y = 40;
    
    // Agregar elementos al contenedor
    this.container.addChild(this.background);
    this.container.addChild(labelText);
    this.container.addChild(this.movesText);
  }

  /**
   * Actualiza los movimientos mostrados
   * @param moves - Nuevos movimientos restantes
   */
  updateMoves(moves: number): void {
    this.currentMoves = moves;
    this.movesText.text = moves.toString();
    
    // Cambiar color según la cantidad de movimientos restantes
    this.updateVisualState();
  }

  /**
   * Actualiza el componente en cada frame
   * @param deltaTime - Tiempo transcurrido desde la última actualización
   */
  update(deltaTime: number): void {
    // Efecto de parpadeo cuando quedan pocos movimientos
    if (this.currentMoves <= this.warningThreshold && this.currentMoves > 0) {
      const blinkSpeed = 0.01 * deltaTime;
      this.movesText.alpha = 0.5 + 0.5 * Math.sin(Date.now() * blinkSpeed);
    } else {
      this.movesText.alpha = 1.0;
    }
  }

  /**
   * Actualiza el estado visual basándose en los movimientos restantes
   */
  private updateVisualState(): void {
    if (this.currentMoves <= 0) {
      // Sin movimientos - color rojo
      this.movesText.style.fill = 0xe74c3c;
      this.background.tint = 0xff0000;
    } else if (this.currentMoves <= this.warningThreshold) {
      // Pocos movimientos - color naranja
      this.movesText.style.fill = 0xf39c12;
      this.background.tint = 0xffa500;
    } else {
      // Movimientos normales - color verde
      this.movesText.style.fill = 0x27ae60;
      this.background.tint = 0xffffff;
    }
  }

  /**
   * Maneja el redimensionamiento de la ventana
   * @param width - Nuevo ancho de la ventana
   * @param height - Nuevo alto de la ventana
   */
  resize(width: number, _height: number): void {
    // Posicionar en la esquina superior derecha
    this.container.x = width - 220;
    this.container.y = 20;
  }

  /**
   * Obtiene los movimientos actuales
   * @returns Movimientos restantes
   */
  getCurrentMoves(): number {
    return this.currentMoves;
  }

  /**
   * Establece el umbral de advertencia
   * @param threshold - Número de movimientos para mostrar advertencia
   */
  setWarningThreshold(threshold: number): void {
    this.warningThreshold = Math.max(1, threshold);
  }

  /**
   * Verifica si quedan pocos movimientos
   * @returns true si quedan pocos movimientos
   */
  isLowOnMoves(): boolean {
    return this.currentMoves <= this.warningThreshold && this.currentMoves > 0;
  }

  /**
   * Verifica si se han agotado los movimientos
   * @returns true si no quedan movimientos
   */
  isOutOfMoves(): boolean {
    return this.currentMoves <= 0;
  }

  /**
   * Destruye el componente y libera recursos
   */
  destroy(): void {
    this.container.destroy();
  }
}
