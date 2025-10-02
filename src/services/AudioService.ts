/**
 * Audio service for handling background music and sound effects.
 * Uses Web Audio API for better audio control.
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
   * Gets the singleton instance of the audio service
   */
  public static getInstance(): AudioService {
    if (!AudioService.instance) {
      AudioService.instance = new AudioService();
    }
    return AudioService.instance;
  }

  /**
   * Initializes the audio context
   */
  private initializeAudioContext(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    } catch (error) {
      console.warn('Could not initialize audio context:', error);
    }
  }

  /**
   * Loads background music
   * @param musicPath - Path to the music file
   */
  public async loadBackgroundMusic(musicPath: string): Promise<void> {
    try {
      this.backgroundMusic = new Audio(musicPath);
      this.backgroundMusic.loop = true;
      this.backgroundMusic.preload = 'auto';
      
      // Set initial volume
      this.updateBackgroundMusicVolume();
      
      console.log('Background music loaded:', musicPath);
    } catch (error) {
      console.error('Error loading background music:', error);
    }
  }

  /**
   * Loads a sound effect
   * @param name - Effect name
   * @param soundPath - Path to the sound file
   */
  public async loadSoundEffect(name: string, soundPath: string): Promise<void> {
    try {
      const audio = new Audio(soundPath);
      audio.preload = 'auto';
      this.soundEffects.set(name, audio);
      
      console.log('Sound effect loaded:', name, soundPath);
    } catch (error) {
      console.error('Error loading sound effect:', name, error);
    }
  }

  /**
   * Plays background music
   */
  public async playBackgroundMusic(): Promise<void> {
    if (!this.backgroundMusic || !this.isMusicEnabled || this.isMuted) {
      return;
    }

    try {
      // Resume audio context if suspended
      if (this.audioContext && this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      await this.backgroundMusic.play();
      console.log('Background music started');
    } catch (error) {
      console.error('Error playing background music:', error);
    }
  }

  /**
   * Pauses background music
   */
  public pauseBackgroundMusic(): void {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      console.log('Background music paused');
    }
  }

  /**
   * Stops background music
   */
  public stopBackgroundMusic(): void {
    if (this.backgroundMusic) {
      this.backgroundMusic.pause();
      this.backgroundMusic.currentTime = 0;
      console.log('Background music stopped');
    }
  }

  /**
   * Plays a sound effect
   * @param name - Effect name
   */
  public async playSoundEffect(name: string): Promise<void> {
    const audio = this.soundEffects.get(name);
    if (!audio || !this.isSfxEnabled || this.isMuted) {
      return;
    }

    try {
      // Resume audio context if suspended
      if (this.audioContext && this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      // Restart audio if already playing
      audio.currentTime = 0;
      await audio.play();
    } catch (error) {
      console.error('Error playing sound effect:', name, error);
    }
  }

  /**
   * Sets master volume
   * @param volume - Volume from 0 to 1
   */
  public setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.updateBackgroundMusicVolume();
    this.updateSoundEffectsVolume();
    console.log('Master volume set:', this.masterVolume);
  }

  /**
   * Sets background music volume
   * @param volume - Volume from 0 to 1
   */
  public setMusicVolume(volume: number): void {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    this.updateBackgroundMusicVolume();
    console.log('Music volume set:', this.musicVolume);
  }

  /**
   * Sets sound effects volume
   * @param volume - Volume from 0 to 1
   */
  public setSfxVolume(volume: number): void {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    this.updateSoundEffectsVolume();
    console.log('SFX volume set:', this.sfxVolume);
  }

  /**
   * Updates background music volume
   */
  private updateBackgroundMusicVolume(): void {
    if (this.backgroundMusic) {
      this.backgroundMusic.volume = this.masterVolume * this.musicVolume;
    }
  }

  /**
   * Updates volume of all sound effects
   */
  private updateSoundEffectsVolume(): void {
    this.soundEffects.forEach(audio => {
      audio.volume = this.masterVolume * this.sfxVolume;
    });
  }

  /**
   * Toggles mute state
   */
  public toggleMute(): void {
    this.isMuted = !this.isMuted;
    
    if (this.isMuted) {
      this.pauseBackgroundMusic();
    } else if (this.isMusicEnabled) {
      this.playBackgroundMusic();
    }
    
    console.log('Mute:', this.isMuted ? 'enabled' : 'disabled');
  }

  /**
   * Toggles background music
   */
  public toggleMusic(): void {
    this.isMusicEnabled = !this.isMusicEnabled;
    
    if (this.isMusicEnabled && !this.isMuted) {
      this.playBackgroundMusic();
    } else {
      this.pauseBackgroundMusic();
    }
    
    console.log('Music:', this.isMusicEnabled ? 'enabled' : 'disabled');
  }

  /**
   * Toggles sound effects
   */
  public toggleSfx(): void {
    this.isSfxEnabled = !this.isSfxEnabled;
    console.log('Sound effects:', this.isSfxEnabled ? 'enabled' : 'disabled');
  }

  /**
   * Gets current master volume
   */
  public getMasterVolume(): number {
    return this.masterVolume;
  }

  /**
   * Gets current music volume
   */
  public getMusicVolume(): number {
    return this.musicVolume;
  }

  /**
   * Gets current effects volume
   */
  public getSfxVolume(): number {
    return this.sfxVolume;
  }

  /**
   * Checks if muted
   */
  public isMutedState(): boolean {
    return this.isMuted;
  }

  /**
   * Checks if music is enabled
   */
  public isMusicEnabledState(): boolean {
    return this.isMusicEnabled;
  }

  /**
   * Checks if effects are enabled
   */
  public isSfxEnabledState(): boolean {
    return this.isSfxEnabled;
  }

  /**
   * Gets master volume as percentage (0-100)
   */
  public getMasterVolumePercent(): number {
    return Math.round(this.masterVolume * 100);
  }

  /**
   * Gets music volume as percentage (0-100)
   */
  public getMusicVolumePercent(): number {
    return Math.round(this.musicVolume * 100);
  }

  /**
   * Gets effects volume as percentage (0-100)
   */
  public getSfxVolumePercent(): number {
    return Math.round(this.sfxVolume * 100);
  }

  /**
   * Frees audio service resources
   */
  public destroy(): void {
    this.stopBackgroundMusic();
    this.soundEffects.clear();
    
    if (this.audioContext) {
      this.audioContext.close();
    }
    
    console.log('Audio service destroyed');
  }
}
