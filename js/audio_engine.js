const SoundEngine = {
  ctx: null,
  init() {
    if (!this.ctx) {
      const AudioContext =
        window.AudioContext || window.webkitAudioContext;
      if (AudioContext) this.ctx = new AudioContext();
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  },
  playTone(freq, type = "sine", duration = 0.2, gainValue = 0.1) {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      gain.gain.setValueAtTime(gainValue, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        this.ctx.currentTime + duration,
      );
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch (e) {}
  },
  cardFlip() {
    this.playTone(400, "triangle", 0.08, 0.15);
  },
  clockTick() {
    this.playTone(900, "square", 0.03, 0.05);
  },
  gong() {
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(120, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(
        40,
        this.ctx.currentTime + 1.8,
      );
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(
        0.001,
        this.ctx.currentTime + 1.8,
      );
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 1.8);
    } catch (e) {}
  },
  swordSlash() {
    this.playTone(600, "sawtooth", 0.25, 0.2);
    setTimeout(() => this.playTone(250, "sine", 0.3, 0.25), 50);
  },
  victory() {
    [261.6, 329.6, 392.0, 523.25].forEach((f, i) => {
      setTimeout(() => this.playTone(f, "triangle", 0.4, 0.2), i * 140);
    });
  },
};