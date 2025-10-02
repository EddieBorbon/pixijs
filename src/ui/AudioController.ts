/**
 * Controlador de audio para la interfaz de usuario.
 * Maneja los controles de volumen y mute desde el HTML.
 */
export class AudioController {
  private audioService: any;
  private isInitialized: boolean = false;

  constructor(audioService: any) {
    this.audioService = audioService;
  }

  /**
   * Inicializa los controles de audio
   */
  public initialize(): void {
    if (this.isInitialized) return;

    this.setupVolumeControls();
    this.setupMuteControl();
    this.updateUI();

    this.isInitialized = true;
    console.log('Controles de audio inicializados');
  }

  /**
   * Configura los controles de volumen
   */
  private setupVolumeControls(): void {
    // Control de volumen maestro
    const masterSlider = document.getElementById('master-volume-slider') as HTMLInputElement;
    if (masterSlider) {
      masterSlider.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        const volume = parseInt(target.value) / 100;
        this.audioService.setMasterVolume(volume);
        this.updateMasterVolumeIcon(volume);
      });
    }

    // Control de volumen de música
    const musicSlider = document.getElementById('music-volume-slider') as HTMLInputElement;
    if (musicSlider) {
      musicSlider.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        const volume = parseInt(target.value) / 100;
        this.audioService.setMusicVolume(volume);
        this.updateMusicIcon(volume);
      });
    }

    // Control de volumen de efectos
    const sfxSlider = document.getElementById('sfx-volume-slider') as HTMLInputElement;
    if (sfxSlider) {
      sfxSlider.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        const volume = parseInt(target.value) / 100;
        this.audioService.setSfxVolume(volume);
        this.updateSfxIcon(volume);
      });
    }
  }

  /**
   * Configura el control de mute
   */
  private setupMuteControl(): void {
    const muteControl = document.getElementById('mute-control');
    if (muteControl) {
      muteControl.addEventListener('click', () => {
        this.audioService.toggleMute();
        this.updateMuteIcon();
      });
    }
  }

  /**
   * Actualiza toda la interfaz de usuario
   */
  private updateUI(): void {
    this.updateMasterVolumeIcon(this.audioService.getMasterVolume());
    this.updateMusicIcon(this.audioService.getMusicVolume());
    this.updateSfxIcon(this.audioService.getSfxVolume());
    this.updateMuteIcon();

    // Actualizar valores de los sliders
    const masterSlider = document.getElementById('master-volume-slider') as HTMLInputElement;
    const musicSlider = document.getElementById('music-volume-slider') as HTMLInputElement;
    const sfxSlider = document.getElementById('sfx-volume-slider') as HTMLInputElement;

    if (masterSlider) masterSlider.value = this.audioService.getMasterVolumePercent().toString();
    if (musicSlider) musicSlider.value = this.audioService.getMusicVolumePercent().toString();
    if (sfxSlider) sfxSlider.value = this.audioService.getSfxVolumePercent().toString();
  }

  /**
   * Actualiza el icono del volumen maestro
   */
  private updateMasterVolumeIcon(volume: number): void {
    const icon = document.getElementById('master-volume-icon');
    if (!icon) return;

    if (volume === 0) {
      icon.textContent = '🔇';
    } else if (volume < 0.3) {
      icon.textContent = '🔈';
    } else if (volume < 0.7) {
      icon.textContent = '🔉';
    } else {
      icon.textContent = '🔊';
    }
  }

  /**
   * Actualiza el icono de música
   */
  private updateMusicIcon(volume: number): void {
    const icon = document.getElementById('music-icon');
    if (!icon) return;

    if (volume === 0) {
      icon.textContent = '🎵';
      icon.style.opacity = '0.5';
    } else {
      icon.textContent = '🎵';
      icon.style.opacity = '1';
    }
  }

  /**
   * Actualiza el icono de efectos de sonido
   */
  private updateSfxIcon(volume: number): void {
    const icon = document.getElementById('sfx-icon');
    if (!icon) return;

    if (volume === 0) {
      icon.textContent = '🔇';
    } else if (volume < 0.3) {
      icon.textContent = '🔈';
    } else if (volume < 0.7) {
      icon.textContent = '🔉';
    } else {
      icon.textContent = '🔊';
    }
  }

  /**
   * Actualiza el icono de mute
   */
  private updateMuteIcon(): void {
    const icon = document.getElementById('mute-icon');
    const control = document.getElementById('mute-control');
    if (!icon || !control) return;

    if (this.audioService.isMutedState()) {
      icon.textContent = '🔇';
      control.classList.add('muted');
    } else {
      icon.textContent = '🔊';
      control.classList.remove('muted');
    }
  }

  /**
   * Destruye el controlador
   */
  public destroy(): void {
    // Los event listeners se limpiarán automáticamente cuando se destruya el DOM
    this.isInitialized = false;
  }
}
