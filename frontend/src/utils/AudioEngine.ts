class AudioEngine {
  private ctx: AudioContext | null = null;
  private humOsc: OscillatorNode | null = null;
  private humGain: GainNode | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playBlip(freq: number, duration: number, type: OscillatorType = 'sine') {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      gain.gain.setValueAtTime(duration > 0.1 ? 0.15 : 0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio playBlip error:', e);
    }
  }

  toggleAmbientHum(active: boolean) {
    try {
      this.initCtx();
      if (!this.ctx) return;

      if (active) {
        if (this.humOsc) return;

        this.humOsc = this.ctx.createOscillator();
        this.humGain = this.ctx.createGain();

        this.humOsc.type = 'sawtooth';
        this.humOsc.frequency.setValueAtTime(55, this.ctx.currentTime); // Low hum

        // Filter to make it warm and low-passed
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(120, this.ctx.currentTime);

        this.humGain.gain.setValueAtTime(0.02, this.ctx.currentTime);

        this.humOsc.connect(filter);
        filter.connect(this.humGain);
        this.humGain.connect(this.ctx.destination);

        this.humOsc.start();
      } else {
        if (this.humOsc) {
          try {
            this.humOsc.stop();
          } catch (e) {}
          this.humOsc.disconnect();
          this.humGain?.disconnect();
          this.humOsc = null;
          this.humGain = null;
        }
      }
    } catch (e) {
      console.warn('Audio toggleAmbientHum error:', e);
    }
  }

  updateHumTempo(speedMultiplier: number) {
    try {
      if (!this.ctx || !this.humOsc) return;
      // Map speed multiplier to frequency
      const freq = 55 + (speedMultiplier - 1.0) * 15;
      this.humOsc.frequency.setValueAtTime(freq, this.ctx.currentTime);
    } catch (e) {
      console.warn('Audio updateHumTempo error:', e);
    }
  }

  playSuccess() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      // Play a cute rising sci-fi chime
      this.playBlip(523.25, 0.1, 'sine'); // C5
      setTimeout(() => this.playBlip(659.25, 0.1, 'sine'), 80); // E5
      setTimeout(() => this.playBlip(783.99, 0.15, 'sine'), 160); // G5
      setTimeout(() => this.playBlip(1046.50, 0.25, 'sine'), 240); // C6
    } catch (e) {
      console.warn('Audio playSuccess error:', e);
    }
  }

  playSweep(startFreq: number, endFreq: number, duration: number) {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(startFreq, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(endFreq, this.ctx.currentTime + duration);

      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio playSweep error:', e);
    }
  }
}

export const audioEngine = new AudioEngine();
