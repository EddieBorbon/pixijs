/**
 * Servicio de audio para manejar música de fondo y efectos de sonido.
 * Utiliza la Web Audio API para un mejor control del audio.
 */
export class AudioService {
  private static instance: AudioService;
  private audioContext: AudioContext | null = null;
  private backgroundMusic: HTMLAudioElement | null = null;
  private soundEffects: Map<string, HTMLAudioElement> = new Map();
  private masterVolume: number = 0.5; // Volumen base de 0 a 1
  private musicVolume: number = 0.3; // Volumen de música de fondo
  private sfxVolume: number = 0.7; // Volumen de efectos de sonido
  private isMuted: boolean = false;
  private isMusicEnabled: boolean = true;
  private isSfxEnabled: boolean = true;

  private constructor() {
    this.initializeAudioContext();
  }

  /**
   * Obtiene la instancia singleton del servicio de audio
   */
  public static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  /**
   * Inicializa el contexto de audio
   */
  private initializeAudioContext(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('No se pudo inicializar el contexto de audio:', error);
    }
  }

  /**
   * Carga la música de fondo
   * @param musicPath - Ruta del archivo de música
   */
  public async loadBackgroundMusic(musicPath: string): Promise<void> {
    try {
      this.backgroundMusic = new Audio(musicPath);
      this.backgroundMusic.loop = true;
      this.backgroundMusic.preload = 'auto';
      
      // Configurar volumen inicial
      this.updateBackgroundMusicVolume();
      
      console.log('Música de fondo cargada:', musicPath);
    } catch (error) {
      console.error('Error al cargar la música de fondo:', error);
    }
  }

  /**
   * Carga un efecto de sonido
   * @param name - Nombre del efecto
   * @param soundPath - Ruta del archivo de sonido
   */
  public async loadSoundEffect(name: string, soundPath: string): Promise<void> {
    try {
      const audio = new Audio(soundPath);
      audio.preload = 'auto';
      this.soundEffects.set(name, audio);
      
      console.log('Efecto de sonido cargado:', name, soundPath);
    } catch (error) {
      console.error('Error al cargar el efecto de sonido:', name, error);
    }
  }

  /**
   * Reproduce la música de fondo
   */
  public async playBackgroundMusic(): Promise<void> {
    if (!this.backgroundMusic || !this.isMusicEnabled || this.isMuted) {
      return;
    }

    try {
      // Reanudar el contexto de audio si está suspendido
      if (this.audioContext && this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      await this.backgroundMusic.play();
      console.log('Música de fondo iniciada');
    } catch (error) {
      console.error('Error al reproducir música de fondo:', error);
    }
  }

  /**
   * Pausa la música de fondo
   */
  public pauseBackgroundMusic(): void {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      console.log('Música de fondo pausada');
    }
  }

  /**
   * Detiene la música de fondo
   */
  public stopBackgroundMusic(): void {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      this.backgroundMusic.currentTime = 0;
      console.log('Música de fondo detenida');
    }
  }

  /**
   * Reproduce un efecto de sonido
   * @param name - Nombre del efecto
   */
  public async playSoundEffect(name: string): Promise<void> {
    const audio = this.soundEffects.get(name);
    if (!audio || !this.isSfxEnabled || this.isMuted) {
      return;
    }

    try {
      // Reanudar el contexto de audio si está suspendido
      if (this.audioContext && this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Reiniciar el audio si ya está reproduciéndose
      audio.currentTime = 0;
      await audio.play();
    } catch (error) {
      console.error('Error al reproducir efecto de sonido:', name, error);
    }
  }

  /**
   * Establece el volumen maestro
   * @param volume - Volumen de 0 a 1
   */
  public setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateBackgroundMusicVolume();
    this.updateSoundEffectsVolume();
    console.log('Volumen maestro establecido:', this.masterVolume);
  }

  /**
   * Establece el volumen de la música de fondo
   * @param volume - Volumen de 0 a 1
   */
  public setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    this.updateBackgroundMusicVolume();
    console.log('Volumen de música establecido:', this.musicVolume);
  }

  /**
   * Establece el volumen de los efectos de sonido
   * @param volume - Volumen de 0 a 1
   */
  public setSfxVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    this.updateSoundEffectsVolume();
    console.log('Volumen de efectos establecido:', this.sfxVolume);
  }

  /**
   * Actualiza el volumen de la música de fondo
   */
  private updateBackgroundMusicVolume(): void {
    if (this.backgroundMusic) {
      this.backgroundMusic.volume = this.masterVolume * this.musicVolume;
    }
  }

  /**
   * Actualiza el volumen de todos los efectos de sonido
   */
  private updateSoundEffectsVolume(): void {
    this.soundEffects.forEach(audio => {
      audio.volume = this.masterVolume * this.sfxVolume;
    });
  }

  /**
   * Alterna el estado de silencio
   */
  public toggleMute(): void {
    this.isMuted = !this.isMuted;
    
    if (this.isMuted) {
      this.pauseBackgroundMusic();
    } else if (this.isMusicEnabled) {
      this.playBackgroundMusic();
    }
    
    console.log('Silencio:', this.isMuted ? 'activado' : 'desactivado');
  }

  /**
   * Alterna la música de fondo
   */
  public toggleMusic(): void {
    this.isMusicEnabled = !this.isMusicEnabled;
    
    if (this.isMusicEnabled && !this.isMuted) {
      this.playBackgroundMusic();
    } else {
      this.pauseBackgroundMusic();
    }
    
    console.log('Música:', this.isMusicEnabled ? 'activada' : 'desactivada');
  }

  /**
   * Alterna los efectos de sonido
   */
  public toggleSfx(): void {
    this.isSfxEnabled = !this.isSfxEnabled;
    console.log('Efectos de sonido:', this.isSfxEnabled ? 'activados' : 'desactivados');
  }

  /**
   * Obtiene el volumen maestro actual
   */
  public getMasterVolume(): number {
    return this.masterVolume;
  }

  /**
   * Obtiene el volumen de música actual
   */
  public getMusicVolume(): number {
    return this.musicVolume;
  }

  /**
   * Obtiene el volumen de efectos actual
   */
  public getSfxVolume(): number {
    return this.sfxVolume;
  }

  /**
   * Verifica si está silenciado
   */
  public isMutedState(): boolean {
    return this.isMuted;
  }

  /**
   * Verifica si la música está habilitada
   */
  public isMusicEnabledState(): boolean {
    return this.isMusicEnabled;
  }

  /**
   * Verifica si los efectos están habilitados
   */
  public isSfxEnabledState(): boolean {
    return this.isSfxEnabled;
  }

  /**
   * Obtiene el volumen maestro como porcentaje (0-100)
   */
  public getMasterVolumePercent(): number {
    return Math.round(this.masterVolume * 100);
  }

  /**
   * Obtiene el volumen de música como porcentaje (0-100)
   */
  public getMusicVolumePercent(): number {
    return Math.round(this.musicVolume * 100);
  }

  /**
   * Obtiene el volumen de efectos como porcentaje (0-100)
   */
  public getSfxVolumePercent(): number {
    return Math.round(this.sfxVolume * 100);
  }

  /**
   * Libera recursos del servicio de audio
   */
  public destroy(): void {
    this.stopBackgroundMusic();
    this.soundEffects.clear();
    
    if (this.audioContext) {
      this.audioContext.close();
    }
    
    console.log('Servicio de audio destruido');
  }
}
