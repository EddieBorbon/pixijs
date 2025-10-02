import { Sprite, Texture, Assets } from 'pixi.js';
import { GemColor, SpecialType, ObstacleType, Position, BOARD_CONFIG } from './constants';

/**
 * Representa una gema individual en el tablero del juego Match-3.
 * Maneja tanto el estado lógico como la representación visual de la gema.
 */
export class Gem {
  public sprite: Sprite;
  public color: GemColor;
  public specialType: SpecialType;
  public obstacleType: ObstacleType;
  public position: Position;
  public isSelected: boolean = false;
  public isAnimating: boolean = false;
  public obstacleState: number = 0; // Para animaciones de obstáculos (0 = intacto, 1 = dañado)
  private cellSize: number = BOARD_CONFIG.CELL_SIZE;
  public gemSize: number = BOARD_CONFIG.GEM_SIZE;

  constructor(
    color: GemColor,
    position: Position,
    specialType: SpecialType = SpecialType.NORMAL,
    obstacleType: ObstacleType = ObstacleType.NONE,
    texture?: Texture
  ) {
    this.color = color;
    this.position = position;
    this.specialType = specialType;
    this.obstacleType = obstacleType;
    
    // Crear el sprite de la gema
    this.sprite = new Sprite(texture);
    this.sprite.anchor.set(0.5);
    
    // Hacer la gema interactiva (nueva sintaxis de PixiJS v7+)
    this.sprite.eventMode = 'static';
    this.sprite.cursor = 'pointer';
    
    // Configurar posición visual
    this.updateVisualPosition();
    
    // Actualizar textura después de un pequeño delay para asegurar que Assets esté listo
    setTimeout(() => {
      this.updateTexture();
    }, 100);
  }

  /**
   * Actualiza la textura del sprite basándose en el color, tipo especial y obstáculo
   */
  updateTexture(): void {
    // Obtener la textura del cache de Assets
    const textureName = this.getTextureName();
    const texture = Assets.cache.get(textureName);
    
    if (texture) {
      this.sprite.texture = texture;
      
      // Log para verificar texturas especiales
      if (this.specialType !== SpecialType.NORMAL) {
        console.log(`Gema especial creada: ${this.color} ${this.specialType} con textura: ${textureName}`);
      }
    } else {
      console.warn(`No se encontró textura para: ${textureName}`);
    }
  }

  /**
   * Obtiene el nombre de la textura basándose en el color, tipo especial y obstáculo
   */
  private getTextureName(): string {
    // Si es un obstáculo, usar textura de obstáculo
    if (this.obstacleType === ObstacleType.MELTING_BLOCK) {
      return this.obstacleState === 0 ? 'block_melting_intact' : 'block_melting_damaged';
    } else if (this.obstacleType === ObstacleType.COOKIE) {
      return this.obstacleState === 0 ? 'cookie_intact' : 'cookie_destroyed';
    } else if (this.obstacleType === ObstacleType.BOMB) {
      return 'bomb';
    }
    
    // Si es una gema especial
    if (this.specialType === SpecialType.COLOR_BOMB) {
      return 'color_bomb';
    } else if (this.specialType === SpecialType.STRIPED_HORIZONTAL) {
      return `gem_${this.color}_striped_h`;
    } else if (this.specialType === SpecialType.STRIPED_VERTICAL) {
      return `gem_${this.color}_striped_v`;
    } else if (this.specialType === SpecialType.WRAPPED) {
      return `gem_${this.color}_wrapped`;
    } else {
      return `gem_${this.color}`;
    }
  }

  /**
   * Actualiza la posición visual del sprite basándose en la posición lógica
   */
  updateVisualPosition(): void {
    // Verificar que el sprite existe y no está destruido
    if (!this.sprite || this.sprite.destroyed) {
      return;
    }
    
    // Calcular posición en píxeles basándose en la posición del tablero
    const x = this.position.col * this.cellSize + this.cellSize / 2;
    const y = this.position.row * this.cellSize + this.cellSize / 2;
    
    this.sprite.x = x;
    this.sprite.y = y;
    
    // Ajustar el tamaño de la gema
    this.sprite.scale.set(this.gemSize / 64); // Escalar desde el tamaño original del atlas (64px)
  }

  /**
   * Selecciona o deselecciona la gema
   * @param selected - true para seleccionar, false para deseleccionar
   */
  setSelected(selected: boolean): void {
    this.isSelected = selected;
    
    // Verificar que el sprite aún existe antes de actualizar
    if (this.sprite && !this.sprite.destroyed) {
      this.updateSelectionVisual();
    }
  }

