// Every sound is synthesised: a wind bed, a slow pad, and short chimes.
const STORE_KEY = "nightbloom.sound";
const MASTER = 0.6;
const RECIPES = {
    tap: [{ freq: 540, at: 0, dur: 0.2, type: "sine", gain: 0.22 }],
    bloom: [
        { freq: 660, at: 0, dur: 0.34, type: "triangle", gain: 0.18 },
        { freq: 990, at: 0.06, dur: 0.42, type: "sine", gain: 0.12 },
    ],
    undo: [{ freq: 300, at: 0, dur: 0.18, type: "sine", gain: 0.16 }],
    next: [
        { freq: 392, at: 0, dur: 0.28, type: "sine", gain: 0.16 },
        { freq: 523, at: 0.1, dur: 0.4, type: "sine", gain: 0.12 },
    ],
    solve: [
        { freq: 523, at: 0, dur: 0.5, type: "triangle", gain: 0.16 },
        { freq: 659, at: 0.12, dur: 0.5, type: "triangle", gain: 0.14 },
        { freq: 784, at: 0.24, dur: 0.7, type: "sine", gain: 0.13 },
        { freq: 1046, at: 0.4, dur: 0.9, type: "sine", gain: 0.1 },
    ],
};
function noiseBuffer(ctx) {
    const length = Math.floor(ctx.sampleRate * 2);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i += 1)
        data[i] = Math.random() * 2 - 1;
    return buffer;
}
function makeWind(ctx, out) {
    const src = ctx.createBufferSource();
    src.buffer = noiseBuffer(ctx);
    src.loop = true;
    const band = ctx.createBiquadFilter();
    band.type = "lowpass";
    band.frequency.value = 520;
    band.Q.value = 0.7;
    const gain = ctx.createGain();
    gain.gain.value = 0.15;
    src.connect(band).connect(gain).connect(out);
    src.start();
    const lfo = ctx.createOscillator();
    const depth = ctx.createGain();
    lfo.frequency.value = 0.07;
    depth.gain.value = 170;
    lfo.connect(depth).connect(band.frequency);
    lfo.start();
    return gain;
}
function makePad(ctx, out) {
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 620;
    filter.Q.value = 0.4;
    const pad = ctx.createGain();
    pad.gain.value = 0.001;
    filter.connect(pad).connect(out);
    for (const freq of [110, 164.81, 220]) {
        const osc = ctx.createOscillator();
        osc.type = "sine";
        osc.frequency.value = freq;
        const voice = ctx.createGain();
        voice.gain.value = 0.05;
        osc.connect(voice).connect(filter);
        osc.start();
    }
    return { pad, filter };
}
export function createSound() {
    const ctx = new AudioContext();
    const master = ctx.createGain();
    master.gain.value = 0.0001;
    const limiter = ctx.createDynamicsCompressor();
    limiter.threshold.value = -12;
    limiter.knee.value = 12;
    limiter.ratio.value = 8;
    master.connect(limiter).connect(ctx.destination);
    const wind = makeWind(ctx, master);
    const { pad, filter } = makePad(ctx, master);
    return { ctx, master, pad, padFilter: filter, wind, on: false };
}
export function setEnabled(sound, on) {
    const now = sound.ctx.currentTime;
    sound.on = on;
    sound.master.gain.cancelScheduledValues(now);
    sound.master.gain.setTargetAtTime(on ? MASTER : 0.0001, now, 0.12);
    sound.pad.gain.setTargetAtTime(on ? 0.5 : 0.001, now, 0.6);
    if (on) {
        void sound.ctx.resume();
        play(sound, "next");
    }
    else {
        window.setTimeout(() => {
            if (!sound.on)
                void sound.ctx.suspend();
        }, 700);
    }
}
export function setOpenness(sound, ratio) {
    const now = sound.ctx.currentTime;
    sound.padFilter.frequency.setTargetAtTime(420 + ratio * 620, now, 1.2);
    sound.wind.gain.setTargetAtTime(0.1 + ratio * 0.1, now, 1.5);
}
export function play(sound, name) {
    if (!sound.on)
        return;
    const recipe = RECIPES[name];
    if (!recipe)
        return;
    const now = sound.ctx.currentTime;
    for (const note of recipe) {
        const osc = sound.ctx.createOscillator();
        const gain = sound.ctx.createGain();
        osc.type = note.type;
        osc.frequency.value = note.freq;
        const start = now + note.at;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(note.gain, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + note.dur);
        osc.connect(gain).connect(sound.master);
        osc.start(start);
        osc.stop(start + note.dur + 0.05);
    }
}
export function rememberChoice(on) {
    try {
        localStorage.setItem(STORE_KEY, on ? "on" : "off");
    }
    catch {
        /* storage may be blocked; the night still works */
    }
}
export function savedChoice() {
    try {
        return localStorage.getItem(STORE_KEY) === "on";
    }
    catch {
        return false;
    }
}
