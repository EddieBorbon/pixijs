import { describe, it, expect, beforeEach } from 'vitest';
import { Board } from '../src/game/Board';
import { Gem } from '../src/game/Gem';
import { GemColor, SpecialType, BOARD_CONFIG, Position } from '../src/game/constants';
import { EventEmitter } from '../src/core/EventEmitter';

/**
 * Pruebas unitarias para la lógica del tablero del juego Match-3.
 * Verifica el funcionamiento correcto de la detección de matches y la lógica del juego.
 */
describe('Board Logic Tests', () => {
  let board: Board;
  let eventEmitter: EventEmitter;

  beforeEach(() => {
    eventEmitter = new EventEmitter();
    board = new Board(eventEmitter);
  });

  describe('findMatchesInBoard', () => {
    it('debería encontrar matches horizontales de 3 gemas', () => {
      // Crear un tablero con un match horizontal
      const testBoard: (Gem | null)[][] = [
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null],
        [null, null, null, null, null, null, null, null]
      ];

      // Crear gemas del mismo color en línea horizontal
      const gem1 = new Gem(GemColor.RED, { row: 3, col: 2 });
      const gem2 = new Gem(GemColor.RED, { row: 3, col: 3 });
      const gem3 = new Gem(GemColor.RED, { row: 3, col: 4 });

      testBoard[3][2] = gem1;
      testBoard[3][3] = gem2;
      testBoard[3][4] = gem3;

      const matches = board.findMatchesInBoard(testBoard);

      expect(matches).toHaveLength(1);
      expect(matches[0].positions).toHaveLength(3);
      expect(matches[0].color).toBe(GemColor.RED);
    });

    it('debería encontrar matches verticales de 3 gemas', () => {
      const testBoard: (Gem | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));

      // Crear gemas del mismo color en línea vertical
      const gem1 = new Gem(GemColor.BLUE, { row: 2, col: 3 });
      const gem2 = new Gem(GemColor.BLUE, { row: 3, col: 3 });
      const gem3 = new Gem(GemColor.BLUE, { row: 4, col: 3 });

      testBoard[2][3] = gem1;
      testBoard[3][3] = gem2;
      testBoard[4][3] = gem3;

      const matches = board.findMatchesInBoard(testBoard);

      expect(matches).toHaveLength(1);
      expect(matches[0].positions).toHaveLength(3);
      expect(matches[0].color).toBe(GemColor.BLUE);
    });

    it('debería encontrar matches de 4 gemas', () => {
      const testBoard: (Gem | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));

      // Crear match de 4 gemas horizontales
      const gem1 = new Gem(GemColor.GREEN, { row: 3, col: 1 });
      const gem2 = new Gem(GemColor.GREEN, { row: 3, col: 2 });
      const gem3 = new Gem(GemColor.GREEN, { row: 3, col: 3 });
      const gem4 = new Gem(GemColor.GREEN, { row: 3, col: 4 });

      testBoard[3][1] = gem1;
      testBoard[3][2] = gem2;
      testBoard[3][3] = gem3;
      testBoard[3][4] = gem4;

      const matches = board.findMatchesInBoard(testBoard);

      expect(matches).toHaveLength(1);
      expect(matches[0].positions).toHaveLength(4);
      expect(matches[0].color).toBe(GemColor.GREEN);
    });

    it('debería encontrar matches de 5 gemas', () => {
      const testBoard: (Gem | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));

      // Crear match de 5 gemas verticales
      const gem1 = new Gem(GemColor.PURPLE, { row: 1, col: 3 });
      const gem2 = new Gem(GemColor.PURPLE, { row: 2, col: 3 });
      const gem3 = new Gem(GemColor.PURPLE, { row: 3, col: 3 });
      const gem4 = new Gem(GemColor.PURPLE, { row: 4, col: 3 });
      const gem5 = new Gem(GemColor.PURPLE, { row: 5, col: 3 });

      testBoard[1][3] = gem1;
      testBoard[2][3] = gem2;
      testBoard[3][3] = gem3;
      testBoard[4][3] = gem4;
      testBoard[5][3] = gem5;

      const matches = board.findMatchesInBoard(testBoard);

      expect(matches).toHaveLength(1);
      expect(matches[0].positions).toHaveLength(5);
      expect(matches[0].color).toBe(GemColor.PURPLE);
    });

    it('debería encontrar múltiples matches', () => {
      const testBoard: (Gem | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));

      // Match horizontal
      testBoard[2][1] = new Gem(GemColor.RED, { row: 2, col: 1 });
      testBoard[2][2] = new Gem(GemColor.RED, { row: 2, col: 2 });
      testBoard[2][3] = new Gem(GemColor.RED, { row: 2, col: 3 });

      // Match vertical
      testBoard[4][5] = new Gem(GemColor.BLUE, { row: 4, col: 5 });
      testBoard[5][5] = new Gem(GemColor.BLUE, { row: 5, col: 5 });
      testBoard[6][5] = new Gem(GemColor.BLUE, { row: 6, col: 5 });

      const matches = board.findMatchesInBoard(testBoard);

      expect(matches).toHaveLength(2);
    });

    it('no debería encontrar matches de menos de 3 gemas', () => {
      const testBoard: (Gem | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));

      // Solo 2 gemas del mismo color
      testBoard[3][3] = new Gem(GemColor.YELLOW, { row: 3, col: 3 });
      testBoard[3][4] = new Gem(GemColor.YELLOW, { row: 3, col: 4 });

      const matches = board.findMatchesInBoard(testBoard);

      expect(matches).toHaveLength(0);
    });

    it('no debería encontrar matches con gemas de diferentes colores', () => {
      const testBoard: (Gem | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));

      // Gemas de diferentes colores
      testBoard[3][3] = new Gem(GemColor.RED, { row: 3, col: 3 });
      testBoard[3][4] = new Gem(GemColor.BLUE, { row: 3, col: 4 });
      testBoard[3][5] = new Gem(GemColor.GREEN, { row: 3, col: 5 });

      const matches = board.findMatchesInBoard(testBoard);

      expect(matches).toHaveLength(0);
    });
  });

  describe('Gem Logic', () => {
    it('debería verificar correctamente si dos gemas pueden hacer match', () => {
      const gem1 = new Gem(GemColor.RED, { row: 0, col: 0 });
      const gem2 = new Gem(GemColor.RED, { row: 0, col: 1 });
      const gem3 = new Gem(GemColor.BLUE, { row: 0, col: 2 });

      expect(gem1.canMatchWith(gem2)).toBe(true);
      expect(gem1.canMatchWith(gem3)).toBe(false);
    });

    it('debería verificar correctamente si dos gemas son adyacentes', () => {
      const gem1 = new Gem(GemColor.RED, { row: 3, col: 3 });
      const gem2 = new Gem(GemColor.BLUE, { row: 3, col: 4 }); // Adyacente horizontal
      const gem3 = new Gem(GemColor.GREEN, { row: 4, col: 3 }); // Adyacente vertical
      const gem4 = new Gem(GemColor.YELLOW, { row: 5, col: 5 }); // No adyacente

      expect(gem1.isAdjacentTo(gem2)).toBe(true);
      expect(gem1.isAdjacentTo(gem3)).toBe(true);
      expect(gem1.isAdjacentTo(gem4)).toBe(false);
    });

    it('debería identificar correctamente gemas especiales', () => {
      const normalGem = new Gem(GemColor.RED, { row: 0, col: 0 });
      const stripedGem = new Gem(GemColor.BLUE, { row: 0, col: 1 }, SpecialType.STRIPED_HORIZONTAL);
      const wrappedGem = new Gem(GemColor.GREEN, { row: 0, col: 2 }, SpecialType.WRAPPED);
      const colorBomb = new Gem(GemColor.PURPLE, { row: 0, col: 3 }, SpecialType.COLOR_BOMB);

      expect(normalGem.isSpecial()).toBe(false);
      expect(stripedGem.isSpecial()).toBe(true);
      expect(wrappedGem.isSpecial()).toBe(true);
      expect(colorBomb.isSpecial()).toBe(true);

      expect(stripedGem.isStriped()).toBe(true);
      expect(wrappedGem.isWrapped()).toBe(true);
      expect(colorBomb.isColorBomb()).toBe(true);
    });

    it('debería permitir que las bombas de color hagan match con cualquier gema', () => {
      const colorBomb = new Gem(GemColor.RED, { row: 0, col: 0 }, SpecialType.COLOR_BOMB);
      const redGem = new Gem(GemColor.RED, { row: 0, col: 1 });
      const blueGem = new Gem(GemColor.BLUE, { row: 0, col: 2 });

      expect(colorBomb.canMatchWith(redGem)).toBe(true);
      expect(colorBomb.canMatchWith(blueGem)).toBe(true);
      expect(redGem.canMatchWith(colorBomb)).toBe(true);
      expect(blueGem.canMatchWith(colorBomb)).toBe(true);
    });
  });

  describe('Board State Management', () => {
    it('debería obtener correctamente una gema en una posición específica', () => {
      const position: Position = { row: 3, col: 4 };
      const gem = board.getGemAt(position);

      expect(gem).toBeDefined();
      expect(gem?.position).toEqual(position);
    });

    it('debería retornar null para posiciones inválidas', () => {
      const invalidPosition1: Position = { row: -1, col: 0 };
      const invalidPosition2: Position = { row: 0, col: -1 };
      const invalidPosition3: Position = { row: BOARD_CONFIG.ROWS, col: 0 };
      const invalidPosition4: Position = { row: 0, col: BOARD_CONFIG.COLUMNS };

      expect(board.getGemAt(invalidPosition1)).toBeNull();
      expect(board.getGemAt(invalidPosition2)).toBeNull();
      expect(board.getGemAt(invalidPosition3)).toBeNull();
      expect(board.getGemAt(invalidPosition4)).toBeNull();
    });

    it('debería inicializar con el número correcto de movimientos', () => {
      expect(board.getMoves()).toBe(30); // GAME_CONFIG.INITIAL_MOVES
    });

    it('debería inicializar con puntuación en 0', () => {
      expect(board.getScore()).toBe(0);
    });
  });

  describe('Edge Cases', () => {
    it('debería manejar correctamente un tablero completamente vacío', () => {
      const emptyBoard: (Gem | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));
      const matches = board.findMatchesInBoard(emptyBoard);

      expect(matches).toHaveLength(0);
    });

    it('debería manejar correctamente matches en los bordes del tablero', () => {
      const testBoard: (Gem | null)[][] = Array(8).fill(null).map(() => Array(8).fill(null));

      // Match en la primera fila
      testBoard[0][0] = new Gem(GemColor.RED, { row: 0, col: 0 });
      testBoard[0][1] = new Gem(GemColor.RED, { row: 0, col: 1 });
      testBoard[0][2] = new Gem(GemColor.RED, { row: 0, col: 2 });

      // Match en la última columna
      testBoard[5][7] = new Gem(GemColor.BLUE, { row: 5, col: 7 });
      testBoard[6][7] = new Gem(GemColor.BLUE, { row: 6, col: 7 });
      testBoard[7][7] = new Gem(GemColor.BLUE, { row: 7, col: 7 });

      const matches = board.findMatchesInBoard(testBoard);

      expect(matches).toHaveLength(2);
    });
  });
});
