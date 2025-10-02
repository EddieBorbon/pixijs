/**
 * Simulación del SDK de Facebook Instant Games.
 * Proporciona una interfaz mock para las funcionalidades de Facebook Instant Games
 * que permite desarrollar y probar el juego sin depender del SDK real.
 */
export class FacebookMock {
  private static instance: FacebookMock;
  private isInitialized: boolean = false;
  private playerData: any = {};
  private leaderboardData: any[] = [];

  private constructor() {
    this.initializeMockData();
  }

  /**
   * Obtiene la instancia singleton del mock
   * @returns Instancia del FacebookMock
   */
  public static getInstance(): FacebookMock {
    if (!FacebookMock.instance) {
      FacebookMock.instance = new FacebookMock();
    }
    return FacebookMock.instance;
  }

  /**
   * Inicializa los datos mock
   */
  private initializeMockData(): void {
    this.playerData = {
      id: 'mock_player_123',
      name: 'Jugador Mock',
      photo: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      locale: 'es_ES',
      platform: 'WEB'
    };

    // Datos de leaderboard mock
    this.leaderboardData = [
      { playerID: 'player_1', score: 50000, playerName: 'Jugador Pro' },
      { playerID: 'player_2', score: 45000, playerName: 'Gamer Master' },
      { playerID: 'player_3', score: 40000, playerName: 'Match3 King' },
      { playerID: 'player_4', score: 35000, playerName: 'Candy Crusher' },
      { playerID: 'player_5', score: 30000, playerName: 'Gem Hunter' }
    ];
  }

  /**
   * Simula la inicialización del SDK
   * @returns Promise que se resuelve cuando la inicialización está completa
   */
  public async initializeAsync(): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isInitialized = true;
        console.log('Facebook Instant Games SDK inicializado (MOCK)');
        resolve();
      }, 1000); // Simular tiempo de inicialización
    });
  }

  /**
   * Obtiene información del jugador actual
   * @returns Información del jugador
   */
  public getPlayer(): any {
    if (!this.isInitialized) {
      throw new Error('SDK no inicializado');
    }
    return this.playerData;
  }

  /**
   * Establece la puntuación del jugador
   * @param score - Puntuación a establecer
   * @returns Promise que se resuelve cuando la puntuación se establece
   */
  public async setScoreAsync(score: number): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('SDK no inicializado');
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Puntuación establecida: ${score}`);
        
        // Simular actualización del leaderboard
        this.updateLeaderboard(score);
        
        resolve();
      }, 500); // Simular tiempo de red
    });
  }

  /**
   * Obtiene el leaderboard
   * @param contextID - ID del contexto (opcional)
   * @returns Promise con los datos del leaderboard
   */
  public async getLeaderboardAsync(contextID?: string): Promise<any[]> {
    if (!this.isInitialized) {
      throw new Error('SDK no inicializado');
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([...this.leaderboardData]);
      }, 300);
    });
  }

  /**
   * Actualiza el leaderboard con la nueva puntuación
   * @param score - Nueva puntuación
   */
  private updateLeaderboard(score: number): void {
    const playerID = this.playerData.id;
    const playerName = this.playerData.name;
    
    // Buscar si el jugador ya existe en el leaderboard
    const existingIndex = this.leaderboardData.findIndex(entry => entry.playerID === playerID);
    
    if (existingIndex !== -1) {
      // Actualizar puntuación existente si es mayor
      if (score > this.leaderboardData[existingIndex].score) {
        this.leaderboardData[existingIndex].score = score;
        console.log(`Puntuación actualizada para ${playerName}: ${score}`);
      }
    } else {
      // Agregar nueva entrada
      this.leaderboardData.push({
        playerID,
        score,
        playerName
      });
      console.log(`Nueva entrada en leaderboard para ${playerName}: ${score}`);
    }
    
    // Ordenar por puntuación descendente
    this.leaderboardData.sort((a, b) => b.score - a.score);
    
    // Mantener solo los top 10
    if (this.leaderboardData.length > 10) {
      this.leaderboardData = this.leaderboardData.slice(0, 10);
    }
  }

  /**
   * Simula el inicio de un juego
   * @returns Promise que se resuelve cuando el juego inicia
   */
  public async startGameAsync(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('SDK no inicializado');
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Juego iniciado en Facebook Instant Games (MOCK)');
        resolve();
      }, 200);
    });
  }

  /**
   * Simula el fin de un juego
   * @returns Promise que se resuelve cuando el juego termina
   */
  public async endGameAsync(): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('SDK no inicializado');
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        console.log('Juego terminado en Facebook Instant Games (MOCK)');
        resolve();
      }, 200);
    });
  }

  /**
   * Simula el envío de una invitación
   * @param message - Mensaje de invitación
   * @returns Promise que se resuelve cuando la invitación se envía
   */
  public async sendInviteAsync(message: string): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('SDK no inicializado');
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Invitación enviada: ${message}`);
        resolve();
      }, 500);
    });
  }

  /**
   * Simula el envío de una solicitud de desafío
   * @param message - Mensaje del desafío
   * @param score - Puntuación a desafiar
   * @returns Promise que se resuelve cuando el desafío se envía
   */
  public async sendChallengeAsync(message: string, score: number): Promise<void> {
    if (!this.isInitialized) {
      throw new Error('SDK no inicializado');
    }

    return new Promise((resolve) => {
      setTimeout(() => {
        console.log(`Desafío enviado: ${message} (Puntuación: ${score})`);
        resolve();
      }, 500);
    });
  }

  /**
   * Verifica si el SDK está inicializado
   * @returns true si está inicializado
   */
  public isSDKInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Obtiene información de debug del mock
   * @returns Información de debug
   */
  public getDebugInfo(): any {
    return {
      isInitialized: this.isInitialized,
      playerData: this.playerData,
      leaderboardCount: this.leaderboardData.length,
      topScore: this.leaderboardData.length > 0 ? this.leaderboardData[0].score : 0
    };
  }

  /**
   * Resetea el mock para pruebas
   */
  public reset(): void {
    this.isInitialized = false;
    this.initializeMockData();
  }
}

// Exportar instancia global para compatibilidad con el SDK real
export const FBInstant = FacebookMock.getInstance();
