// Sound. One AudioContext, a limiter on the master bus, and a small synthesised
// voice for each gesture. Browsers keep audio asleep until a gesture, so the
// context is only built on the first gesture that asks for sound. The choice is
// remembered in localStorage, wrapped in try/catch for private browsing.

import { Bed } from './bed.js';

const STORE_KEY = 'deeproot.sound';
const MASTER = 0.62;

export type Voice = 'grow' | 'refuse' | 'bud' | 'solve' | 'undo' | 'restart' | 'gate' | 'mole';

interface Spec {
  readonly freq: number;
  readonly to: number;
  readonly dur: number;
  readonly type: OscillatorType;
  readonly gain: number;
}

const VOICES: Readonly<Record<Voice, Spec>> = {
  grow: { freq: 392, to: 523.25, dur: 0.34, type: 'triangle', gain: 0.16 },
  refuse: { freq: 130.8, to: 110, dur: 0.28, type: 'sine', gain: 0.2 },
  bud: { freq: 659.25, to: 880, dur: 0.62, type: 'sine', gain: 0.2 },
  undo: { freq: 329.6, to: 261.6, dur: 0.26, type: 'triangle', gain: 0.12 },
  restart: { freq: 196, to: 196, dur: 0.5, type: 'sine', gain: 0.14 },
  gate: { freq: 220, to: 293.7, dur: 0.5, type: 'triangle', gain: 0.16 },
  mole: { freq: 174.6, to: 146.8, dur: 0.9, type: 'sine', gain: 0.12 },
  solve: { freq: 392, to: 392, dur: 1.6, type: 'sine', gain: 0.16 },
};

const CHORD: ReadonlyArray<number> = [392, 493.9, 587.3, 784];

const readChoice = (): boolean => {
  try {
    return localStorage.getItem(STORE_KEY) === 'on';
  } catch {
    return false;
  }
};

const writeChoice = (on: boolean): void => {
  try {
    localStorage.setItem(STORE_KEY, on ? 'on' : 'off');
  } catch {
    /* private mode: the choice just won't persist */
  }
};

interface Strike {
  readonly ctx: AudioContext;
  readonly out: AudioNode;
  readonly spec: Spec;
  readonly at: number;
  readonly freq?: number;
}

const tone = ({ ctx, out, spec, at, freq = spec.freq }: Strike): void => {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = spec.type;
  osc.frequency.setValueAtTime(freq, at);
  osc.frequency.exponentialRampToValueAtTime(Math.max(spec.to, 1), at + spec.dur);
  gain.gain.setValueAtTime(0.0001, at);
  gain.gain.exponentialRampToValueAtTime(spec.gain, at + 0.014);
  gain.gain.exponentialRampToValueAtTime(0.0001, at + spec.dur);
  osc.connect(gain).connect(out);
  osc.start(at);
  osc.stop(at + spec.dur + 0.06);
};

export class Sink {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private bed: Bed | null = null;
  private on = readChoice();
  private readonly watchers: Array<(on: boolean) => void> = [];

  get enabled(): boolean {
    return this.on;
  }

  onChange(watch: (on: boolean) => void): void {
    this.watchers.push(watch);
  }

  /** Flip the choice and answer at once: a chime plus the ambient bed. */
  toggle(): boolean {
    this.on = !this.on;
    writeChoice(this.on);
    if (this.on) this.wake();
    else this.sleep();
    for (const watch of this.watchers) watch(this.on);
    return this.on;
  }

  /** Called from a gesture: if sound was left on, start it without a chime. */
  resume(): void {
    if (!this.on) return;
    const ctx = this.ensure();
    void ctx.resume();
    this.bed?.start();
    this.fadeTo(MASTER, 0.35);
  }

  /** Play one gesture's voice. Silent while sound is off. */
  play(voice: Voice): void {
    if (!this.on) return;
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    if (ctx.state === 'suspended') void ctx.resume();
    const at = ctx.currentTime + 0.01;
    if (voice === 'solve') {
      for (const freq of CHORD) tone({ ctx, out: this.master, spec: VOICES.solve, at, freq });
      return;
    }
    tone({ ctx, out: this.master, spec: VOICES[voice], at });
  }

  /** The scene moved: let the bed follow the depth and the awake buds. */
  mood(depth: number, awake: number): void {
    this.bed?.mood(depth, awake);
  }

  private wake(): void {
    const ctx = this.ensure();
    void ctx.resume();
    this.bed?.start();
    this.fadeTo(MASTER, 0.3);
    this.play('bud');
  }

  private sleep(): void {
    const ctx = this.ctx;
    if (!ctx) return;
    this.fadeTo(0.0001, 0.25);
    this.bed?.quiet();
    window.setTimeout(() => {
      if (!this.on) void ctx.suspend();
    }, 340);
  }

  private fadeTo(value: number, seconds: number): void {
    const ctx = this.ctx;
    const master = this.master;
    if (!ctx || !master) return;
    const t = ctx.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), t);
    master.gain.exponentialRampToValueAtTime(Math.max(value, 0.0001), t + seconds);
  }

  private ensure(): AudioContext {
    if (this.ctx) return this.ctx;
    const ctx = new AudioContext();
    const master = ctx.createGain();
    master.gain.value = 0.0001;
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -12;
    limiter.knee.value = 12;
    limiter.ratio.value = 12;
    limiter.attack.value = 0.004;
    limiter.release.value = 0.18;
    master.connect(limiter).connect(ctx.destination);
    this.ctx = ctx;
    this.master = master;
    this.bed = new Bed(ctx, master);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && this.on) void ctx.resume();
    });
    return ctx;
  }
}
