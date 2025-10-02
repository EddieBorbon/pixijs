/**
 * Audio controller for the user interface.
 * Handles volume controls and mute from HTML.
 */
export class AudioController {
  private audioService: any;
  private isInitialized: boolean = false;

  constructor(audioService: any) {
    this.audioService = audioService;
  }

  /**
   * Initializes audio controls
   */
  public initialize(): void {
    if (this.isInitialized) return;

    this.setupVolumeControls();
    this.setupMuteControl();
    this.updateUI();

    this.isInitialized = true;
    console.log('Audio controls initialized');
  }

  /**
   * Sets up volume controls
   */
  private setupVolumeControls(): void {
    // Music volume control
    const musicSlider = document.getElementById('music-volume-slider') as HTMLInputElement;
    if (musicSlider) {
      musicSlider.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        const volume = parseInt(target.value) / 100;
        this.audioService.setMusicVolume(volume);
        this.updateMusicIcon(volume);
      });
    }

    // Effects volume control
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
   * Sets up mute control
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
   * Updates entire user interface
   */
  private updateUI(): void {
    this.updateMusicIcon(this.audioService.getMusicVolume());
    this.updateSfxIcon(this.audioService.getSfxVolume());
    this.updateMuteIcon();

    // Update slider values
    const musicSlider = document.getElementById('music-volume-slider') as HTMLInputElement;
    const sfxSlider = document.getElementById('sfx-volume-slider') as HTMLInputElement;

    if (musicSlider) musicSlider.value = this.audioService.getMusicVolumePercent().toString();
    if (sfxSlider) sfxSlider.value = this.audioService.getSfxVolumePercent().toString();
  }


  /**
   * Updates music icon
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
   * Updates sound effects icon
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
   * Updates mute icon
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
   * Destroys the controller
   */
  public destroy(): void {
    // Event listeners will be cleaned up automatically when DOM is destroyed
    this.isInitialized = false;
  }
}