  /**
   * Actualiza la apariencia visual para mostrar el estado de selección
   */
  private updateSelectionVisual(): void {
    // Verificar que el sprite existe y no está destruido
    if (!this.sprite || this.sprite.destroyed) {
      return;
    }
    
    const baseScale = this.gemSize / 64; // Escalado base desde el atlas
    
    if (this.isSelected) {
      this.sprite.scale.set(baseScale * 1.05); // Escalado base + 5% de selección
      this.sprite.tint = 0xffff00; // Tinte amarillo para indicar selección
    } else {
      this.sprite.scale.set(baseScale); // Solo el escalado base
      this.sprite.tint = 0xffffff; // Sin tinte
    }
  }

  /**
   * Verifica si esta gema puede formar un match con otra gema
   * @param other - Otra gema para comparar
   * @returns true si pueden formar un match
   */
  canMatchWith(other: Gem): boolean {
    // Las bombas de color pueden hacer match con cualquier gema
    if (this.specialType === SpecialType.COLOR_BOMB || 
        other.specialType === SpecialType.COLOR_BOMB) {
      return true;
    }
    
    // Las gemas normales hacen match por color
    return this.color === other.color;
  }

  /**
   * Verifica si esta gema es adyacente a otra gema
   * @param other - Otra gema para verificar
   * @returns true si son adyacentes
   */
  isAdjacentTo(other: Gem): boolean {
    const rowDiff = Math.abs(this.position.row - other.position.row);
    const colDiff = Math.abs(this.position.col - other.position.col);
    
    // Adyacente si están en la misma fila o columna y la distancia es 1
    return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
  }

  /**
   * Verifica si esta gema es un obstáculo
   * @returns true si es un obstáculo
   */
  isObstacle(): boolean {
    return this.obstacleType !== ObstacleType.NONE;
  }

  /**
   * Verifica si esta gema es una bomba
   * @returns true si es una bomba
   */
  isBomb(): boolean {
    return this.obstacleType === ObstacleType.BOMB;
  }

  /**
   * Verifica si esta gema es un bloque que se derrite
   * @returns true si es un bloque que se derrite
   */
  isMeltingBlock(): boolean {
    return this.obstacleType === ObstacleType.MELTING_BLOCK;
  }

  /**
   * Verifica si esta gema es una galleta
   * @returns true si es una galleta
   */
  isCookie(): boolean {
    return this.obstacleType === ObstacleType.COOKIE;
  }

  /**
   * Daña un obstáculo (cambia su estado visual)
   */
  damageObstacle(): void {
    if (this.isObstacle() && this.obstacleState === 0) {
      this.obstacleState = 1;
      this.updateTexture();
    }
  }

  /**
   * Verifica si esta gema se puede mover
   * @returns true si se puede mover
   */
  canMove(): boolean {
    // Los obstáculos no se pueden mover
    return !this.isObstacle();
  }

  /**
   * Verifica si esta gema es especial
   * @returns true si la gema tiene un tipo especial
   */
  isSpecial(): boolean {
    return this.specialType !== SpecialType.NORMAL;
  }

  /**
   * Verifica si esta gema es una bomba de color
   * @returns true si es una bomba de color
   */
  isColorBomb(): boolean {
    return this.specialType === SpecialType.COLOR_BOMB;
  }

  /**
   * Verifica si esta gema es rayada (horizontal o vertical)
   * @returns true si es una gema rayada
   */
  isStriped(): boolean {
    return this.specialType === SpecialType.STRIPED_HORIZONTAL || 
           this.specialType === SpecialType.STRIPED_VERTICAL;
  }

  /**
   * Verifica si esta gema está envuelta
   * @returns true si es una gema envuelta
   */
  isWrapped(): boolean {
    return this.specialType === SpecialType.WRAPPED;
  }

  /**
   * Actualiza la configuración de tamaño de la gema
   * @param cellSize - Nuevo tamaño de celda
   * @param gemSize - Nuevo tamaño de gema
   */
  public updateConfig(cellSize: number, gemSize: number): void {
    this.cellSize = cellSize;
    this.gemSize = gemSize;
    this.updateVisualPosition();
  }

  /**
   * Crea una copia de esta gema con una nueva posición
   * @param newPosition - Nueva posición para la copia
   * @returns Una nueva instancia de Gem
   */
  clone(newPosition: Position): Gem {
    return new Gem(this.color, newPosition, this.specialType, this.obstacleType);
  }

  /**
   * Actualiza la posición lógica y visual de la gema
   * @param newPosition - Nueva posición
   */
  setPosition(newPosition: Position): void {
    this.position = newPosition;
    
    // Solo actualizar posición visual si el sprite existe
    if (this.sprite && !this.sprite.destroyed) {
      this.updateVisualPosition();
    }
  }

  /**
   * Destruye el sprite y libera recursos
   */
  destroy(): void {
    if (this.sprite && !this.sprite.destroyed) {
      this.sprite.destroy();
    }
    this.sprite = null as any; // Limpiar referencia
  }

  /**
   * Obtiene una representación en string de la gema para debugging
   */
  toString(): string {
    return `Gem(${this.color}, ${this.specialType}, [${this.position.row}, ${this.position.col}])`;
  }
}
