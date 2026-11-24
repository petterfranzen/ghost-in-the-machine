// The ambient bed: three quiet layers that run while sound is on and change
// with the scene. Wind (brown noise through a low-pass), a low earth drone,
// and a high shimmer that only appears once buds are awake. Nothing here is
// sampled; every layer is generated from oscillators and noise.
const WIND_BASE = 400;
const WIND_SWING = 130;
const WIND_GAIN = 0.15;
const droneGainOf = (depth) => 0.075 + depth * 0.02;
const shimmerGainOf = (awake) => (awake > 0 ? 0.016 + awake * 0.004 : 0.0001);
const noiseBuffer = (ctx, seconds) => {
    const length = Math.floor(ctx.sampleRate * seconds);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let last = 0;
    for (let i = 0; i < length; i += 1) {
        last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
        data[i] = last * 3.2;
    }
    return buffer;
};
const rampTo = (param, value, at, seconds) => {
    param.cancelScheduledValues(at);
    param.setValueAtTime(Math.max(param.value, 0.0001), at);
    param.exponentialRampToValueAtTime(Math.max(value, 0.0001), at + seconds);
};
const sine = (ctx, freq, level, out) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq;
    gain.gain.value = level;
    osc.connect(gain).connect(out);
    osc.start();
    return osc;
};
export class Bed {
    ctx;
    wind;
    windGain;
    drone;
    shimmer;
    built = false;
    constructor(ctx, out) {
        this.ctx = ctx;
        this.wind = ctx.createBiquadFilter();
        this.wind.type = 'lowpass';
        this.wind.frequency.value = WIND_BASE;
        this.wind.Q.value = 0.7;
        this.windGain = ctx.createGain();
        this.windGain.gain.value = 0.0001;
        this.drone = ctx.createGain();
        this.drone.gain.value = 0.0001;
        this.shimmer = ctx.createGain();
        this.shimmer.gain.value = 0.0001;
        this.wind.connect(this.windGain).connect(out);
        this.drone.connect(out);
        this.shimmer.connect(out);
    }
    /** Build the layers once and fade them up. Safe to call repeatedly. */
    start() {
        if (!this.built)
            this.build();
        const t = this.ctx.currentTime;
        rampTo(this.windGain.gain, WIND_GAIN, t, 1.6);
        rampTo(this.drone.gain, 0.08, t, 2.4);
        rampTo(this.shimmer.gain, 0.012, t, 3.2);
    }
    /** Fade the bed out without tearing the graph down. */
    quiet() {
        const t = this.ctx.currentTime;
        rampTo(this.windGain.gain, 0.0001, t, 0.4);
        rampTo(this.drone.gain, 0.0001, t, 0.4);
        rampTo(this.shimmer.gain, 0.0001, t, 0.4);
    }
    /** The scene changed: deeper earth and waking buds colour the bed. */
    mood(depth, awake) {
        const t = this.ctx.currentTime;
        this.wind.frequency.setTargetAtTime(WIND_BASE + depth * 40, t, 1.2);
        rampTo(this.drone.gain, droneGainOf(depth), t, 1.4);
        rampTo(this.shimmer.gain, shimmerGainOf(awake), t, 1.6);
    }
    build() {
        this.built = true;
        const ctx = this.ctx;
        const noise = ctx.createBufferSource();
        noise.buffer = noiseBuffer(ctx, 4);
        noise.loop = true;
        noise.connect(this.wind);
        noise.start();
        const lfo = ctx.createOscillator();
        const swing = ctx.createGain();
        lfo.frequency.value = 0.045;
        swing.gain.value = WIND_SWING;
        lfo.connect(swing).connect(this.wind.frequency);
        lfo.start();
        sine(ctx, 55, 0.55, this.drone);
        sine(ctx, 82.5, 0.3, this.drone);
        sine(ctx, 880, 0.5, this.shimmer);
        sine(ctx, 1318.5, 0.35, this.shimmer);
    }
}
