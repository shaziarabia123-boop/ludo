/**
 * Procedural Web Audio Engine for Ludo Master
 * Synthesizes realistic audio effects using Web Audio API:
 * - Dice rattle & roll
 * - Token hop
 * - Token deployment chime
 * - Token capture impact
 * - Safe square shield chime
 * - Home entry & victory fanfare
 * - Button click
 * - Turn transition bell
 * - Error buzz
 * - Subtle ambient background chords
 */

class SoundEngine {
  private ctx: AudioContext | null = null;
  private sfxEnabled: boolean = true;
  private musicEnabled: boolean = false;
  private musicInterval: number | null = null;

  constructor() {
    // Load persisted preferences
    try {
      const savedSfx = localStorage.getItem('ludo_sfx');
      if (savedSfx !== null) this.sfxEnabled = savedSfx === 'true';
      const savedMusic = localStorage.getItem('ludo_music');
      if (savedMusic !== null) this.musicEnabled = savedMusic === 'true';
    } catch {
      // localStorage may fail in restricted iframes
    }
  }

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setSfxEnabled(enabled: boolean) {
    this.sfxEnabled = enabled;
    try {
      localStorage.setItem('ludo_sfx', String(enabled));
    } catch {}
  }

  public getSfxEnabled(): boolean {
    return this.sfxEnabled;
  }

  public setMusicEnabled(enabled: boolean) {
    this.musicEnabled = enabled;
    try {
      localStorage.setItem('ludo_music', String(enabled));
    } catch {}

    if (enabled) {
      this.startMusic();
    } else {
      this.stopMusic();
    }
  }

  public getMusicEnabled(): boolean {
    return this.musicEnabled;
  }

  public playButtonClick() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(440, now);
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.05);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  public playDiceRoll() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    // Simulate rattling dice clicks
    const now = this.ctx.currentTime;
    const rattleCount = 6;
    for (let i = 0; i < rattleCount; i++) {
      const t = now + i * 0.045 + Math.random() * 0.02;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(260 + Math.random() * 380, t);

      gain.gain.setValueAtTime(0.15, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.035);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 0.04);
    }
  }

  public playTokenStep() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(540, now + 0.07);

    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  public playDeploy() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [392, 523.25, 659.25]; // G4, C5, E5
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const t = now + idx * 0.07;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(t);
      osc.stop(t + 0.24);
    });
  }

  public playCapture() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;

    // Strike thump
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(220, now);
    osc.frequency.exponentialRampToValueAtTime(55, now + 0.25);

    gain.gain.setValueAtTime(0.35, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.28);

    // Whoosh pitch drop
    const whoosh = this.ctx.createOscillator();
    const whooshGain = this.ctx.createGain();
    whoosh.type = 'sine';
    whoosh.frequency.setValueAtTime(600, now + 0.05);
    whoosh.frequency.exponentialRampToValueAtTime(150, now + 0.35);

    whooshGain.gain.setValueAtTime(0.2, now + 0.05);
    whooshGain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);

    whoosh.connect(whooshGain);
    whooshGain.connect(this.ctx.destination);

    whoosh.start(now + 0.05);
    whoosh.stop(now + 0.38);
  }

  public playSafeSquare() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [587.33, 880]; // D5, A5
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const t = now + idx * 0.08;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(t);
      osc.stop(t + 0.26);
    });
  }

  public playHomeEnter() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const now = this.ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const t = now + idx * 0.09;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.22, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(t);
      osc.stop(t + 0.32);
    });
  }

  public playVictoryFanfare() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const chords = [
      [523.25, 659.25, 783.99], // C major
      [587.33, 739.99, 880.0],  // D major
      [659.25, 830.61, 987.77],  // E major
      [783.99, 987.77, 1174.66, 1567.98], // G major high
    ];

    const now = this.ctx.currentTime;
    chords.forEach((chord, chordIdx) => {
      const t = now + chordIdx * 0.22;
      chord.forEach((freq) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(t);
        osc.stop(t + 0.48);
      });
    });
  }

  public playTurnChange() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(520, now);
    osc.frequency.exponentialRampToValueAtTime(650, now + 0.08);

    gain.gain.setValueAtTime(0.1, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  public playError() {
    if (!this.sfxEnabled) return;
    this.initContext();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.12);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.14);
  }

  public startMusic() {
    if (this.musicInterval) return;
    this.initContext();

    const sequence = [
      [261.63, 329.63, 392.0], // C
      [220.0, 261.63, 329.63],  // Am
      [174.61, 220.0, 261.63],  // F
      [196.0, 246.94, 293.66],  // G
    ];
    let step = 0;

    const playAmbientChord = () => {
      if (!this.musicEnabled || !this.ctx) return;
      const chord = sequence[step % sequence.length];
      step++;
      const now = this.ctx.currentTime;

      chord.forEach((freq) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(0.025, now + 1.2);
        gain.gain.linearRampToValueAtTime(0.0001, now + 3.8);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(now);
        osc.stop(now + 4.0);
      });
    };

    playAmbientChord();
    this.musicInterval = window.setInterval(playAmbientChord, 4000);
  }

  public stopMusic() {
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }
}

export const soundManager = new SoundEngine();
