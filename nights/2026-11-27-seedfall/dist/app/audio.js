// Seedfall's sound: a small Web Audio world. Everything is synthesised —
// oscillators, filtered noise and envelopes — so the whole night weighs
// a few kilobytes. The bed is a low pad, a breath of air and a warm layer
// that opens as more hollows are filled.
const MASTER = 0.6;
export class Sound {
    ctx = null;
    master = null;
    bed = null;
    pad = null;
    warm = null;
    air = null;
    noise = null;
    on = false;
    get enabled() {
        return this.on;
    }
    setOn(want) {
        if (want)
            this.start();
        else
            this.stop();
        return this.on;
    }
    resume() {
        if (this.ctx !== null && this.on)
            void this.ctx.resume();
    }
    setWarmth(amount) {
        const ctx = this.ctx;
        if (ctx === null || this.warm === null)
            return;
        const t = ctx.currentTime;
        this.warm.node.gain.setTargetAtTime(0.012 + Math.max(0, Math.min(1, amount)) * 0.05, t, 0.8);
    }
    play(name) {
        if (!this.on || this.ctx === null)
            return;
        switch (name) {
            case "step":
                this.tone(196, 0.16, { type: "triangle", gain: 0.16, glide: 148 });
                this.puff(0.09, { gain: 0.05, freq: 1400 });
                break;
            case "blocked":
                this.tone(118, 0.16, { gain: 0.12, glide: 88 });
                break;
            case "tuck":
                this.tone(523.25, 0.7, { gain: 0.2 });
                this.tone(783.99, 0.9, { gain: 0.12, when: 0.05 });
                break;
            case "solve":
                [392, 523.25, 659.25, 783.99].forEach((f, i) => this.tone(f, 1.1, { gain: 0.16, when: i * 0.13 }));
                break;
            case "undo":
                this.tone(440, 0.18, { type: "triangle", gain: 0.14, glide: 300 });
                break;
            case "restart":
                this.puff(0.5, { gain: 0.12, freq: 900, sweep: 220 });
                break;
            case "listen":
                this.tone(1174.66, 1.4, { gain: 0.1 });
                this.tone(1567.98, 1.6, { gain: 0.08, when: 0.12 });
                break;
            case "next":
                this.tone(329.63, 0.35, { gain: 0.14 });
                this.tone(440, 0.5, { gain: 0.12, when: 0.1 });
                break;
        }
    }
    start() {
        const ctx = this.ensure();
        if (ctx === null)
            return;
        void ctx.resume();
        this.on = true;
        this.bed?.gain.setTargetAtTime(0.5, ctx.currentTime, 0.22);
        this.tone(660, 0.5, { gain: 0.22 });
        this.tone(990, 0.7, { gain: 0.12, when: 0.08 });
    }
    stop() {
        const ctx = this.ctx;
        this.on = false;
        if (ctx === null)
            return;
        this.bed?.gain.setTargetAtTime(0, ctx.currentTime, 0.12);
    }
    ensure() {
        if (this.ctx !== null)
            return this.ctx;
        const Ctor = window.AudioContext ?? window.webkitAudioContext;
        if (Ctor === undefined)
            return null;
        const ctx = new Ctor();
        const master = ctx.createGain();
        master.gain.value = MASTER;
        const limiter = ctx.createDynamicsCompressor();
        limiter.threshold.value = -16;
        limiter.knee.value = 12;
        limiter.ratio.value = 8;
        limiter.attack.value = 0.004;
        limiter.release.value = 0.25;
        master.connect(limiter);
        limiter.connect(ctx.destination);
        this.ctx = ctx;
        this.master = master;
        this.buildBed(ctx);
        return ctx;
    }
    buildBed(ctx) {
        const bed = ctx.createGain();
        bed.gain.value = 0;
        bed.connect(this.master);
        this.bed = bed;
        this.pad = this.layer(ctx, bed, 620, 0.07);
        this.warm = this.layer(ctx, bed, 1500, 0.018);
        this.air = this.layer(ctx, bed, 780, 0.035);
        this.padOscillators(ctx, this.pad);
        this.wind(ctx, this.air);
        this.breathe(ctx);
    }
    layer(ctx, out, freq, gain) {
        const filter = ctx.createBiquadFilter();
        filter.type = "lowpass";
        filter.frequency.value = freq;
        filter.Q.value = 0.6;
        const node = ctx.createGain();
        node.gain.value = gain;
        filter.connect(node);
        node.connect(out);
        return { node, input: filter };
    }
    padOscillators(ctx, pad) {
        for (const [freq, detune] of [[110, -4], [164.81, 5], [220, 0]]) {
            const osc = ctx.createOscillator();
            osc.type = "triangle";
            osc.frequency.value = freq;
            osc.detune.value = detune;
            osc.connect(pad.input);
            osc.start();
        }
    }
    wind(ctx, air) {
        const src = ctx.createBufferSource();
        src.buffer = this.noiseBuffer(ctx);
        src.loop = true;
        const band = ctx.createBiquadFilter();
        band.type = "bandpass";
        band.frequency.value = 520;
        band.Q.value = 0.7;
        src.connect(band);
        band.connect(air.input);
        src.start();
    }
    breathe(ctx) {
        const lfo = ctx.createOscillator();
        const depth = ctx.createGain();
        lfo.frequency.value = 0.045;
        depth.gain.value = 0.02;
        lfo.connect(depth);
        depth.connect(this.air.node.gain);
        lfo.start();
        const slow = ctx.createOscillator();
        const sway = ctx.createGain();
        slow.frequency.value = 0.07;
        sway.gain.value = 0.025;
        slow.connect(sway);
        sway.connect(this.pad.node.gain);
        slow.start();
    }
    noiseBuffer(ctx) {
        if (this.noise !== null)
            return this.noise;
        const frames = Math.floor(ctx.sampleRate * 2);
        const buffer = ctx.createBuffer(1, frames, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let last = 0;
        for (let i = 0; i < frames; i += 1) {
            const white = Math.random() * 2 - 1;
            last = last * 0.96 + white * 0.04;
            data[i] = last * 3.2;
        }
        this.noise = buffer;
        return buffer;
    }
    tone(freq, dur, opts = {}) {
        const ctx = this.ctx;
        if (ctx === null || this.master === null)
            return;
        const t = ctx.currentTime + (opts.when ?? 0);
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = opts.type ?? "sine";
        osc.frequency.setValueAtTime(freq, t);
        if (opts.glide !== undefined)
            osc.frequency.exponentialRampToValueAtTime(Math.max(20, opts.glide), t + dur);
        const peak = opts.gain ?? 0.2;
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(peak, t + (opts.attack ?? 0.008));
        gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        osc.connect(gain);
        gain.connect(this.master);
        osc.start(t);
        osc.stop(t + dur + 0.05);
    }
    puff(dur, opts = {}) {
        const ctx = this.ctx;
        if (ctx === null || this.master === null)
            return;
        const t = ctx.currentTime + (opts.when ?? 0);
        const src = ctx.createBufferSource();
        src.buffer = this.noiseBuffer(ctx);
        src.loop = true;
        const band = ctx.createBiquadFilter();
        band.type = "bandpass";
        band.Q.value = opts.q ?? 1.1;
        band.frequency.setValueAtTime(opts.freq ?? 800, t);
        band.frequency.exponentialRampToValueAtTime(Math.max(60, opts.sweep ?? opts.freq ?? 800), t + dur);
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.0001, t);
        gain.gain.exponentialRampToValueAtTime(opts.gain ?? 0.12, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
        src.connect(band);
        band.connect(gain);
        gain.connect(this.master);
        src.start(t);
        src.stop(t + dur + 0.05);
    }
}
