// Web Audio API synthesizers for instant, dependency-free gamification sound effects

class SoundEffectsManager {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  /** Subtle tick/click sound */
  playClick() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {
      // Audio might be blocked by autoplay policies
    }
  }

  /** XP coin/gem pick up sound */
  playXp() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      const start = ctx.currentTime;

      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.value = freq;

        const noteStart = start + idx * 0.07;
        const noteDuration = 0.12;

        gain.gain.setValueAtTime(0.001, noteStart);
        gain.gain.linearRampToValueAtTime(0.15, noteStart + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, noteStart + noteDuration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(noteStart);
        osc.stop(noteStart + noteDuration);
      });
    } catch {
      // ignore
    }
  }

  /** Task complete success chime */
  playSuccess() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      const chord = [440, 554.37, 659.25, 880]; // A major
      const start = ctx.currentTime;

      chord.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.value = freq;

        gain.gain.setValueAtTime(0.001, start + i * 0.04);
        gain.gain.linearRampToValueAtTime(0.12, start + i * 0.04 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start + i * 0.04);
        osc.stop(start + 0.65);
      });
    } catch {
      // ignore
    }
  }

  /** Level Up Fanfare */
  playLevelUp() {
    try {
      const ctx = this.getContext();
      if (!ctx) return;
      // Arpeggiated triumphant flourish
      const melody = [
        { freq: 523.25, time: 0.0, dur: 0.12 }, // C5
        { freq: 659.25, time: 0.12, dur: 0.12 }, // E5
        { freq: 783.99, time: 0.24, dur: 0.12 }, // G5
        { freq: 1046.5, time: 0.36, dur: 0.28 }, // C6
        { freq: 1318.51, time: 0.64, dur: 0.45 }, // E6
      ];

      const start = ctx.currentTime;
      melody.forEach(({ freq, time, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.value = freq;

        gain.gain.setValueAtTime(0.001, start + time);
        gain.gain.linearRampToValueAtTime(0.2, start + time + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.001, start + time + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start + time);
        osc.stop(start + time + dur + 0.05);
      });
    } catch {
      // ignore
    }
  }
}

export const soundEffects = new SoundEffectsManager();
