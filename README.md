# Match-3 Game - Demostración Técnica

Un juego Match-3 profesional desarrollado con **TypeScript** y **PixiJS v7+**, diseñado como una demostración técnica que muestra arquitectura de software avanzada, mejores prácticas de desarrollo y optimización de rendimiento.

## 🎮 Características del Juego

- **Juego Match-3 clásico** similar a Candy Crush
- **Gemas especiales**: Rayadas (horizontal/vertical), Envueltas y Bombas de Color
- **Sistema de puntuación** con multiplicadores y combos
- **Interfaz responsive** con efectos visuales atractivos
- **Integración con Facebook Instant Games** (simulada)

## 🛠️ Stack Tecnológico

- **Lenguaje**: TypeScript (tipado estricto)
- **Motor de Renderizado**: PixiJS v7+
- **Build Tool**: Vite
- **Testing**: Vitest
- **Arquitectura**: Patrón MVC con Event-Driven Architecture

## 🏗️ Arquitectura del Proyecto

```
src/
├── main.ts               # Punto de entrada principal
├── core/                 # Sistemas fundamentales
│   ├── SceneManager.ts   # Gestión de escenas
│   ├── EventEmitter.ts   # Sistema de eventos
│   └── ObjectPool.ts     # Pool de objetos para optimización
├── game/                 # Lógica del juego
│   ├── Board.ts          # Tablero principal
│   ├── Gem.ts            # Clase de gemas
│   └── constants.ts      # Constantes del juego
├── scenes/               # Escenas del juego
│   ├── IScene.ts         # Interfaz de escenas
│   └── GameScene.ts      # Escena principal
├── ui/                   # Componentes de interfaz
│   ├── ScoreDisplay.ts   # Display de puntuación
│   └── MovesDisplay.ts   # Display de movimientos
└── services/             # Servicios externos
    └── FacebookMock.ts   # Mock del SDK de Facebook
```

## 🚀 Instalación y Ejecución

### Prerrequisitos
- Node.js 18+ 
- npm o yarn

### Instalación
```bash
# Clonar el repositorio
git clone <repository-url>
cd match3-game

# Instalar dependencias
npm install

# Ejecutar en modo desarrollo
npm run dev

# Ejecutar pruebas
npm test

# Construir para producción
npm run build
```

## 🎯 Características Técnicas Destacadas

### 1. **Arquitectura de Alto Rendimiento**
- **Object Pooling**: Reutilización de sprites para efectos y partículas
- **Event-Driven Architecture**: Desacoplamiento completo entre componentes
- **Scene Management**: Sistema robusto de gestión de escenas
- **Async/Await**: Flujo de juego asíncrono para animaciones fluidas

### 2. **Lógica de Juego Avanzada**
- **Detección de Matches**: Algoritmo eficiente para encontrar coincidencias
- **Gemas Especiales**: Sistema completo de creación y activación
- **Cascadas**: Sistema de caída y relleno automático
- **Validación de Movimientos**: Prevención de movimientos inválidos

### 3. **Optimizaciones de Rendimiento**
- **PIXI.ParticleContainer**: Para efectos con muchas partículas
- **Texture Atlasing**: Gestión eficiente de texturas
- **Delta Time**: Animaciones independientes del framerate
- **Memory Management**: Limpieza automática de recursos

### 4. **Testing y Calidad**
- **Pruebas Unitarias**: Cobertura completa de la lógica del juego
- **TypeScript Estricto**: Tipado fuerte para prevenir errores
- **Error Handling**: Manejo robusto de errores y estados edge
- **Code Documentation**: Documentación completa en JSDoc

## 🎮 Mecánicas del Juego

### Gemas Normales
- **5 colores**: Amarillo, Azul, Rojo, Verde, Púrpura
- **Match mínimo**: 3 gemas en línea (horizontal o vertical)

### Gemas Especiales
- **Gema Rayada**: Se crea con matches de 4 gemas
  - Horizontal: Elimina toda la fila
  - Vertical: Elimina toda la columna
- **Gema Envuelta**: Se crea con matches en forma de L o T
  - Explota en área 3x3
- **Bomba de Color**: Se crea con matches de 5 gemas
  - Elimina todas las gemas del mismo color

### Sistema de Puntuación
- **Match de 3**: 100 puntos
- **Match de 4**: 300 puntos  
- **Match de 5**: 500 puntos
- **Multiplicadores**: Por gemas especiales y combos

## 🧪 Testing

El proyecto incluye pruebas unitarias completas usando Vitest:

```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas en modo watch
npm run test:watch

# Ejecutar pruebas con UI
npm run test:ui
```

### Cobertura de Pruebas
- ✅ Detección de matches horizontales y verticales
- ✅ Creación de gemas especiales
- ✅ Lógica de adyacencia
- ✅ Validación de posiciones
- ✅ Estados edge del tablero

## 📱 Integración con Facebook Instant Games

El proyecto incluye un mock completo del SDK de Facebook Instant Games que simula:

- **Inicialización del SDK**
- **Gestión de puntuaciones**
- **Leaderboards**
- **Invitaciones y desafíos**
- **Estados del jugador**

## 🎨 Personalización

### Configuración del Juego
Todas las constantes están centralizadas en `src/game/constants.ts`:

```typescript
export const BOARD_CONFIG = {
  ROWS: 8,
  COLUMNS: 8,
  CELL_SIZE: 64,
  BOARD_MARGIN: 32,
} as const;

export const SCORE_CONFIG = {
  MATCH_3: 100,
  MATCH_4: 300,
  MATCH_5: 500,
  SPECIAL_MULTIPLIER: 2,
} as const;
```

### Assets y Texturas
El juego está preparado para usar un atlas de texturas con nombres específicos:

```typescript
// Gemas normales
gem_yellow.png, gem_blue.png, gem_red.png, gem_green.png, gem_purple.png

// Gemas especiales
gem_yellow_striped_h.png, gem_red_wrapped.png, color_bomb.png

// Efectos
explosion_particle.png, background_tile.png
```

## 🚀 Despliegue

### Desarrollo Local
```bash
npm run dev
```

### Producción
```bash
npm run build
npm run preview
```

### Facebook Instant Games
El proyecto está preparado para ser desplegado en Facebook Instant Games con mínimas modificaciones.

## 📈 Próximas Mejoras

- [ ] **Animaciones avanzadas** con easing y tweening
- [ ] **Efectos de partículas** más elaborados
- [ ] **Sistema de niveles** con objetivos específicos
- [ ] **Power-ups adicionales** (rayo, martillo, etc.)
- [ ] **Modo multijugador** en tiempo real
- [ ] **Analytics** y métricas de juego
- [ ] **Localización** a múltiples idiomas

## 🤝 Contribución

Este proyecto es una demostración técnica, pero las contribuciones son bienvenidas:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 👨‍💻 Autor

Desarrollado como demostración técnica para postulación laboral, mostrando:
- Arquitectura de software avanzada
- Mejores prácticas de TypeScript
- Optimización de rendimiento
- Testing comprehensivo
- Documentación profesional

---

**¡Disfruta jugando y explorando el código!** 🎮✨
