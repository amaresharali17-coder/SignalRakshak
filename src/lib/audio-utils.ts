'use client';

/**
 * Synthesizes a tactical "dangerous" buzzer sound using the Web Audio API.
 * This provides low-latency feedback without requiring external assets.
 */
export function playHostileBuzzer() {
  if (typeof window === 'undefined') return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    const audioCtx = new AudioContextClass();
    
    // Ensure context is resumed if suspended (browser requirement for auto-play)
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    // Create a high-intensity "siren" pulse
    const playPulse = (startTime: number, duration: number, freqStart: number, freqEnd: number) => {
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();

      // Use sawtooth for a "gritty" aggressive tactical sound
      oscillator.type = 'sawtooth';
      oscillator.frequency.setValueAtTime(freqStart, startTime);
      oscillator.frequency.exponentialRampToValueAtTime(freqEnd, startTime + duration);

      gainNode.gain.setValueAtTime(0.2, startTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    };

    // Trigger a triple-pulse rapid alert for high-threat signals
    const now = audioCtx.currentTime;
    playPulse(now, 0.4, 180, 60);
    playPulse(now + 0.15, 0.4, 180, 60);
    playPulse(now + 0.3, 0.4, 180, 60);

    // Clean up audio context after playback
    setTimeout(() => {
      if (audioCtx.state !== 'closed') {
        audioCtx.close();
      }
    }, 1500);
    
  } catch (error) {
    // Fail silently if audio context is blocked or unavailable
    console.warn("Tactical audio failed to initialize:", error);
  }
}
