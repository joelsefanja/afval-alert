import { Injectable } from '@angular/core';

/**
 * AudioFeedbackService - Provides audio feedback for better UX
 * Enhances accessibility and provides satisfying interaction sounds
 */
@Injectable({
  providedIn: 'root'
})
export class AudioFeedbackService {
  private audioContext: AudioContext | null = null;
  private enabled = true;

  constructor() {
    // Check if user prefers reduced motion (respects accessibility preferences)
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.enabled = false;
    }
  }

  private getAudioContext(): AudioContext | null {
    if (!this.enabled) return null;
    
    if (!this.audioContext) {
      try {
        this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        return null;
      }
    }
    return this.audioContext;
  }

  private playTone(frequency: number, duration: number, volume: number = 0.1): void {
    const context = this.getAudioContext();
    if (!context) return;

    try {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.frequency.setValueAtTime(frequency, context.currentTime);
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, context.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, context.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, context.currentTime + duration);

      oscillator.start(context.currentTime);
      oscillator.stop(context.currentTime + duration);
    } catch (error) {
      console.warn('Audio feedback fout:', error);
    }
  }

  /**
   * Success sound - foto succesvol gemaakt/geüpload
   */
  playSuccess(): void {
    this.playTone(800, 0.15);
    setTimeout(() => this.playTone(1000, 0.15), 100);
  }

  /**
   * Error sound - fout opgetreden
   */
  playError(): void {
    this.playTone(300, 0.3, 0.15);
  }

  /**
   * Click sound - button press feedback
   */
  playClick(): void {
    this.playTone(600, 0.05, 0.05);
  }

  /**
   * Navigation sound - stap voltooid
   */
  playNavigation(): void {
    this.playTone(700, 0.1);
  }

  /**
   * Processing sound - AI classificatie bezig
   */
  playProcessing(): void {
    this.playTone(500, 0.2);
    setTimeout(() => this.playTone(650, 0.2), 150);
  }

  /**
   * Camera capture sound - foto maken
   */
  playCameraCapture(): void {
    this.playTone(1200, 0.05, 0.08);
    setTimeout(() => this.playTone(800, 0.1, 0.06), 50);
  }

  /**
   * Toggle audio feedback on/off
   */
  toggleAudio(): void {
    this.enabled = !this.enabled;
    if (this.enabled) {
      this.playClick(); // Confirmation sound
    }
  }

  /**
   * Check if audio is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}