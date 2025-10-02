import { Application } from 'pixi.js';
import { IScene } from '../scenes/IScene';

/**
 * Gestor de escenas que maneja la transición entre diferentes estados del juego.
 * Implementa el patrón State para gestionar las escenas de manera eficiente.
 */
export class SceneManager {
  private app: Application;
  private currentScene: IScene | null = null;
  private scenes: Map<string, IScene> = new Map();

  constructor(app: Application) {
    this.app = app;
  }

  /**
   * Registra una nueva escena en el gestor
   * @param name - Nombre único de la escena
   * @param scene - Instancia de la escena
   */
  registerScene(name: string, scene: IScene): void {
    this.scenes.set(name, scene);
  }

  /**
   * Cambia a una escena específica
   * @param name - Nombre de la escena a activar
   * @param data - Datos opcionales a pasar a la nueva escena
   */
  async changeScene(name: string, data?: any): Promise<void> {
    const newScene = this.scenes.get(name);
    
    if (!newScene) {
      console.error(`Escena '${name}' no encontrada`);
      return;
    }

    // Limpiar la escena actual
    if (this.currentScene) {
      await this.currentScene.exit();
      this.app.stage.removeChild(this.currentScene.container);
    }

    // Configurar y activar la nueva escena
    this.currentScene = newScene;
    this.app.stage.addChild(this.currentScene.container);
    
    try {
      await this.currentScene.enter(data);
    } catch (error) {
      console.error(`Error al inicializar la escena '${name}':`, error);
    }
  }

  /**
   * Obtiene la escena actualmente activa
   * @returns La escena actual o null si no hay ninguna activa
   */
  getCurrentScene(): IScene | null {
    return this.currentScene;
  }

  /**
   * Obtiene una escena específica por nombre
   * @param name - Nombre de la escena
   * @returns La escena o undefined si no existe
   */
  getScene(name: string): IScene | undefined {
    return this.scenes.get(name);
  }

  /**
   * Verifica si una escena está registrada
   * @param name - Nombre de la escena
   * @returns true si la escena está registrada
   */
  hasScene(name: string): boolean {
    return this.scenes.has(name);
  }

  /**
   * Actualiza la escena actual (debe llamarse en el game loop)
   * @param deltaTime - Tiempo transcurrido desde la última actualización
   */
  update(deltaTime: number): void {
    if (this.currentScene) {
      this.currentScene.update(deltaTime);
    }
  }

  /**
   * Limpia todas las escenas registradas
   */
  clear(): void {
    if (this.currentScene) {
      this.currentScene.exit();
      this.app.stage.removeChild(this.currentScene.container);
      this.currentScene = null;
    }
    
    this.scenes.clear();
  }

  /**
   * Obtiene el número de escenas registradas
   */
  get sceneCount(): number {
    return this.scenes.size;
  }

  /**
   * Obtiene los nombres de todas las escenas registradas
   */
  get sceneNames(): string[] {
    return Array.from(this.scenes.keys());
  }
}
