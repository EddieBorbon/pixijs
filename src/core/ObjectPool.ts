import { Container, Sprite } from 'pixi.js';

/**
 * Pool de objetos para reutilizar sprites y mejorar el rendimiento.
 * Especialmente útil para efectos de explosión, partículas y elementos de UI temporales.
 */
export class ObjectPool<T extends Container> {
  private pool: T[] = [];
  private createFn: () => T;
  private resetFn: (obj: T) => void;
  private maxSize: number;

  /**
   * @param createFn - Función que crea una nueva instancia del objeto
   * @param resetFn - Función que resetea el objeto a su estado inicial
   * @param maxSize - Tamaño máximo del pool (opcional, por defecto 50)
   */
  constructor(
    createFn: () => T,
    resetFn: (obj: T) => void,
    maxSize: number = 50
  ) {
    this.createFn = createFn;
    this.resetFn = resetFn;
    this.maxSize = maxSize;
  }

  /**
   * Obtiene un objeto del pool o crea uno nuevo si el pool está vacío
   * @returns Un objeto reutilizable del pool
   */
  get(): T {
    if (this.pool.length > 0) {
      return this.pool.pop()!;
    }
    return this.createFn();
  }

  /**
   * Devuelve un objeto al pool para su reutilización
   * @param obj - El objeto a devolver al pool
   */
  release(obj: T): void {
    if (this.pool.length < this.maxSize) {
      this.resetFn(obj);
      this.pool.push(obj);
    }
  }

  /**
   * Pre-carga el pool con objetos iniciales
   * @param count - Número de objetos a crear inicialmente
   */
  preload(count: number): void {
    for (let i = 0; i < count && i < this.maxSize; i++) {
      const obj = this.createFn();
      this.pool.push(obj);
    }
  }

  /**
   * Limpia el pool y libera todos los objetos
   */
  clear(): void {
    this.pool.length = 0;
  }

  /**
   * Obtiene el número de objetos disponibles en el pool
   */
  get availableCount(): number {
    return this.pool.length;
  }

  /**
   * Obtiene el número total de objetos que se pueden almacenar en el pool
   */
  get maxPoolSize(): number {
    return this.maxSize;
  }
}

/**
 * Pool especializado para sprites de explosión
 */
export class ExplosionPool extends ObjectPool<Sprite> {
  constructor(maxSize: number = 20) {
    super(
      () => {
        const sprite = new Sprite();
        sprite.anchor.set(0.5);
        sprite.visible = false;
        return sprite;
      },
      (sprite: Sprite) => {
        sprite.visible = false;
        sprite.alpha = 1;
        sprite.scale.set(1);
        sprite.rotation = 0;
        sprite.x = 0;
        sprite.y = 0;
      },
      maxSize
    );
  }
}

/**
 * Pool especializado para sprites de partículas
 */
export class ParticlePool extends ObjectPool<Sprite> {
  constructor(maxSize: number = 100) {
    super(
      () => {
        const sprite = new Sprite();
        sprite.anchor.set(0.5);
        sprite.visible = false;
        return sprite;
      },
      (sprite: Sprite) => {
        sprite.visible = false;
        sprite.alpha = 1;
        sprite.scale.set(1);
        sprite.rotation = 0;
        sprite.x = 0;
        sprite.y = 0;
        sprite.tint = 0xffffff;
      },
      maxSize
    );
  }
}
