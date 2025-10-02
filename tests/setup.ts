/**
 * Configuración global para las pruebas de Vitest
 * Configura el entorno de pruebas y mocks necesarios
 */

// Mock de PixiJS para las pruebas
(global as any).PIXI = {
  Graphics: class MockGraphics {
    beginFill() {}
    drawCircle() {}
    endFill() {}
    lineStyle() {}
  },
  Texture: {
    EMPTY: 'mock-texture-empty'
  }
} as any;

// Mock del DOM para pruebas
Object.defineProperty(window, 'devicePixelRatio', {
  value: 1,
  writable: true
});

// Mock de requestAnimationFrame
global.requestAnimationFrame = (callback: FrameRequestCallback) => {
  return setTimeout(callback, 16);
};

global.cancelAnimationFrame = (id: number) => {
  clearTimeout(id);
};

console.log('Configuración de pruebas cargada');
