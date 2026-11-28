/**
 * Pebblewick's sound: a small Web Audio room. A bed of pad, wind and water
 * runs while sound is on, and every touch answers with a short, calm tone.
 * Everything is synthesised, so the whole soundtrack costs no download.
 */
const STORE_KEY = "pebblewick.sound";
const MASTER = 0.58;
const BED = 0.5;
const PENTATONIC = [523.25, 587.33, 659.25, 783.99, 880];
function readPreference() {
    try {
        return window.localStorage.getItem(STORE_KEY) === "on";
    }
    catch {
        return false;
    }
}
function savePreference(on) {
    try {
        window.localStorage.setItem(STORE_KEY, on ? "on" : "off");
    }
    catch {
        /* private mode: the choice simply does not persist */
    }
}
function tone(ctx, dest, t) {
    const start = ctx.currentTime + (t.at ?? 0);
    const length = t.length ?? 0.6;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = t.type ?? "sine";
    osc.frequency.setValueAtTime(t.freq, start);
    if (t.glide !== undefined)
        osc.frequency.exponentialRampToValueAtTime(t.glide, start + length);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(t.gain ?? 0.12, start + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
    osc.connect(gain).connect(dest);
    osc.start(start);
    osc.stop(start + length + 0.05);
}
function rustle(ctx, dest, buffer, r) {
    const start = ctx.currentTime;
    const length = r.length ?? 0.3;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const band = ctx.createBiquadFilter();
    band.type = "bandpass";
    band.frequency.value = r.freq;
    band.Q.value = r.q ?? 0.9;
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(r.gain ?? 0.05, start + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + length);
    src.connect(band).connect(gain).connect(dest);
    src.start(start);
    src.stop(start + length + 0.05);
}
/** A two-second loop of soft noise: the wind and water are shaped from it. */
function noiseBuffer(ctx) {
    const frames = Math.floor(ctx.sampleRate * 2);
    const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < frames; i += 1)
        data[i] = Math.random() * 2 - 1;
    return buffer;
}
function lfo(ctx, target, rate, depth) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.value = rate;
    gain.gain.value = depth;
    osc.connect(gain).connect(target);
    osc.start();
}
export class Sound {
    ctx = null;
    master = null;
    bed = null;
    pad = null;
    buffer = null;
    on = readPreference();
    get enabled() {
        return this.on;
    }
    async toggle() {
        if (this.on) {
            this.off();
            return false;
        }
        await this.start();
        return true;
    }
    async start() {
        const ctx = this.ctx ?? this.make();
        this.ctx = ctx;
        await ctx.resume();
        this.on = true;
        savePreference(true);
        this.fade(this.bed, BED, 0.35);
        this.chime();
    }
    off() {
        this.on = false;
        savePreference(false);
        this.fade(this.bed, 0, 0.25);
    }
    async resume() {
        if (this.on && this.ctx !== null)
            await this.ctx.resume();
    }
    /** The bed warms and opens up as more shelves are finished. */
    progress(share) {
        if (this.pad === null)
            return;
        this.pad.frequency.setTargetAtTime(440 + share * 280, this.ctx?.currentTime ?? 0, 2);
    }
    chime() {
        this.play((ctx, dest) => {
            tone(ctx, dest, { freq: 523.25, gain: 0.16, length: 0.9 });
            tone(ctx, dest, { freq: 783.99, gain: 0.12, length: 0.9, at: 0.06 });
            tone(ctx, dest, { freq: 1046.5, gain: 0.07, length: 0.8, at: 0.12 });
        });
    }
    mote(count) {
        const base = PENTATONIC[count % PENTATONIC.length];
        this.play((ctx, dest) => {
            tone(ctx, dest, { freq: base, gain: 0.14, length: 0.75 });
            tone(ctx, dest, { freq: base * 1.5, gain: 0.08, length: 0.6, at: 0.05 });
        });
    }
    hop() {
        this.play((ctx, dest) => {
            tone(ctx, dest, { freq: 300, glide: 430, type: "triangle", gain: 0.09, length: 0.18 });
            this.dust(ctx, dest, 0.02, 0.12);
        });
    }
    tap() {
        this.play((ctx, dest) => tone(ctx, dest, { freq: 240, type: "sine", gain: 0.06, length: 0.14 }));
    }
    home() {
        this.play((ctx, dest) => {
            [392, 523.25, 659.25, 783.99].forEach((freq, i) => {
                tone(ctx, dest, { freq, gain: 0.12, length: 0.9, at: i * 0.09 });
            });
        });
    }
    secret() {
        this.play((ctx, dest) => {
            tone(ctx, dest, { freq: 1318.5, glide: 1567.98, gain: 0.07, length: 1.5 });
            tone(ctx, dest, { freq: 1975.5, gain: 0.04, length: 1.2, at: 0.12 });
        });
    }
    play(run) {
        if (!this.on || this.ctx === null || this.master === null)
            return;
        run(this.ctx, this.master);
    }
    dust(ctx, dest, freq, gain) {
        if (this.buffer === null)
            this.buffer = noiseBuffer(ctx);
        rustle(ctx, dest, this.buffer, { freq: 900, gain, length: 0.16 });
        void freq;
    }
    fade(node, to, seconds) {
        if (node === null || this.ctx === null)
            return;
        const now = this.ctx.currentTime;
        node.gain.cancelScheduledValues(now);
        node.gain.setValueAtTime(Math.max(0.0001, node.gain.value), now);
        node.gain.exponentialRampToValueAtTime(Math.max(0.0001, to), now + seconds);
    }
    make() {
        const ctx = new AudioContext();
        const master = ctx.createGain();
        master.gain.value = MASTER;
        const comp = ctx.createDynamicsCompressor();
        comp.threshold.value = -16;
        comp.knee.value = 18;
        comp.ratio.value = 6;
        comp.attack.value = 0.004;
        comp.release.value = 0.25;
        master.connect(comp).connect(ctx.destination);
        const bed = ctx.createGain();
        bed.gain.value = 0.0001;
        bed.connect(master);
        this.buffer = noiseBuffer(ctx);
        this.pad = this.padLayer(ctx, bed);
        this.windLayer(ctx, bed);
        this.waterLayer(ctx, bed);
        this.master = master;
        this.bed = bed;
        return ctx;
    }
    padLayer(ctx, bed) {
        const lp = ctx.createBiquadFilter();
        lp.type = "lowpass";
        lp.frequency.value = 460;
        lp.Q.value = 0.6;
        const gain = ctx.createGain();
        gain.gain.value = 0.15;
        lp.connect(gain).connect(bed);
        [[110, 1], [164.81, 0.6], [220, 0.35]].forEach(([freq, level]) => {
            const osc = ctx.createOscillator();
            const og = ctx.createGain();
            osc.type = "sine";
            osc.frequency.value = freq;
            og.gain.value = level;
            osc.connect(og).connect(lp);
            osc.start();
        });
        lfo(ctx, lp.frequency, 0.045, 130);
        return lp;
    }
    windLayer(ctx, bed) {
        if (this.buffer === null)
            return;
        const src = ctx.createBufferSource();
        src.buffer = this.buffer;
        src.loop = true;
        const band = ctx.createBiquadFilter();
        band.type = "bandpass";
        band.frequency.value = 620;
        band.Q.value = 0.8;
        const gain = ctx.createGain();
        gain.gain.value = 0.07;
        src.connect(band).connect(gain).connect(bed);
        src.start();
        lfo(ctx, band.frequency, 0.03, 240);
        lfo(ctx, gain.gain, 0.021, 0.025);
    }
    waterLayer(ctx, bed) {
        if (this.buffer === null)
            return;
        const src = ctx.createBufferSource();
        src.buffer = this.buffer;
        src.loop = true;
        const hp = ctx.createBiquadFilter();
        hp.type = "highpass";
        hp.frequency.value = 2400;
        const gain = ctx.createGain();
        gain.gain.value = 0.022;
        src.connect(hp).connect(gain).connect(bed);
        src.start();
        lfo(ctx, gain.gain, 0.037, 0.012);
    }
}
