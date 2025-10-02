/**
 * Sistema de eventos simple y eficiente para desacoplar componentes del juego.
 * Permite que diferentes partes del juego se comuniquen sin dependencias directas.
 */
export class EventEmitter {
  private events: Map<string, Function[]> = new Map();

  /**
   * Suscribe un listener a un evento específico
   * @param event - Nombre del evento
   * @param listener - Función callback que se ejecutará cuando ocurra el evento
   */
  on(event: string, listener: Function): void {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event)!.push(listener);
  }

  /**
   * Desuscribe un listener de un evento específico
   * @param event - Nombre del evento
   * @param listener - Función callback a remover
   */
  off(event: string, listener: Function): void {
    const listeners = this.events.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emite un evento y ejecuta todos los listeners suscritos
   * @param event - Nombre del evento
   * @param data - Datos opcionales a pasar a los listeners
   */
  emit(event: string, data?: any): void {
    const listeners = this.events.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error ejecutando listener para evento '${event}':`, error);
        }
      });
    }
  }

  /**
   * Suscribe un listener que se ejecutará solo una vez
   * @param event - Nombre del evento
   * @param listener - Función callback que se ejecutará una sola vez
   */
  once(event: string, listener: Function): void {
    const onceWrapper = (data: any) => {
      listener(data);
      this.off(event, onceWrapper);
    };
    this.on(event, onceWrapper);
  }

  /**
   * Limpia todos los listeners de un evento específico
   * @param event - Nombre del evento
   */
  removeAllListeners(event: string): void {
    this.events.delete(event);
  }

  /**
   * Limpia todos los eventos y listeners
   */
  clear(): void {
    this.events.clear();
  }
}
