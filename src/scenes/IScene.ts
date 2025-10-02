import { Container } from 'pixi.js';

/**
 * Interfaz que todas las escenas del juego deben implementar.
 * Define el contrato básico para el manejo de escenas en el SceneManager.
 */
export interface IScene {
  /** Contenedor principal de la escena */
  readonly container: Container;

  /**
   * Inicializa la escena cuando se activa
   * @param data - Datos opcionales pasados desde la escena anterior
   * @returns Promise que se resuelve cuando la inicialización está completa
   */
  enter(data?: any): Promise<void>;

  /**
   * Limpia la escena cuando se desactiva
   * @returns Promise que se resuelve cuando la limpieza está completa
   */
  exit(): Promise<void>;

  /**
   * Actualiza la escena en cada frame
   * @param deltaTime - Tiempo transcurrido desde la última actualización en milisegundos
   */
  update(deltaTime: number): void;

  /**
   * Maneja el redimensionamiento de la ventana
   * @param width - Nuevo ancho de la ventana
   * @param height - Nuevo alto de la ventana
   */
  resize(width: number, height: number): void;
}
