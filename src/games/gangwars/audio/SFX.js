// Web Audio API SFX engine.
// Synthesizes all sounds in code — no audio files required.
// Howler is reserved for radio streaming.

class SFXEngine {
  constructor() {
    this.ctx = null;
    this.volume = 0.4;
    this.muted = false;
    this.listeners = new Set();
  }

  ensureCtx() {
    if (!this.ctx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      this.ctx = new Ctx();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  setVolume(v) {
    this.volume = Math.max(0, Math.min(1, v));
    this.notify();
  }

  toggleMute() {
    this.muted = !this.muted;
    this.notify();
  }

  master() {
    const ctx = this.ensureCtx();
    if (!ctx) return null;
    const g = ctx.createGain();
    g.gain.value = this.muted ? 0 : this.volume;
    g.connect(ctx.destination);
    return g;
  }

  // Single tone with attack-decay envelope
  tone(freq, duration, type = 'sine', vol = 1, when = 0) {
    const ctx = this.ensureCtx();
    if (!ctx || this.muted) return;
    const m = this.master();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    const t = ctx.currentTime + when;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.005);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(gain);
    gain.connect(m);
    osc.start(t);
    osc.stop(t + duration + 0.05);
  }

  // Filtered noise burst
  noise(duration, freq = 0, q = 1, vol = 0.3, when = 0) {
    const ctx = this.ensureCtx();
    if (!ctx || this.muted) return;
    const m = this.master();
    const buf = ctx.createBuffer(1, Math.max(1, ctx.sampleRate * duration), ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource();
    src.buffer = buf;
    const gain = ctx.createGain();
    const t = ctx.currentTime + when;
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + duration);
    if (freq > 0) {
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = freq;
      filter.Q.value = q;
      src.connect(filter);
      filter.connect(gain);
    } else {
      src.connect(gain);
    }
    gain.connect(m);
    src.start(t);
    src.stop(t + duration + 0.05);
  }

  // Frequency sweep (chirp)
  sweep(fromFreq, toFreq, duration, type = 'sine', vol = 0.5, when = 0) {
    const ctx = this.ensureCtx();
    if (!ctx || this.muted) return;
    const m = this.master();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    const t = ctx.currentTime + when;
    osc.frequency.setValueAtTime(fromFreq, t);
    osc.frequency.exponentialRampToValueAtTime(Math.max(0.001, toFreq), t + duration);
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(vol, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
    osc.connect(gain);
    gain.connect(m);
    osc.start(t);
    osc.stop(t + duration + 0.05);
  }

  // ── GAME SFX ──────────────────────────

  click() { this.tone(800, 0.04, 'square', 0.18); }
  hover() { this.tone(1200, 0.025, 'sine', 0.1); }

  diceRoll() {
    for (let i = 0; i < 7; i++) {
      this.noise(0.05, 700 + Math.random() * 600, 6, 0.18, i * 0.06);
    }
    this.tone(440, 0.08, 'square', 0.2, 0.42);
  }

  cardDraw() {
    this.noise(0.18, 3000, 1.5, 0.2);
    this.sweep(1500, 800, 0.12, 'triangle', 0.3, 0.05);
  }

  cardPlay() {
    this.tone(523.25, 0.06, 'square', 0.3);
    this.tone(783.99, 0.1, 'square', 0.3, 0.06);
    this.noise(0.1, 2000, 2, 0.15, 0.02);
  }

  territoryClaimed() {
    // Triumphant 3-note arpeggio (C-E-G major)
    this.tone(523.25, 0.1, 'triangle', 0.5);
    this.tone(659.25, 0.1, 'triangle', 0.5, 0.08);
    this.tone(783.99, 0.22, 'triangle', 0.6, 0.16);
  }

  develop() {
    // Hammer/build hit
    this.noise(0.08, 200, 4, 0.4);
    this.tone(120, 0.1, 'sawtooth', 0.4, 0.02);
    this.tone(180, 0.06, 'square', 0.25, 0.12);
  }

  attack() {
    // Impact + low rumble
    this.noise(0.25, 150, 2, 0.5);
    this.sweep(120, 50, 0.3, 'sawtooth', 0.55);
    this.tone(60, 0.4, 'sine', 0.4, 0.05);
  }

  attackHit() {
    this.attack();
    this.tone(440, 0.1, 'sawtooth', 0.5, 0.3);
    this.tone(660, 0.15, 'sine', 0.4, 0.32);
  }

  attackMiss() {
    this.sweep(800, 200, 0.3, 'sawtooth', 0.3);
  }

  eliminated() {
    // Descending defeat fanfare
    const notes = [440, 370, 311, 261.63, 196];
    notes.forEach((n, i) => this.tone(n, 0.18, 'sawtooth', 0.55, i * 0.13));
    this.tone(98, 0.6, 'sine', 0.4, 0.65);
  }

  eventTrigger() {
    // 3-pulse alert
    this.tone(1000, 0.07, 'square', 0.35);
    this.tone(1500, 0.07, 'square', 0.35, 0.09);
    this.tone(1000, 0.1, 'square', 0.35, 0.18);
  }

  victory() {
    // C major fanfare ascending
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, i) => this.tone(n, 0.22, 'triangle', 0.6, i * 0.12));
    this.tone(1046.5, 0.6, 'triangle', 0.7, 0.5);
    this.tone(1318.5, 0.6, 'triangle', 0.5, 0.5);
    this.tone(1567.98, 0.7, 'triangle', 0.45, 0.55);
  }

  turnStart() {
    // Triple ascending chime — distinct, attention-grabbing
    this.tone(659.25,  0.10, 'triangle', 0.55);          // E5
    this.tone(880,     0.10, 'triangle', 0.55, 0.10);    // A5
    this.tone(1108.73, 0.20, 'triangle', 0.65, 0.20);    // C#6
    this.tone(1318.5,  0.32, 'sine',     0.45, 0.30);    // E6 sustain
  }

  ability() {
    this.sweep(200, 1800, 0.18, 'sawtooth', 0.4);
    this.tone(1500, 0.08, 'square', 0.3, 0.15);
    this.tone(2000, 0.12, 'sine', 0.35, 0.2);
  }

  trade() {
    this.tone(440, 0.06, 'triangle', 0.35);
    this.tone(587.33, 0.06, 'triangle', 0.35, 0.07);
    this.tone(440, 0.06, 'triangle', 0.35, 0.14);
    this.tone(587.33, 0.1, 'triangle', 0.4, 0.21);
  }

  error() {
    this.tone(200, 0.08, 'sawtooth', 0.4);
    this.tone(150, 0.12, 'sawtooth', 0.4, 0.08);
  }

  subscribe(fn) { this.listeners.add(fn); return () => this.listeners.delete(fn); }
  notify() { this.listeners.forEach(fn => fn(this)); }
}

export const sfx = new SFXEngine();
