class CyberSynth {
  private ctx: AudioContext | null = null;
  private humOscillator: OscillatorNode | null = null;
  private humGain: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;

  private init() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
      return;
    }
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    } catch {
      // Audio Context not supported
    }
  }

  // Brief retro futuristic blip/chirp when typing or clicking
  playBlip(freq = 800, duration = 0.08, type: OscillatorType = 'sine') {
    this.init();
    if (!this.ctx) return;

    try {
      const currentTime = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, currentTime);

      gainNode.gain.setValueAtTime(0.05, currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, currentTime + duration);

      osc.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc.start(currentTime);
      osc.stop(currentTime + duration);
    } catch {
      // Silently catch audio blocks
    }
  }

  // Play a descending mechanical sweep for analytical steps
  playSweep(startFreq = 1600, endFreq = 200, duration = 0.4) {
    this.init();
    if (!this.ctx) return;

    try {
      const currentTime = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(startFreq, currentTime);
      osc.frequency.exponentialRampToValueAtTime(endFreq, currentTime + duration);

      gainNode.gain.setValueAtTime(0.04, currentTime);
      gainNode.gain.linearRampToValueAtTime(0.0001, currentTime + duration);

      osc.connect(gainNode);
      gainNode.connect(this.ctx.destination);

      osc.start(currentTime);
      osc.stop(currentTime + duration);
    } catch {
      // Silently catch
    }
  }

  // Play success jingle
  playSuccess() {
    this.playBlip(600, 0.05, 'triangle');
    setTimeout(() => this.playBlip(900, 0.05, 'triangle'), 50);
    setTimeout(() => this.playBlip(1400, 0.12, 'triangle'), 100);
  }

  // Toggle dynamic constant ambient hum representing reactor cores
  toggleAmbientHum(enabled: boolean) {
    this.init();
    if (!this.ctx) return;

    if (!enabled) {
      if (this.humOscillator) {
        try {
          this.humGain?.gain.linearRampToValueAtTime(0.0001, this.ctx.currentTime + 0.3);
          const oscRef = this.humOscillator;
          setTimeout(() => {
            try { oscRef.stop(); } catch {}
          }, 400);
        } catch {}
        this.humOscillator = null;
        this.humGain = null;
      }
      return;
    }

    if (this.humOscillator) return; // already hummin'

    try {
      const currentTime = this.ctx.currentTime;
      this.humOscillator = this.ctx.createOscillator();
      this.humGain = this.ctx.createGain();
      this.filter = this.ctx.createBiquadFilter();

      this.humOscillator.type = 'sawtooth';
      this.humOscillator.frequency.setValueAtTime(55, currentTime); // Low A hum

      // Lowpass filter to muffle sawtooth, forming a heavy mechanical drone
      this.filter.type = 'lowpass';
      this.filter.frequency.setValueAtTime(140, currentTime);
      // subtle modulation
      this.filter.Q.setValueAtTime(3, currentTime);

      this.humGain.gain.setValueAtTime(0.001, currentTime);
      this.humGain.gain.linearRampToValueAtTime(0.08, currentTime + 1.0); // fade in

      this.humOscillator.connect(this.filter);
      this.filter.connect(this.humGain);
      this.humGain.connect(this.ctx.destination);

      this.humOscillator.start(currentTime);
    } catch {
      // Silently handle exceptions
    }
  }

  // Update drone hum frequency based on Core speed multipliers
  updateHumTempo(speedMultiplier: number) {
    if (!this.ctx || !this.humOscillator || !this.filter) return;
    try {
      const baseFreq = 55 + (speedMultiplier - 1.0) * 10;
      this.humOscillator.frequency.setTargetAtTime(baseFreq, this.ctx.currentTime, 0.1);
      
      const filterFreq = 140 + (speedMultiplier - 1.0) * 30;
      this.filter.frequency.setTargetAtTime(filterFreq, this.ctx.currentTime, 0.1);
    } catch {
      // Ignore audio schedule glitches
    }
  }
}

export const audioEngine = new CyberSynth();
