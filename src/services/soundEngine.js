// Web Audio API Sound Synthesizer - 100% Offline & Pure Synthesis
// No external MP3 downloads required! Always works offline.

class SoundEngine {
  constructor() {
    this.audioCtx = null;
    this.enabled = true;
    this.volume = 0.8;
    this.currentAlarmInterval = null;
  }

  // Lazy-initialize AudioContext on first user interaction (browser policy)
  init() {
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
  }

  toggleSound(enabled) {
    this.enabled = enabled;
  }

  // 1. Cute Bubbly Pop (for clicks and checking off items)
  playPop() {
    if (!this.enabled) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const ctx = this.audioCtx;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      const now = ctx.currentTime;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(780, now + 0.08);

      gain.gain.setValueAtTime(this.volume * 0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.1);
    } catch (e) {
      console.warn('Audio playback error', e);
    }
  }

  // 2. Playful Ding / Success Tone
  playSuccess() {
    if (!this.enabled) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const ctx = this.audioCtx;
      const now = ctx.currentTime;
      const notes = [523.25, 659.25, 783.99]; // C5, E5, G5

      notes.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + i * 0.08;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(this.volume * 0.4, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + 0.36);
      });
    } catch (e) {
      console.warn('Audio error', e);
    }
  }

  // 3. Triumphant Milestone Fanfare (confetti celebration)
  playMilestoneFanfare() {
    if (!this.enabled) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const ctx = this.audioCtx;
      const now = ctx.currentTime;
      // Cheerful ascending arpeggio with celebratory bell chime
      const melody = [
        { f: 523.25, d: 0.12 }, // C5
        { f: 659.25, d: 0.12 }, // E5
        { f: 783.99, d: 0.12 }, // G5
        { f: 880.00, d: 0.14 }, // A5
        { f: 1046.50, d: 0.45 }, // C6
      ];

      let elapsed = 0;
      melody.forEach((note) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const start = now + elapsed;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(note.f, start);

        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(this.volume * 0.5, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, start + note.d);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(start);
        osc.stop(start + note.d + 0.05);

        elapsed += note.d * 0.8;
      });
    } catch (e) {
      console.warn('Audio error', e);
    }
  }

  // RINGTONES for REMINDERS & ALARMS:

  // Ringtone A: Morning Bell (Peaceful tubular chimes)
  playMorningBell() {
    if (!this.enabled) return;
    this.init();
    if (!this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;
    const chords = [
      { f: 440, delay: 0 },
      { f: 554.37, delay: 0.25 },
      { f: 659.25, delay: 0.5 },
      { f: 880, delay: 0.75 }
    ];

    chords.forEach(({ f, delay }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = now + delay;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(f, start);

      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(this.volume * 0.45, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.9);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + 1.0);
    });
  }

  // Ringtone B: Cozy Marimba (Warm wooden xylophone melody)
  playCozyMarimba() {
    if (!this.enabled) return;
    this.init();
    if (!this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;
    // Bouncy pentatonic tune
    const pattern = [523.25, 587.33, 659.25, 783.99, 880, 1046.50];

    pattern.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = now + idx * 0.14;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, start);

      // Fast percussive decay like wooden bars
      gain.gain.setValueAtTime(this.volume * 0.5, start);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.22);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + 0.25);
    });
  }

  // Ringtone C: Bubble Harp (Gentle cascading arpeggios)
  playBubbleHarp() {
    if (!this.enabled) return;
    this.init();
    if (!this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;
    const scale = [392.00, 493.88, 587.33, 659.25, 783.99, 987.77]; // G major

    scale.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = now + idx * 0.12;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(this.volume * 0.45, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.45);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + 0.5);
    });
  }

  // Ringtone D: Stardust Fanfare (Bright upbeat fanfare)
  playStardustFanfare() {
    if (!this.enabled) return;
    this.init();
    if (!this.audioCtx) return;

    const ctx = this.audioCtx;
    const now = ctx.currentTime;
    const notes = [
      { f: 587.33, d: 0.12 }, // D5
      { f: 739.99, d: 0.12 }, // F#5
      { f: 880.00, d: 0.12 }, // A5
      { f: 1174.66, d: 0.4 }, // D6
    ];

    let t = 0;
    notes.forEach((item) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const start = now + t;

      osc.type = 'sawtooth';
      // Low pass filter for warm cartoony sound
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, start);

      osc.frequency.setValueAtTime(item.f, start);

      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(this.volume * 0.35, start + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, start + item.d);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(start);
      osc.stop(start + item.d + 0.05);

      t += item.d * 0.85;
    });
  }

  // Play ringtone by key
  playRingtone(key) {
    switch (key) {
      case 'cozy_marimba':
        this.playCozyMarimba();
        break;
      case 'bubble_harp':
        this.playBubbleHarp();
        break;
      case 'stardust_fanfare':
        this.playStardustFanfare();
        break;
      case 'morning_bell':
      default:
        this.playMorningBell();
        break;
    }
  }

  // Start continuous alarm repetition for notifications
  startAlarmLoop(ringtoneKey, repeats = 3) {
    this.stopAlarmLoop();
    let count = 0;
    this.playRingtone(ringtoneKey);
    count++;

    if (repeats > 1) {
      this.currentAlarmInterval = setInterval(() => {
        if (count >= repeats) {
          this.stopAlarmLoop();
        } else {
          this.playRingtone(ringtoneKey);
          count++;
        }
      }, 1800);
    }
  }

  stopAlarmLoop() {
    if (this.currentAlarmInterval) {
      clearInterval(this.currentAlarmInterval);
      this.currentAlarmInterval = null;
    }
  }
}

export const soundEngine = new SoundEngine();
