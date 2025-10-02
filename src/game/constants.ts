/**
 * Constantes del juego Match-3
 * Centraliza todos los valores configurables para facilitar el ajuste del juego
 */

// Configuración del tablero
export const BOARD_CONFIG = {
  ROWS: 8,
  COLUMNS: 8,
  CELL_SIZE: 50,
  GEM_SIZE: 28,
  BOARD_MARGIN: 32,
  MIN_MATCH_LENGTH: 3,
} as const;

// Tipos de gemas normales
export enum GemColor {
  YELLOW = 'yellow',
  BLUE = 'blue',
  RED = 'red',
  GREEN = 'green',
  PURPLE = 'purple',
}

// Tipos especiales de gemas
export enum SpecialType {
  NORMAL = 'normal',
  STRIPED_HORIZONTAL = 'striped_h',
  STRIPED_VERTICAL = 'striped_v',
  WRAPPED = 'wrapped',
  COLOR_BOMB = 'color_bomb',
}

// Tipos de obstáculos
export enum ObstacleType {
  NONE = 'none',
  MELTING_BLOCK = 'melting_block',
  COOKIE = 'cookie',
  BOMB = 'bomb',
}

// Configuración de animaciones
export const ANIMATION_CONFIG = {
  SWAP_DURATION: 300,
  FALL_DURATION: 500,
  EXPLOSION_DURATION: 400,
  REFILL_DELAY: 200,
  SPECIAL_CREATION_DELAY: 100,
} as const;

// Configuración de puntuación
export const SCORE_CONFIG = {
  MATCH_3: 100,
  MATCH_4: 300,
  MATCH_5: 500,
  SPECIAL_MULTIPLIER: 2,
  COMBO_MULTIPLIER: 1.5,
} as const;

// Configuración del juego
export const GAME_CONFIG = {
  INITIAL_MOVES: 30,
  TARGET_SCORE: 10000,
  MAX_MATCH_LENGTH: 5,
} as const;

// Nombres de texturas del atlas
export const TEXTURE_NAMES = {
  // Gemas normales
  GEMS: {
    [GemColor.YELLOW]: 'gem_yellow',
    [GemColor.BLUE]: 'gem_blue',
    [GemColor.RED]: 'gem_red',
    [GemColor.GREEN]: 'gem_green',
    [GemColor.PURPLE]: 'gem_purple',
  },
  
  // Gemas especiales
  SPECIAL_GEMS: {
    [SpecialType.STRIPED_HORIZONTAL]: {
      [GemColor.YELLOW]: 'gem_yellow_striped_h',
      [GemColor.BLUE]: 'gem_blue_striped_h',
      [GemColor.RED]: 'gem_red_striped_h',
      [GemColor.GREEN]: 'gem_green_striped_h',
      [GemColor.PURPLE]: 'gem_purple_striped_h',
    },
    [SpecialType.STRIPED_VERTICAL]: {
      [GemColor.YELLOW]: 'gem_yellow_striped_v',
      [GemColor.BLUE]: 'gem_blue_striped_v',
      [GemColor.RED]: 'gem_red_striped_v',
      [GemColor.GREEN]: 'gem_green_striped_v',
      [GemColor.PURPLE]: 'gem_purple_striped_v',
    },
    [SpecialType.WRAPPED]: {
      [GemColor.YELLOW]: 'gem_yellow_wrapped',
      [GemColor.BLUE]: 'gem_blue_wrapped',
      [GemColor.RED]: 'gem_red_wrapped',
      [GemColor.GREEN]: 'gem_green_wrapped',
      [GemColor.PURPLE]: 'gem_purple_wrapped',
    },
    [SpecialType.COLOR_BOMB]: 'color_bomb',
  },
  
  // Efectos y UI
  EFFECTS: {
    EXPLOSION: 'explosion_particle',
    BACKGROUND_TILE: 'background_tile',
  },
} as const;

// Eventos del juego
export const GAME_EVENTS = {
  GEM_SELECTED: 'gem_selected',
  GEM_DESELECTED: 'gem_deselected',
  SWAP_STARTED: 'swap_started',
  SWAP_COMPLETED: 'swap_completed',
  MATCH_FOUND: 'match_found',
  MATCH_PROCESSED: 'match_processed',
  SPECIAL_GEM_CREATED: 'special_gem_created',
  BOARD_UPDATED: 'board_updated',
  SCORE_UPDATED: 'score_updated',
  MOVES_UPDATED: 'moves_updated',
  GAME_OVER: 'game_over',
  LEVEL_COMPLETE: 'level_complete',
} as const;

// Direcciones para el análisis del tablero
export const DIRECTIONS = {
  UP: { row: -1, col: 0 },
  DOWN: { row: 1, col: 0 },
  LEFT: { row: 0, col: -1 },
  RIGHT: { row: 0, col: 1 },
} as const;

// Utilidades para trabajar con posiciones
export interface Position {
  row: number;
  col: number;
}

export interface Match {
  positions: Position[];
  color: GemColor;
  specialType?: SpecialType;
}
