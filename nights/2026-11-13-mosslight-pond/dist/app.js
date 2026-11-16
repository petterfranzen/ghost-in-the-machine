import { min, max } from "./fable_modules/fable-library-js.4.19.3/Double.js";
import { nonSeeded } from "./fable_modules/fable-library-js.4.19.3/Random.js";
import { FSharpRef, Record } from "./fable_modules/fable-library-js.4.19.3/Types.js";
import { string_type, bool_type, record_type, float64_type, int32_type } from "./fable_modules/fable-library-js.4.19.3/Reflection.js";
import { comparePrimitives, defaultOf, disposeSafe, getEnumerator, clear, createAtom } from "./fable_modules/fable-library-js.4.19.3/Util.js";
import { sortBy, iterate, exists, map, delay, toArray } from "./fable_modules/fable-library-js.4.19.3/Seq.js";
import { rangeDouble } from "./fable_modules/fable-library-js.4.19.3/Range.js";
import { removeAllInPlace, item, tryFindIndex, tryFind, map as map_1, mapIndexed } from "./fable_modules/fable-library-js.4.19.3/Array.js";
import { printf, toText, substring, join } from "./fable_modules/fable-library-js.4.19.3/String.js";
import { tryGetValue } from "./fable_modules/fable-library-js.4.19.3/MapUtil.js";
import { parse } from "./fable_modules/fable-library-js.4.19.3/Int32.js";

export function num(o, k) {
    return o[k];
}

export function str(o, k) {
    return o[k];
}

export function clamp(v, lo, hi) {
    return max(lo, min(hi, v));
}

export function lerp(a, b, t_1) {
    return a + ((b - a) * t_1);
}

export const rnd = nonSeeded();

export function rr(a, b) {
    return a + (rnd.NextDouble() * (b - a));
}

export function wrapPi(a) {
    let x = a;
    while (x > 3.141592653589793) {
        x = (x - (2 * 3.141592653589793));
    }
    while (x < -3.141592653589793) {
        x = (x + (2 * 3.141592653589793));
    }
    return x;
}

export class Layout extends Record {
    constructor(W, H, Cx, Cy, Rx, Ry, Horizon) {
        super();
        this.W = (W | 0);
        this.H = (H | 0);
        this.Cx = Cx;
        this.Cy = Cy;
        this.Rx = Rx;
        this.Ry = Ry;
        this.Horizon = Horizon;
    }
}

export function Layout_$reflection() {
    return record_type("App.Layout", [], Layout, () => [["W", int32_type], ["H", int32_type], ["Cx", float64_type], ["Cy", float64_type], ["Rx", float64_type], ["Ry", float64_type], ["Horizon", float64_type]]);
}

export let L = createAtom(new Layout(200, 300, 100, 170, 88, 40, 130));

export function relayout() {
    const w = window.Gfx.W();
    const h = window.Gfx.H();
    const rx = w * (((w / h) > 1.25) ? 0.415 : 0.475);
    const ry = min(rx * 0.54, h * 0.24);
    const cy = h * (((h / w) > 1.15) ? 0.555 : 0.6);
    L(new Layout(~~w, ~~h, w * 0.5, cy, rx, ry, (cy - ry) - max(5, ry * 0.12)));
}

export function pondD(x, y) {
    const dx = (x - L().Cx) / L().Rx;
    const dy = (y - L().Cy) / L().Ry;
    return (dx * dx) + (dy * dy);
}

export function rimPoint(angle, scale) {
    return [L().Cx + ((Math.cos(angle) * L().Rx) * scale), L().Cy + ((Math.sin(angle) * L().Ry) * scale)];
}

export class Koi extends Record {
    constructor(X, Y, Ang, Speed, Size, Shade, Wander, Wag, Startle, HasTarget, TX, TY, TargetT, Moon, Life, Diving) {
        super();
        this.X = X;
        this.Y = Y;
        this.Ang = Ang;
        this.Speed = Speed;
        this.Size = Size;
        this.Shade = (Shade | 0);
        this.Wander = Wander;
        this.Wag = Wag;
        this.Startle = Startle;
        this.HasTarget = HasTarget;
        this.TX = TX;
        this.TY = TY;
        this.TargetT = TargetT;
        this.Moon = Moon;
        this.Life = Life;
        this.Diving = Diving;
    }
}

export function Koi_$reflection() {
    return record_type("App.Koi", [], Koi, () => [["X", float64_type], ["Y", float64_type], ["Ang", float64_type], ["Speed", float64_type], ["Size", float64_type], ["Shade", int32_type], ["Wander", float64_type], ["Wag", float64_type], ["Startle", float64_type], ["HasTarget", bool_type], ["TX", float64_type], ["TY", float64_type], ["TargetT", float64_type], ["Moon", bool_type], ["Life", float64_type], ["Diving", float64_type]]);
}

export class Ripple extends Record {
    constructor(X, Y, R, MaxR, Life, MaxLife, Power, Warm) {
        super();
        this.X = X;
        this.Y = Y;
        this.R = R;
        this.MaxR = MaxR;
        this.Life = Life;
        this.MaxLife = MaxLife;
        this.Power = Power;
        this.Warm = Warm;
    }
}

export function Ripple_$reflection() {
    return record_type("App.Ripple", [], Ripple, () => [["X", float64_type], ["Y", float64_type], ["R", float64_type], ["MaxR", float64_type], ["Life", float64_type], ["MaxLife", float64_type], ["Power", float64_type], ["Warm", bool_type]]);
}

export class Bubble extends Record {
    constructor(X, Y, Life, R) {
        super();
        this.X = X;
        this.Y = Y;
        this.Life = Life;
        this.R = R;
    }
}

export function Bubble_$reflection() {
    return record_type("App.Bubble", [], Bubble, () => [["X", float64_type], ["Y", float64_type], ["Life", float64_type], ["R", float64_type]]);
}

export class Spark extends Record {
    constructor(X, Y, VX, VY, Life, C) {
        super();
        this.X = X;
        this.Y = Y;
        this.VX = VX;
        this.VY = VY;
        this.Life = Life;
        this.C = C;
    }
}

export function Spark_$reflection() {
    return record_type("App.Spark", [], Spark, () => [["X", float64_type], ["Y", float64_type], ["VX", float64_type], ["VY", float64_type], ["Life", float64_type], ["C", string_type]]);
}

export class Mote extends Record {
    constructor(X, Y, Phase, Drift, Bright) {
        super();
        this.X = X;
        this.Y = Y;
        this.Phase = Phase;
        this.Drift = Drift;
        this.Bright = Bright;
    }
}

export function Mote_$reflection() {
    return record_type("App.Mote", [], Mote, () => [["X", float64_type], ["Y", float64_type], ["Phase", float64_type], ["Drift", float64_type], ["Bright", float64_type]]);
}

export class Cloud extends Record {
    constructor(X, Y, Wid, Speed, Alpha, Seed) {
        super();
        this.X = X;
        this.Y = Y;
        this.Wid = Wid;
        this.Speed = Speed;
        this.Alpha = Alpha;
        this.Seed = (Seed | 0);
    }
}

export function Cloud_$reflection() {
    return record_type("App.Cloud", [], Cloud, () => [["X", float64_type], ["Y", float64_type], ["Wid", float64_type], ["Speed", float64_type], ["Alpha", float64_type], ["Seed", int32_type]]);
}

export class Reed extends Record {
    constructor(Angle, Scale, Lean, Vel, H, Phase) {
        super();
        this.Angle = Angle;
        this.Scale = Scale;
        this.Lean = Lean;
        this.Vel = Vel;
        this.H = H;
        this.Phase = Phase;
    }
}

export function Reed_$reflection() {
    return record_type("App.Reed", [], Reed, () => [["Angle", float64_type], ["Scale", float64_type], ["Lean", float64_type], ["Vel", float64_type], ["H", float64_type], ["Phase", float64_type]]);
}

export class Lantern extends Record {
    constructor(Angle, Scale, Lit, Note, Pulse, Index) {
        super();
        this.Angle = Angle;
        this.Scale = Scale;
        this.Lit = Lit;
        this.Note = Note;
        this.Pulse = Pulse;
        this.Index = (Index | 0);
    }
}

export function Lantern_$reflection() {
    return record_type("App.Lantern", [], Lantern, () => [["Angle", float64_type], ["Scale", float64_type], ["Lit", bool_type], ["Note", float64_type], ["Pulse", float64_type], ["Index", int32_type]]);
}

export const koi = [];

export const ripples = [];

export const bubbles = [];

export const sparks = [];

export const motes = [];

export const clouds = [];

export const reeds = [new Reed(-0.42, 1.02, 0, 0, 26, 0), new Reed(0.62, 1.07, 0, 0, 20, 1.7), new Reed(2.06, 1.04, 0, 0, 24, 3.1), new Reed(4.05, 1, 0, 0, 22, 4.4), new Reed(5.35, 1.06, 0, 0, 28, 5.6)];

export const stones = [[0.3, 1.06, 3], [1.15, 1.1, 2], [2.3, 1.05, 3.5], [3.05, 1.02, 2.5], [3.85, 1.08, 4], [4.6, 1.04, 2.5], [5.3, 1.07, 3.5], [5.95, 1.03, 2], [1.75, 1.13, 2]];

export const lanternDefs = [[2.55, 1.06, 293.66], [3.75, 1.07, 349.23], [0.6, 1.05, 392], [5.55, 1.08, 440]];

export let lanterns = createAtom([]);

export const stars = toArray(delay(() => map((i) => [rr(0.02, 0.98), rr(0, 0.62), ((i % 5) === 0) ? 2 : 1, rr(0, 6.28)], rangeDouble(0, 1, 26))));

export const speckles = toArray(delay(() => map((i) => [rr(0, 1), rr(0, 1), ((i % 7) === 0) ? 2 : 1], rangeDouble(0, 1, 110))));

export let t = createAtom(0);

export let idle = createAtom(0);

export let veil = createAtom(0);

export let shyT = createAtom(0);

export let shake = createAtom(0);

export let moonTaps = createAtom(0);

export let moonTapT = createAtom(-10);

export let shower = createAtom(0);

export let moonKoiSeen = createAtom(false);

export let moonKoiT = createAtom(0);

export let gathering = createAtom(0);

export let litCount = createAtom(0);

export let warm = createAtom(0);

export let lastSplashSnd = createAtom(-1);

export const koiPalette = [["#f2e6cd", "#d07a45"], ["#e9f0f2", "#7f9fb4"], ["#f4dca6", "#bc8f52"], ["#9fb6c0", "#4d6b7a"], ["#f6eee0", "#c96f4e"]];

export function initLanterns() {
    let array_2, array_1;
    const saved = (function(){try{return localStorage.getItem('mosslight.lanterns')}catch(e){return null}})();
    const s = (saved == null) ? "" : saved;
    lanterns(mapIndexed((i, tupledArg) => (new Lantern(tupledArg[0], tupledArg[1], (s.length > i) && (s[i] === "1"), tupledArg[2], 0, i)), lanternDefs));
    litCount((array_2 = ((array_1 = lanterns(), array_1.filter((l) => l.Lit))), array_2.length));
    warm(litCount() / 4);
    const array_3 = lanterns();
    array_3.forEach((l_1) => {
        if (l_1.Lit) {
            window.MossAudio&&window.MossAudio.lantern(l_1.Index,l_1.Note);
        }
    });
}

export function saveLanternState() {
    const s = join("", map_1((l) => {
        if (l.Lit) {
            return "1";
        }
        else {
            return "0";
        }
    }, lanterns()));
    (function(){try{localStorage.setItem('mosslight.lanterns',s)}catch(e){}})();
}

export function addKoi(x, y, size, shade, moon, life) {
    void (koi.push(new Koi(x, y, rr(0, 6.28), 8, size, shade, rr(-1, 1), rr(0, 6.28), 0, false, x, y, 0, moon, life, 0)));
}

export function initWorld() {
    clear(koi);
    for (let i = 0; i <= 5; i++) {
        const a = rr(0, 6.28);
        const r = Math.sqrt(rr(0, 0.6));
        addKoi(L().Cx + ((Math.cos(a) * L().Rx) * r), L().Cy + ((Math.sin(a) * L().Ry) * r), rr(2.7, 4.3), i % koiPalette.length, false, 0);
    }
    for (let i_1 = 0; i_1 <= 13; i_1++) {
        void (motes.push(new Mote(rr(0.1, 0.9), rr(0.35, 0.9), rr(0, 6.28), rr(0.4, 1.2), rr(0.3, 1))));
    }
    for (let i_2 = 0; i_2 <= 2; i_2++) {
        void (clouds.push(new Cloud(rr(0, 1), rr(0.03, 0.24), rr(0.22, 0.42), rr(0.004, 0.012), rr(0.1, 0.22), i_2 * 17)));
    }
}

export function ripple(x, y, power, warmRing) {
    void (ripples.push(new Ripple(x, y, 2, 14 + (26 * power), 1, 1.6 + (0.7 * power), power, warmRing)));
}

export function splash(x, y, power) {
    ripple(x, y, power, false);
    for (let i = 0; i <= ~~(3 + (5 * power)); i++) {
        void (sparks.push(new Spark(x + rr(-3, 3), y + rr(-1.5, 1.5), rr(-16, 16), rr(-30, -8), rr(0.3, 0.7), ((i % 3) === 0) ? "#cfe9e2" : "#8fc0bd")));
    }
    shake(max(shake(), 0.7 * power));
    window.MossAudio&&window.MossAudio.plink(x / L().W);
}

export function attract(x, y, radius, hold) {
    let arg0__1, arg0__3;
    let enumerator = getEnumerator(koi);
    try {
        while (enumerator["System.Collections.IEnumerator.MoveNext"]()) {
            const k = enumerator["System.Collections.Generic.IEnumerator`1.get_Current"]();
            if (!k.Moon ? true : (k.Life > 0)) {
                if (Math.sqrt(((arg0__1 = (k.X - x), Math.pow(arg0__1, 2))) + ((arg0__3 = (k.Y - y), Math.pow(arg0__3, 2)))) < radius) {
                    k.HasTarget = true;
                    k.TX = (x + rr(-6, 6));
                    k.TY = (y + rr(-4, 4));
                    k.TargetT = (t() + hold);
                }
            }
        }
    }
    finally {
        disposeSafe(enumerator);
    }
}

export function startleKoi(k) {
    k.Startle = 1;
    k.HasTarget = false;
    k.Ang = ((k.Ang + 3.141592653589793) + rr(-0.7, 0.7));
    k.Speed = 34;
    window.MossAudio&&window.MossAudio.bloop(k.Shade);
    for (let i = 0; i <= 4; i++) {
        void (bubbles.push(new Bubble(k.X, k.Y, rr(0.5, 1.1), rr(0.6, 1.4))));
    }
}

export function burstSparks(x, y, n, c) {
    for (let i = 0; i <= n; i++) {
        const a = rr(0, 6.28);
        const s = rr(4, 18);
        void (sparks.push(new Spark(x, y, Math.cos(a) * s, ((Math.sin(a) * s) * 0.6) - 6, rr(0.5, 1.2), c)));
    }
}

export function nearestKoi(x, y, r) {
    let arg0__1, arg0__3;
    let best = undefined;
    let bd = r;
    let enumerator = getEnumerator(koi);
    try {
        while (enumerator["System.Collections.IEnumerator.MoveNext"]()) {
            const k = enumerator["System.Collections.Generic.IEnumerator`1.get_Current"]();
            const d = Math.sqrt(((arg0__1 = (k.X - x), Math.pow(arg0__1, 2))) + ((arg0__3 = (k.Y - y), Math.pow(arg0__3, 2))));
            if ((d < bd) && (!k.Moon ? true : (k.Life > 0))) {
                bd = d;
                best = k;
            }
        }
    }
    finally {
        disposeSafe(enumerator);
    }
    return best;
}

export function lightLantern(l) {
    if (!l.Lit) {
        l.Lit = true;
        l.Pulse = 1;
        litCount(litCount() + 1);
        warm(litCount() / 4);
        const patternInput = rimPoint(l.Angle, l.Scale);
        window.MossAudio&&window.MossAudio.chime(l.Note);
        window.MossAudio&&window.MossAudio.lantern(l.Index,l.Note);
        burstSparks(patternInput[0], patternInput[1] - 6, 14, "#ffd79a");
        shake(max(shake(), 0.4));
        saveLanternState();
        if (litCount() === 4) {
            moonKoiT(6);
            window.MossAudio&&window.MossAudio.hidden();
        }
    }
}

export class Press extends Record {
    constructor(X0, Y0, X, Y, T0, Kind, Target, Moved, LastTrail, LastStir, Spent) {
        super();
        this.X0 = X0;
        this.Y0 = Y0;
        this.X = X;
        this.Y = Y;
        this.T0 = T0;
        this.Kind = Kind;
        this.Target = Target;
        this.Moved = Moved;
        this.LastTrail = LastTrail;
        this.LastStir = LastStir;
        this.Spent = Spent;
    }
}

export function Press_$reflection() {
    return record_type("App.Press", [], Press, () => [["X0", float64_type], ["Y0", float64_type], ["X", float64_type], ["Y", float64_type], ["T0", float64_type], ["Kind", string_type], ["Target", float64_type], ["Moved", float64_type], ["LastTrail", float64_type], ["LastStir", float64_type], ["Spent", bool_type]]);
}

export const presses = new Map([]);

export function fingerDown(id, x, y) {
    let arg0__9, arg0__11, arg0__14, k;
    idle(0);
    gathering(0);
    const sky = y < ((L().Cy - L().Ry) - 3);
    const press = new Press(x, y, x, y, t(), "none", -1, 0, -1, -1, false);
    if (sky) {
        const mx = L().W * 0.775;
        const my = L().H * 0.15;
        const mr = max(7, min(L().W, L().H) * 0.055);
        if ((((arg0__9 = (x - mx), Math.pow(arg0__9, 2))) + ((arg0__11 = (y - my), Math.pow(arg0__11, 2)))) < ((arg0__14 = (mr + 8), Math.pow(arg0__14, 2)))) {
            moonTaps(((t() - moonTapT()) < 4) ? (moonTaps() + 1) : 1);
            moonTapT(t());
            window.MossAudio&&window.MossAudio.bell();
            burstSparks(mx, my, 8, "#dceeff");
            if (moonTaps() >= 3) {
                moonTaps(0);
                shower(6);
                window.MossAudio&&window.MossAudio.hidden();
            }
            press.Kind = "moon";
        }
        else {
            press.Kind = "sky";
        }
    }
    else {
        const matchValue = nearestKoi(x, y, 9);
        let matchResult, k_1;
        if (matchValue != null) {
            if ((k = matchValue, pondD(x, y) <= 1)) {
                matchResult = 0;
                k_1 = matchValue;
            }
            else {
                matchResult = 1;
            }
        }
        else {
            matchResult = 1;
        }
        switch (matchResult) {
            case 0: {
                ripple(x, y, 0.55, false);
                burstSparks(x, y, 4, "#cfe9e2");
                if (shyT() <= 0) {
                    startleKoi(k_1);
                }
                press.Kind = "koi";
                break;
            }
            case 1: {
                const lanternHit = tryFind((l) => {
                    let arg0__18, arg0__21;
                    const patternInput = rimPoint(l.Angle, l.Scale);
                    return (((arg0__18 = (x - patternInput[0]), Math.pow(arg0__18, 2))) + ((arg0__21 = (y - (patternInput[1] - 5)), Math.pow(arg0__21, 2)))) < Math.pow(11, 2);
                }, lanterns());
                if (lanternHit == null) {
                    const reedHit = tryFindIndex((rd) => {
                        let arg0__26, arg0__28;
                        const patternInput_1 = rimPoint(rd.Angle, rd.Scale);
                        return (((arg0__26 = (x - patternInput_1[0]), Math.pow(arg0__26, 2))) + ((arg0__28 = (y - patternInput_1[1]), Math.pow(arg0__28, 2)))) < Math.pow(17, 2);
                    }, reeds);
                    if (reedHit == null) {
                        if (pondD(x, y) <= 1) {
                            splash(x, y, 1);
                            attract(x, y, 78, 2.4);
                            press.Kind = "water";
                        }
                        else {
                            burstSparks(x, y, 5, "#9fd8c4");
                            window.MossAudio&&window.MossAudio.rustle();
                            press.Kind = "moss";
                        }
                    }
                    else {
                        const i = reedHit | 0;
                        item(i, reeds).Vel = (item(i, reeds).Vel + 2.6);
                        window.MossAudio&&window.MossAudio.rustle();
                        for (let j = 0; j <= 4; j++) {
                            void (motes.push(new Mote(x, y - 4, rr(0, 6.28), rr(0.6, 1.6), rr(0.5, 1))));
                        }
                        press.Kind = "reed";
                    }
                }
                else {
                    const l_1 = lanternHit;
                    press.Kind = "lantern";
                    press.Target = l_1.Index;
                }
                break;
            }
        }
    }
    presses.set(id, press);
}

export function fingerMove(id, x, y) {
    let arg0__13, arg0__15;
    idle(0);
    let matchValue;
    let outArg = defaultOf();
    matchValue = [tryGetValue(presses, id, new FSharpRef(() => outArg, (v) => {
        outArg = v;
    })), outArg];
    if (matchValue[0]) {
        const p = matchValue[1];
        const dx = x - p.X;
        const dy = y - p.Y;
        p.Moved = (p.Moved + Math.sqrt((dx * dx) + (dy * dy)));
        p.X = x;
        p.Y = y;
        if (((p.Kind === "sky") && (Math.abs(x - p.X0) > 26)) && ((t() - p.T0) < 0.8)) {
            veil(1);
            shyT(4);
            window.MossAudio&&window.MossAudio.wind();
            let enumerator = getEnumerator(koi);
            try {
                while (enumerator["System.Collections.IEnumerator.MoveNext"]()) {
                    const k = enumerator["System.Collections.Generic.IEnumerator`1.get_Current"]();
                    k.HasTarget = false;
                    k.Startle = max(k.Startle, 0.6);
                    k.Diving = 1;
                }
            }
            finally {
                disposeSafe(enumerator);
            }
            p.Spent = true;
        }
        else if (p.Kind === "water") {
            if ((t() - p.LastTrail) > 0.085) {
                p.LastTrail = t();
                ripple(x, y, 0.35, false);
                attract(x, y, 60, 1.2);
            }
            if ((t() - p.LastStir) > 0.45) {
                p.LastStir = t();
                window.MossAudio&&window.MossAudio.stir();
            }
            if (Math.sqrt(((arg0__13 = (x - p.X0), Math.pow(arg0__13, 2))) + ((arg0__15 = (y - p.Y0), Math.pow(arg0__15, 2)))) > 34) {
                ripple(x, y, 0.55, false);
            }
        }
    }
}

export function fingerUp(id) {
    idle(0);
    let matchValue;
    let outArg = defaultOf();
    matchValue = [tryGetValue(presses, id, new FSharpRef(() => outArg, (v) => {
        outArg = v;
    })), outArg];
    if (matchValue[0]) {
        const p = matchValue[1];
        if ((p.Kind === "lantern") && !p.Spent) {
            const l = item(~~p.Target, lanterns());
            if (l.Lit) {
                window.MossAudio&&window.MossAudio.chime(l.Note * 2);
                l.Pulse = 1;
                burstSparks(p.X, p.Y, 6, "#ffdca0");
            }
            else if ((t() - p.T0) < 0.45) {
                window.MossAudio&&window.MossAudio.chime(l.Note * 0.5);
            }
        }
        presses.delete(id);
    }
}

export function updateKoi(dt, k) {
    let litPoints;
    const array = lanterns();
    litPoints = array.filter((l) => l.Lit);
    const moonSpd = k.Moon ? 1.15 : 1;
    let targetOpt;
    if (k.Moon) {
        targetOpt = [k.TX, k.TY];
    }
    else if (k.HasTarget && (t() < k.TargetT)) {
        targetOpt = [k.TX, k.TY];
    }
    else if ((gathering() > 0.6) && (litPoints.length > 0)) {
        const l_1 = item(~~Math.abs(k.X + k.Y) % litPoints.length, litPoints);
        const patternInput = rimPoint(l_1.Angle, l_1.Scale - 0.22);
        targetOpt = [patternInput[0], patternInput[1]];
    }
    else {
        targetOpt = undefined;
    }
    let desired;
    if (targetOpt == null) {
        desired = k.Wander;
    }
    else {
        const ty = targetOpt[1];
        const tx = targetOpt[0];
        desired = Math.atan2(ty - k.Y, tx - k.X);
    }
    const d = pondD(k.X, k.Y);
    const desired_1 = (k.Diving > 0) ? Math.atan2((L().Cy + (L().Ry * 0.9)) - k.Y, L().Cx - k.X) : ((d > 0.8) ? (desired + (wrapPi(Math.atan2(L().Cy - k.Y, L().Cx - k.X) - desired) * clamp((d - 0.8) / 0.3, 0, 1))) : desired);
    k.Ang = (k.Ang + clamp(wrapPi(desired_1 - k.Ang), -3.2 * dt, 3.2 * dt));
    const baseSpd = (7 + (k.Size * 0.9)) * moonSpd;
    const targetSpd = (k.Startle > 0) ? ((36 * k.Startle) + (baseSpd * 0.4)) : ((k.Diving > 0) ? (baseSpd * 1.5) : ((targetOpt != null) ? (baseSpd * 1.5) : ((gathering() > 0.6) ? (baseSpd * 0.55) : baseSpd)));
    k.Speed = lerp(k.Speed, targetSpd, clamp(dt * 2.2, 0, 1));
    k.X = (k.X + ((Math.cos(k.Ang) * k.Speed) * dt));
    k.Y = (k.Y + ((Math.sin(k.Ang) * k.Speed) * dt));
    k.Wander = (k.Wander + (rr(-1.4, 1.4) * dt));
    k.Wag = (k.Wag + (dt * (3 + (k.Speed * 0.35))));
    k.Startle = max(0, k.Startle - (dt * 1.6));
    k.Diving = max(0, k.Diving - (dt * 0.7));
    if (k.HasTarget && (t() >= k.TargetT)) {
        k.HasTarget = false;
    }
    if ((k.Speed > 16) && (rnd.NextDouble() < (dt * 4))) {
        void (bubbles.push(new Bubble(k.X - (Math.cos(k.Ang) * 3), k.Y - (Math.sin(k.Ang) * 3), rr(0.4, 1), rr(0.5, 1.2))));
    }
    if (k.Moon && (rnd.NextDouble() < (dt * 10))) {
        void (sparks.push(new Spark(k.X + rr(-3, 3), k.Y + rr(-2, 2), rr(-3, 3), rr(-6, -1), rr(0.6, 1.4), "#bfe4ff")));
    }
    if (k.Moon) {
        k.Life = (k.Life - dt);
    }
}

export function tick(dt) {
    t(t() + dt);
    relayout();
    idle(idle() + dt);
    veil(max(0, veil() - (dt * 0.055)));
    shyT(max(0, shyT() - dt));
    shake(max(0, shake() - (dt * 3.4)));
    shower(max(0, shower() - dt));
    moonKoiT(max(0, moonKoiT() - dt));
    const array = lanterns();
    array.forEach((l) => {
        l.Pulse = max(0, l.Pulse - (dt * 0.7));
    });
    warm(lerp(warm(), litCount() / 4, min(1, dt * 1.5)));
    gathering((idle() > 9) ? min(1, gathering() + (dt * 0.6)) : max(0, gathering() - (dt * 1.5)));
    let enumerator = getEnumerator(presses);
    try {
        while (enumerator["System.Collections.IEnumerator.MoveNext"]()) {
            const p = enumerator["System.Collections.Generic.IEnumerator`1.get_Current"]()[1];
            if (((p.Kind === "lantern") && !p.Spent) && ((t() - p.T0) > 0.42)) {
                p.Spent = true;
                lightLantern(item(~~p.Target, lanterns()));
            }
        }
    }
    finally {
        disposeSafe(enumerator);
    }
    if (!exists((k) => k.Moon, koi)) {
        if ((moonKoiT() > 0) ? true : ((idle() > 24) && (litCount() >= 2))) {
            moonKoiT(0);
            moonKoiSeen(true);
            const a = rr(0, 6.28);
            addKoi(L().Cx + ((Math.cos(a) * L().Rx) * 0.4), L().Cy + ((Math.sin(a) * L().Ry) * 0.4), 6.6, 0, true, 46);
            window.MossAudio&&window.MossAudio.koiSong();
            for (let i = 0; i <= 18; i++) {
                const aa = rr(0, 6.28);
                void (sparks.push(new Spark(L().Cx, L().Cy, Math.cos(aa) * 22, Math.sin(aa) * 12, rr(0.8, 1.8), "#d8ecff")));
            }
        }
    }
    let enumerator_1 = getEnumerator(koi);
    try {
        while (enumerator_1["System.Collections.IEnumerator.MoveNext"]()) {
            const k_1 = enumerator_1["System.Collections.Generic.IEnumerator`1.get_Current"]();
            if (k_1.Moon && (k_1.Life > 0)) {
                const lang = t() * 0.42;
                k_1.TX = (L().Cx + ((Math.cos(lang) * L().Rx) * 0.62));
                k_1.TY = (L().Cy + ((Math.sin(lang) * L().Ry) * 0.58));
                k_1.Diving = 0;
            }
        }
    }
    finally {
        disposeSafe(enumerator_1);
    }
    removeAllInPlace((k_2) => (k_2.Moon && (k_2.Life <= 0)), koi);
    iterate((k_3) => {
        if (!k_3.Moon ? true : (k_3.Life > 0)) {
            updateKoi(dt, k_3);
        }
    }, koi);
    let enumerator_2 = getEnumerator(ripples);
    try {
        while (enumerator_2["System.Collections.IEnumerator.MoveNext"]()) {
            const r = enumerator_2["System.Collections.Generic.IEnumerator`1.get_Current"]();
            r.R = (r.R + ((5 + (17 * r.Power)) * dt));
            r.Life = (r.Life - (dt / r.MaxLife));
        }
    }
    finally {
        disposeSafe(enumerator_2);
    }
    removeAllInPlace((r_1) => (r_1.Life <= 0), ripples);
    let enumerator_3 = getEnumerator(bubbles);
    try {
        while (enumerator_3["System.Collections.IEnumerator.MoveNext"]()) {
            const b = enumerator_3["System.Collections.Generic.IEnumerator`1.get_Current"]();
            b.Y = (b.Y - (16 * dt));
            b.Life = (b.Life - dt);
        }
    }
    finally {
        disposeSafe(enumerator_3);
    }
    removeAllInPlace((b_1) => (b_1.Life <= 0), bubbles);
    let enumerator_4 = getEnumerator(sparks);
    try {
        while (enumerator_4["System.Collections.IEnumerator.MoveNext"]()) {
            const s = enumerator_4["System.Collections.Generic.IEnumerator`1.get_Current"]();
            s.X = (s.X + (s.VX * dt));
            s.Y = (s.Y + (s.VY * dt));
            s.VY = (s.VY + (26 * dt));
            s.VX = (s.VX * (1 - (1.4 * dt)));
            s.Life = (s.Life - dt);
        }
    }
    finally {
        disposeSafe(enumerator_4);
    }
    removeAllInPlace((s_1) => (s_1.Life <= 0), sparks);
    let enumerator_5 = getEnumerator(motes);
    try {
        while (enumerator_5["System.Collections.IEnumerator.MoveNext"]()) {
            const m = enumerator_5["System.Collections.Generic.IEnumerator`1.get_Current"]();
            m.Phase = (m.Phase + (dt * (0.6 + (m.Drift * 0.7))));
            m.Y = (m.Y - ((dt * 0.012) * m.Drift));
        }
    }
    finally {
        disposeSafe(enumerator_5);
    }
    let enumerator_6 = getEnumerator(clouds);
    try {
        while (enumerator_6["System.Collections.IEnumerator.MoveNext"]()) {
            const c = enumerator_6["System.Collections.Generic.IEnumerator`1.get_Current"]();
            c.X = (c.X + (dt * c.Speed));
            if (c.X > 1.15) {
                c.X = -0.2;
            }
        }
    }
    finally {
        disposeSafe(enumerator_6);
    }
    for (let idx = 0; idx <= (reeds.length - 1); idx++) {
        const rd = item(idx, reeds);
        rd.Vel = (rd.Vel + (((-rd.Lean * 6) - (rd.Vel * 1.6)) * dt));
        rd.Lean = (rd.Lean + (rd.Vel * dt));
        rd.Phase = (rd.Phase + (dt * (0.7 + (rd.H * 0.01))));
    }
    const evs = window.MossInput.pull();
    for (let idx_1 = 0; idx_1 <= (evs.length - 1); idx_1++) {
        const e = item(idx_1, evs);
        const kind = str(e, "kind");
        const x = num(e, "x");
        const y = num(e, "y");
        const id = ~~num(e, "id") | 0;
        switch (kind) {
            case "down": {
                fingerDown(id, x, y);
                break;
            }
            case "move": {
                fingerMove(id, x, y);
                break;
            }
            case "up": {
                fingerUp(id);
                break;
            }
            default:
                undefined;
        }
    }
}

export const skyBands = ["#070a17", "#090f21", "#0b1329", "#0e1a31", "#12223c", "#162a46"];

export const waterBands = ["#0a1620", "#0b1a24", "#0c1d28", "#0e2130", "#102636", "#122a3a"];

export const bankBands = ["#0d1714", "#0e1915", "#0f1c17", "#111f19", "#13221c", "#15251e", "#172920", "#192c23", "#1b3026"];

export const mossDots = ["#20382c", "#28452f", "#1a2c22", "#33543a", "#2a4636"];

export const pines = toArray(delay(() => map((i) => [rr(0.01, 0.99), rr(0.055, 0.125), rr(4, 9)], rangeDouble(0, 1, 17))));

export const tufts = toArray(delay(() => map((i) => [rr(0, 1), rr(0, 1), rr(0, 6.28)], rangeDouble(0, 1, 64))));

export const boulders = [[0.09, 0.8, 9], [0.88, 0.72, 11], [0.24, 0.93, 14], [0.71, 0.87, 8]];

export const shrooms = [[0.155, 0.845], [0.183, 0.872], [0.815, 0.925], [0.605, 0.962]];

export const fgBlades = toArray(delay(() => map((i) => [rr(0, 1), rr(6, 20), rr(0, 6.28), rr(0.5, 1)], rangeDouble(0, 1, 44))));

export const pads = [[0.26, 0.42, 5, 0], [0.68, 0.26, 4, 1.7], [0.48, 0.66, 6.5, 3.2], [0.76, 0.58, 3.5, 4.4]];

export function hx(h, i) {
    return parse(substring(h, i, 2), 511, false, 32, 16);
}

export function mix(a, b, t_1) {
    const f = clamp(t_1, 0, 1);
    const r = ~~lerp(hx(a, 1), hx(b, 1), f) | 0;
    const g = ~~lerp(hx(a, 3), hx(b, 3), f) | 0;
    const bl = ~~lerp(hx(a, 5), hx(b, 5), f) | 0;
    return toText(printf("#%02x%02x%02x"))(r)(g)(bl);
}

export function drawSky() {
    window.Gfx.clear(item(0, skyBands));
    const horizon = max(1, L().Horizon);
    const steps = (~~(horizon / 2) + 1) | 0;
    for (let i = 0; i <= steps; i++) {
        const f = i / max(1, steps);
        const idx = min(skyBands.length - 1, ~~(f * skyBands.length)) | 0;
        window.Gfx.rect(0,(i * 2),L().W,2,item(idx, skyBands));
    }
    for (let idx_1 = 0; idx_1 <= (stars.length - 1); idx_1++) {
        const forLoopVar = item(idx_1, stars);
        const sz = forLoopVar[2];
        const sy = forLoopVar[1];
        const sx = forLoopVar[0];
        const a = (0.4 + (0.6 * Math.sin((t() * 0.7) + forLoopVar[3]))) * (1 - (veil() * 0.85));
        if (a > 0.05) {
            window.Gfx.rectA((sx * L().W),(sy * horizon),sz,sz,"#dfeaf7",a);
            if (sz > 1.5) {
                window.Gfx.rectA(((sx * L().W) - 1),((sy * horizon) + 0.5),1,sz,"#9db6c9",(a * 0.5));
            }
        }
    }
    const mx = L().W * 0.775;
    const my = L().H * 0.15;
    const mr = max(6, min(L().W, L().H) * 0.055);
    window.Gfx.glow(mx,my,(mr * 5.5),"rgba(150,190,225,0.28)",(0.55 * (1 - (veil() * 0.5))));
    window.Gfx.ell(mx,my,mr,mr,"#e9f1f6");
    window.Gfx.ell((mx - (mr * 0.3)),(my + (mr * 0.22)),(mr * 0.3),(mr * 0.22),"#d2dfe7");
    window.Gfx.ell((mx + (mr * 0.28)),(my - (mr * 0.26)),(mr * 0.22),(mr * 0.18),"#dae5ed");
    window.Gfx.ellA((mx - (mr * 0.55)),(my - (mr * 0.1)),(mr * 0.16),(mr * 0.12),"#cddae2",0.8);
    window.Gfx.glow(mx,my,(mr * 2.1),"rgba(215,235,248,0.55)",0.2);
    let enumerator = getEnumerator(clouds);
    try {
        while (enumerator["System.Collections.IEnumerator.MoveNext"]()) {
            const c = enumerator["System.Collections.Generic.IEnumerator`1.get_Current"]();
            const cx0 = c.X * L().W;
            const cy0 = c.Y * L().H;
            const w = c.Wid * L().W;
            const a_1 = (c.Alpha * (0.7 + (0.3 * Math.sin((t() * 0.2) + c.Seed)))) * (1 - (veil() * 0.3));
            window.Gfx.ellA(cx0,cy0,(w * 0.5),(w * 0.11),"#93aebf",a_1);
            window.Gfx.ellA((cx0 - (w * 0.2)),(cy0 + 1.5),(w * 0.3),(w * 0.08),"#839fb0",(a_1 * 0.9));
            window.Gfx.ellA((cx0 + (w * 0.22)),(cy0 - 1.2),(w * 0.26),(w * 0.07),"#a6bfcd",(a_1 * 0.7));
        }
    }
    finally {
        disposeSafe(enumerator);
    }
    for (let pass = 0; pass <= 1; pass++) {
        const col = (pass === 0) ? "#08151a" : "#0b1c20";
        const baseY = horizon + ((pass === 0) ? -1 : 2);
        for (let idx_2 = 0; idx_2 <= (pines.length - 1); idx_2++) {
            const forLoopVar_1 = item(idx_2, pines);
            const px = forLoopVar_1[0];
            const pw = forLoopVar_1[2];
            const h = forLoopVar_1[1] * L().H;
            const x = (pass === 0) ? (px * L().W) : (((px * L().W) + 4) % L().W);
            const w_1 = (pass === 0) ? pw : (pw * 0.8);
            window.Gfx.rect((x - w_1),(baseY - (h * 0.28)),(w_1 * 2),(h * 0.28),col);
            window.Gfx.rect((x - (w_1 * 0.72)),(baseY - (h * 0.55)),(w_1 * 1.44),(h * 0.3),col);
            window.Gfx.rect((x - (w_1 * 0.44)),(baseY - (h * 0.8)),(w_1 * 0.88),(h * 0.28),col);
            window.Gfx.rect((x - (w_1 * 0.16)),(baseY - h),(w_1 * 0.4),(h * 0.25),col);
        }
    }
}

export function drawBank() {
    const hz = L().Horizon;
    const steps = (~~((L().H - hz) / 4) + 1) | 0;
    for (let i = 0; i <= steps; i++) {
        const f = clamp(i / max(1, steps), 0, 1);
        window.Gfx.rect(0,(hz + (i * 4)),L().W,4,mix("#0c1613", "#1e3528", Math.pow(f, 0.85)));
    }
    for (let idx = 0; idx <= (speckles.length - 1); idx++) {
        const forLoopVar = item(idx, speckles);
        const sz = forLoopVar[2];
        const px = forLoopVar[0] * L().W;
        const py = hz + (forLoopVar[1] * (L().H - hz));
        const ci = (~~Math.abs((px * 7) + (py * 3)) % mossDots.length) | 0;
        window.Gfx.rectA(px,py,sz,sz,item(ci, mossDots),(0.5 + (0.35 * Math.sin((px * 0.2) + py))));
    }
    for (let idx_1 = 0; idx_1 <= (tufts.length - 1); idx_1++) {
        const forLoopVar_1 = item(idx_1, tufts);
        const x = forLoopVar_1[0] * L().W;
        const y = hz + (forLoopVar_1[1] * (L().H - hz));
        const sway = Math.sin((t() * 0.7) + forLoopVar_1[2]) * 0.7;
        window.Gfx.rect((x + sway),(y - 4),1,4,"#1e3a2b");
        window.Gfx.rect(((x + 1) + (sway * 0.6)),(y - 2.5),1,2.5,"#24452f");
        window.Gfx.rectA((x - 0.5),(y - 1),2,1,"#152a1f",0.8);
    }
    for (let i_1 = 0; i_1 <= 13; i_1++) {
        const a = 3.141592653589793 * (0.08 + ((0.84 * i_1) / 13));
        const x_1 = L().Cx + ((Math.cos(a) * L().Rx) * 1.02);
        const y_1 = L().Cy + ((Math.sin(a) * L().Ry) * 1.15);
        const s2 = 1 + (i_1 % 3);
        window.Gfx.rectA((x_1 - s2),(y_1 - 1),(s2 * 2),2,"#26362c",0.9);
        window.Gfx.rectA((x_1 - s2),(y_1 - 1),(s2 * 2),1,"#42573f",0.5);
    }
}

export function drawBoulder(x, y, s) {
    window.Gfx.ellA(x,(y + (s * 0.26)),(s * 1.3),(s * 0.3),"#04100d",0.55);
    window.Gfx.rect((x - (s * 0.72)),(y - (s * 0.3)),(s * 1.44),(s * 0.62),"#233228");
    window.Gfx.rect((x - (s * 0.9)),(y - (s * 0.06)),(s * 1.8),(s * 0.4),"#24342a");
    window.Gfx.rect((x - (s * 0.5)),(y - (s * 0.52)),(s * 1),(s * 0.34),"#2a3b30");
    window.Gfx.rect((x - (s * 0.3)),(y - (s * 0.62)),(s * 0.6),(s * 0.18),"#2f4135");
    window.Gfx.rectA((x - (s * 0.62)),(y - (s * 0.5)),(s * 0.7),(s * 0.12),"#4a6149",0.55);
    window.Gfx.rectA((x - (s * 0.8)),(y - (s * 0.04)),(s * 0.9),(s * 0.1),"#3d5342",0.45);
    window.Gfx.rectA((x + (s * 0.18)),(y + (s * 0.06)),(s * 0.55),(s * 0.18),"#141f19",0.85);
}

export function drawShroom(x, y) {
    window.Gfx.rectA((x - 0.8),(y - 2.6),1.6,2.6,"#cfc49c",0.9);
    window.Gfx.rectA((x - 2.8),(y - 4.4),5.6,2,"#c8875a",0.95);
    window.Gfx.rectA((x - 2),(y - 5.4),4,1.2,"#e2a973",0.85);
    window.Gfx.rectA((x - 2.2),(y - 3.6),1,1,"#f0e2c0",0.5);
    window.Gfx.glow(x,(y - 3.6),6,"rgba(255,190,130,0.4)",0.16);
}

export function drawStone(angle, scale, size) {
    const patternInput = rimPoint(angle, scale);
    const y = patternInput[1];
    const x = patternInput[0];
    const s = size;
    window.Gfx.ellA(x,(y + (s * 0.35)),(s * 1.5),(s * 0.5),"#060f12",0.5);
    window.Gfx.rect((x - s),(y - (s * 0.5)),(s * 2),(s * 1.1),"#2a3730");
    window.Gfx.rect((x - s),(y - (s * 0.5)),(s * 2),1,"#44574a");
    window.Gfx.rectA((x - (s * 0.8)),(y - (s * 0.7)),(s * 1.6),(s * 0.4),"#4d6152",0.5);
    window.Gfx.rectA((x + (s * 0.2)),(y + (s * 0.1)),(s * 0.5),(s * 0.3),"#1b2622",0.8);
    window.Gfx.rectA((x - (s * 0.7)),(y - (s * 0.62)),(s * 0.7),(s * 0.15),"#5d7a56",0.35);
}

export function drawReed(rd) {
    const patternInput = rimPoint(rd.Angle, rd.Scale);
    const by = patternInput[1];
    const bx = patternInput[0];
    const h = rd.H * (0.8 + (0.2 * Math.sin((t() * 0.5) + rd.Phase)));
    let i = 0;
    while (i < h) {
        const f = i / h;
        const sway = (Math.sin(rd.Phase + (i * 0.14)) * (0.7 + (f * 2.2))) + ((rd.Lean * (i / h)) * 3);
        window.Gfx.rect((bx + sway),(by - i),1,2,((f > 0.75) ? "#2c4a37" : "#1e3b2c"));
        i = (i + 2);
    }
    const tipSway = (Math.sin(rd.Phase + (h * 0.14)) * 2.9) + (rd.Lean * 3);
    window.Gfx.rect((bx + tipSway),((by - h) - 2),1.5,3,"#3f5942");
    window.Gfx.rectA((bx + tipSway),((by - h) - 3),1.5,1,"#557050",0.7);
    const h2 = h * 0.74;
    let j = 0;
    while (j < h2) {
        const f_1 = j / h2;
        const sway_1 = (Math.sin((rd.Phase + 1.7) + (j * 0.12)) * (0.5 + (f_1 * 1.8))) + (rd.Lean * 2);
        window.Gfx.rect(((bx + 1) + sway_1),(by - j),1,2,"#1b3427");
        j = (j + 2);
    }
}

export function drawLantern(l) {
    const patternInput = rimPoint(l.Angle, l.Scale);
    const y = patternInput[1];
    const x = patternInput[0];
    const s = clamp(L().W / 240, 0.8, 1.4);
    const gy = y - (12 * s);
    window.Gfx.ellA(x,(y + 1),(5 * s),(2 * s),"#050d10",0.5);
    window.Gfx.rect((x - (4 * s)),(y - 1),(8 * s),2,"#2b3a2e");
    window.Gfx.rectA((x - (4 * s)),(y - 1),(8 * s),1,"#4d6349",0.6);
    window.Gfx.rect((x - (0.7 * s)),(gy + (2 * s)),(1.4 * s),(9 * s),"#3a2f22");
    window.Gfx.rect((x - (2 * s)),(gy - (0.5 * s)),(4 * s),1,"#4a3b29");
    window.Gfx.rect((x - (3.2 * s)),gy,(6.4 * s),(6 * s),(l.Lit ? "#ffd489" : "#4a4232"));
    window.Gfx.rect((x - (4.2 * s)),(gy - (1.2 * s)),(8.4 * s),(1.4 * s),(l.Lit ? "#ffeec2" : "#5c5240"));
    window.Gfx.rect((x - (2.4 * s)),(gy + (6 * s)),(4.8 * s),(1 * s),(l.Lit ? "#c9a35f" : "#332d24"));
    if (l.Lit) {
        const flick = (0.8 + (0.2 * Math.sin((t() * 3.1) + (l.Index * 1.9)))) + (l.Pulse * 0.4);
        window.Gfx.glow(x,(gy + (3 * s)),((14 * s) + (l.Pulse * 14)),"rgba(255,196,110,0.55)",(0.5 * flick));
        window.Gfx.ellA(x,(gy + (3 * s)),(2 * s),(2.6 * s),"#fff3cf",0.95);
        window.Gfx.rectA((x - (0.8 * s)),(gy + (2 * s)),(1.6 * s),(1.6 * s),"#ffffff",0.75);
    }
    else {
        window.Gfx.rectA((x - (1 * s)),(gy + (1 * s)),(2 * s),(2 * s),"#3a352c",0.9);
    }
}

export function drawMote(m) {
    const x = (m.X * L().W) + (Math.sin(m.Phase * 0.8) * 6);
    const y = (m.Y * L().H) + (Math.sin((m.Phase * 1.3) + 1) * 4);
    const bright = (m.Bright * (0.3 + (0.7 * (0.5 + (0.5 * Math.sin(m.Phase * 1.6)))))) * (0.55 + (gathering() * 0.45));
    window.Gfx.glow(x,y,5,"rgba(190,255,200,0.5)",(bright * 0.5));
    window.Gfx.rectA(x,y,1.5,1.5,"#d8ffd0",bright);
}

export function drawKoi(k) {
    const len = k.Moon ? (k.Size * 2.5) : (k.Size * 2.2);
    const dx = Math.cos(k.Ang);
    const dy = Math.sin(k.Ang);
    const px = -dy;
    const py = dx;
    const a = k.Moon ? 1 : ((shyT() > 0) ? 0.3 : 1);
    const patternInput = k.Moon ? ["#eaf7ff", "#a6d2ee"] : item(k.Shade % koiPalette.length, koiPalette);
    const spotCol = patternInput[1];
    const bodyCol = patternInput[0];
    const wag = Math.sin(k.Wag) * (0.3 + (k.Startle * 0.3));
    if (k.Moon) {
        window.Gfx.glow(k.X,k.Y,(len * 1.15),"rgba(170,220,255,0.42)",(0.35 + (0.12 * Math.sin(t() * 1.4))));
    }
    window.Gfx.ellA(k.X,(k.Y + 1.2),(len * 0.6),(len * 0.32),"#04141c",(0.62 * a));
    window.Gfx.ellA((k.X - ((dx * len) * 0.1)),((k.Y - ((dy * len) * 0.1)) + 1.2),(len * 0.4),(len * 0.2),"#04141c",(0.4 * a));
    const tx = (k.X - ((dx * len) * 0.62)) + (((px * wag) * len) * 0.5);
    const ty = (k.Y - ((dy * len) * 0.62)) + (((py * wag) * len) * 0.5);
    window.Gfx.ellA(tx,ty,(len * 0.33),(len * 0.2),"#04141c",(0.45 * a));
    window.Gfx.ellA(tx,ty,(len * 0.3),(len * 0.17),bodyCol,(a * 0.85));
    window.Gfx.ellA((tx - ((dx * len) * 0.12)),(ty - ((dy * len) * 0.12)),(len * 0.2),(len * 0.12),spotCol,(a * 0.7));
    window.Gfx.ellA(k.X,k.Y,(len * 0.5),(len * 0.26),bodyCol,a);
    window.Gfx.ellA((k.X + ((dx * len) * 0.24)),(k.Y + ((dy * len) * 0.24)),(len * 0.28),(len * 0.23),bodyCol,a);
    window.Gfx.ellA((k.X + ((dx * len) * 0.46)),(k.Y + ((dy * len) * 0.46)),(len * 0.16),(len * 0.15),bodyCol,a);
    window.Gfx.ellA(((k.X - ((dx * len) * 0.06)) + (px * 1.6)),((k.Y - ((dy * len) * 0.06)) + (py * 1.6)),(len * 0.18),(len * 0.11),spotCol,(a * 0.8));
    window.Gfx.ellA(((k.X + ((dx * len) * 0.1)) - (px * 2.4)),((k.Y + ((dy * len) * 0.1)) - (py * 2.4)),(len * 0.13),(len * 0.08),spotCol,(a * 0.55));
    window.Gfx.ellA((k.X + ((px * len) * 0.22)),(k.Y + ((py * len) * 0.22)),(len * 0.2),(len * 0.08),spotCol,(a * 0.45));
    window.Gfx.ellA(((k.X + ((dx * len) * 0.08)) - ((px * len) * 0.13)),((k.Y + ((dy * len) * 0.08)) - ((py * len) * 0.13)),(len * 0.34),(len * 0.06),"#ffffff",(a * 0.2));
    window.Gfx.rectA(((k.X + ((dx * len) * 0.5)) - 0.8),((k.Y + ((dy * len) * 0.5)) - 0.8),1.6,1.6,"#0a1218",(0.9 * a));
}

export function drawPads() {
    for (let idx = 0; idx <= (pads.length - 1); idx++) {
        const forLoopVar = item(idx, pads);
        const pr = forLoopVar[2];
        const x = L().Cx + ((forLoopVar[0] * L().Rx) * 0.85);
        const y = (L().Cy + ((forLoopVar[1] * L().Ry) * 0.8)) + (Math.sin((t() * 0.4) + forLoopVar[3]) * 0.6);
        window.Gfx.ellA(x,y,pr,(pr * 0.72),"#1b382b",0.95);
        window.Gfx.ellA(x,(y - 0.6),(pr * 0.86),(pr * 0.58),"#26492f",0.75);
        window.Gfx.rectA((x - (pr * 0.1)),(y - (pr * 0.1)),(pr * 0.62),(pr * 0.5),"#0c1f2b",0.95);
        window.Gfx.rectA((x - (pr * 0.95)),(y - 0.3),(pr * 0.3),0.8,"#4a7a4c",0.35);
    }
}

export function drawForeground() {
    const lx = L().W * 0.74;
    const ly = L().H * 0.93;
    const ll = L().W * 0.3;
    window.Gfx.ellA(lx,(ly + 3),(ll * 0.5),4,"#050d0a",0.55);
    window.Gfx.rect((lx - (ll * 0.5)),(ly - 3),ll,6,"#241d15");
    window.Gfx.rect((lx - (ll * 0.5)),(ly - 3),ll,1.5,"#382c1f");
    window.Gfx.rectA((lx - (ll * 0.45)),(ly - 0.4),(ll * 0.9),0.8,"#191309",0.5);
    window.Gfx.rectA((lx - (ll * 0.4)),(ly + 1.4),(ll * 0.7),0.8,"#3a2a1a",0.45);
    window.Gfx.rectA((lx - (ll * 0.45)),(ly - 4),(ll * 0.7),1.5,"#3d5c3c",0.85);
    window.Gfx.rectA((lx - (ll * 0.2)),(ly - 4.4),(ll * 0.25),1.2,"#4c6f46",0.7);
    window.Gfx.ell((lx + (ll * 0.5)),ly,3,3,"#3a2d1f");
    window.Gfx.ell((lx + (ll * 0.5)),ly,2,2,"#4d3b28");
    window.Gfx.ellA((lx + (ll * 0.5)),ly,1,1,"#2a2016",0.9);
    window.Gfx.rectA((lx - (ll * 0.34)),(ly - 5),1.4,2,"#cfc49c",0.85);
    window.Gfx.rectA((lx - (ll * 0.36)),(ly - 6.4),3.2,1.4,"#c8875a",0.9);
    for (let idx = 0; idx <= (fgBlades.length - 1); idx++) {
        const forLoopVar = item(idx, fgBlades);
        const sc = forLoopVar[3];
        const gh = forLoopVar[1];
        const x = forLoopVar[0] * L().W;
        const y = L().H + 2;
        let i = 0;
        while (i < (gh * sc)) {
            const f = i / (gh * sc);
            const sway = Math.sin(((t() * 0.55) + forLoopVar[2]) + (i * 0.2)) * (0.6 + (f * 2.6));
            window.Gfx.rectA((x + sway),(y - i),1,2,"#0a1611",(0.85 - (f * 0.25)));
            i = (i + 2);
        }
    }
}

export function drawPond() {
    const mx = L().W * 0.775;
    const my = L().H * 0.15;
    window.Gfx.clipPond(L().Cx,L().Cy,L().Rx,L().Ry);
    const top = L().Cy - L().Ry;
    const steps = ~~((L().Ry * 2) / 2) | 0;
    for (let i = 0; i <= steps; i++) {
        const f = clamp(i / max(1, steps), 0, 1);
        const idx = min(waterBands.length - 1, ~~(f * waterBands.length)) | 0;
        window.Gfx.rect((L().Cx - L().Rx),(top + (i * 2)),(L().Rx * 2),2,item(idx, waterBands));
    }
    for (let i_1 = 0; i_1 <= 9; i_1++) {
        const f_1 = i_1 / 9;
        const y = top + (L().Ry * (0.15 + (f_1 * 1.5)));
        const span = (((Math.sin((t() * 0.25) + (i_1 * 1.7)) * 0.5) + 0.5) * L().Rx) * 1.3;
        const x = (L().Cx + ((Math.cos((t() * 0.16) + i_1) * L().Rx) * 0.55)) - (span * 0.5);
        window.Gfx.rectA(x,y,span,1,"#4c7d7d",(0.05 + (0.03 * Math.sin((t() * 0.5) + i_1))));
    }
    for (let i_2 = 0; i_2 <= 8; i_2++) {
        const y_1 = (top + (L().Ry * 0.55)) + (i_2 * 3);
        const w = (3 + (Math.sin((t() * 0.8) + i_2) * 2)) + (i_2 * 0.7);
        window.Gfx.rectA((mx - (w * 0.5)),y_1,w,1.1,"#cfe6f0",(0.1 + ((0.05 * Math.sin((t() * 1.1) + i_2)) * (1 - (veil() * 0.6)))));
    }
    for (let idx_1 = 0; idx_1 <= (lanterns().length - 1); idx_1++) {
        const l = item(idx_1, lanterns());
        if (l.Lit) {
            const patternInput = rimPoint(l.Angle, l.Scale * 0.92);
            window.Gfx.glow(patternInput[0],patternInput[1],18,"rgba(255,180,90,0.35)",(0.35 + (0.1 * Math.sin((t() * 2) + l.Index))));
        }
    }
    drawPads();
    let enumerator = getEnumerator(ripples);
    try {
        while (enumerator["System.Collections.IEnumerator.MoveNext"]()) {
            const r = enumerator["System.Collections.Generic.IEnumerator`1.get_Current"]();
            const f_2 = clamp(r.Life, 0, 1);
            const rr2 = r.R;
            const col = r.Warm ? "#ffd9a0" : "#c9eef0";
            if (f_2 > 0.72) {
                window.Gfx.glow(r.X,r.Y,(16 * r.Power),"rgba(190,240,240,0.5)",(((f_2 - 0.72) / 0.28) * 0.35));
            }
            window.Gfx.ring(r.X,r.Y,rr2,(rr2 * (L().Ry / L().Rx)),1.2,col,((f_2 * 0.75) * (0.4 + (0.6 * r.Power))));
            window.Gfx.ring(r.X,r.Y,(rr2 * 0.72),((rr2 * 0.72) * (L().Ry / L().Rx)),1,col,((f_2 * 0.32) * r.Power));
        }
    }
    finally {
        disposeSafe(enumerator);
    }
    const sorted = toArray(sortBy((k) => k.Y, koi, {
        Compare: comparePrimitives,
    }));
    for (let idx_2 = 0; idx_2 <= (sorted.length - 1); idx_2++) {
        const k_1 = item(idx_2, sorted);
        if (!k_1.Moon ? true : (k_1.Life > 0)) {
            drawKoi(k_1);
        }
    }
    let enumerator_1 = getEnumerator(bubbles);
    try {
        while (enumerator_1["System.Collections.IEnumerator.MoveNext"]()) {
            const b = enumerator_1["System.Collections.Generic.IEnumerator`1.get_Current"]();
            window.Gfx.ellA(b.X,b.Y,b.R,b.R,"#cfeeea",(clamp(b.Life, 0, 1) * 0.4));
        }
    }
    finally {
        disposeSafe(enumerator_1);
    }
    window.Gfx.unclip();
    window.Gfx.ring(L().Cx,L().Cy,L().Rx,L().Ry,1.2,"#2e554b",0.55);
    window.Gfx.ring(L().Cx,L().Cy,(L().Rx + 2.5),(L().Ry + 2.5),1,"#30503f",0.3);
}

export function draw() {
    relayout();
    window.Gfx.save();
    if (shake() > 0) {
        window.Gfx.translate((rr(-1, 1) * shake()),(rr(-1, 1) * shake()));
    }
    drawSky();
    drawBank();
    window.Gfx.ring(L().Cx,L().Cy,(L().Rx + 1),(L().Ry + 1),3,"#1d3327",0.8);
    for (let idx = 0; idx <= (stones.length - 1); idx++) {
        const forLoopVar = item(idx, stones);
        const s = forLoopVar[1];
        const a = forLoopVar[0];
        if (rimPoint(a, s)[1] < L().Cy) {
            drawStone(a, s, forLoopVar[2]);
        }
    }
    drawPond();
    for (let idx_1 = 0; idx_1 <= (stones.length - 1); idx_1++) {
        const forLoopVar_1 = item(idx_1, stones);
        const s_1 = forLoopVar_1[1];
        const a_1 = forLoopVar_1[0];
        if (rimPoint(a_1, s_1)[1] >= L().Cy) {
            drawStone(a_1, s_1, forLoopVar_1[2]);
        }
    }
    for (let idx_2 = 0; idx_2 <= (reeds.length - 1); idx_2++) {
        drawReed(item(idx_2, reeds));
    }
    for (let idx_3 = 0; idx_3 <= (boulders.length - 1); idx_3++) {
        const forLoopVar_2 = item(idx_3, boulders);
        drawBoulder(forLoopVar_2[0] * L().W, forLoopVar_2[1] * L().H, forLoopVar_2[2]);
    }
    for (let idx_4 = 0; idx_4 <= (shrooms.length - 1); idx_4++) {
        const forLoopVar_3 = item(idx_4, shrooms);
        drawShroom(forLoopVar_3[0] * L().W, forLoopVar_3[1] * L().H);
    }
    if ((L().H - (L().Cy + L().Ry)) > 34) {
        drawForeground();
    }
    for (let idx_5 = 0; idx_5 <= (lanterns().length - 1); idx_5++) {
        drawLantern(item(idx_5, lanterns()));
    }
    let enumerator = getEnumerator(motes);
    try {
        while (enumerator["System.Collections.IEnumerator.MoveNext"]()) {
            drawMote(enumerator["System.Collections.Generic.IEnumerator`1.get_Current"]());
        }
    }
    finally {
        disposeSafe(enumerator);
    }
    let enumerator_1 = getEnumerator(sparks);
    try {
        while (enumerator_1["System.Collections.IEnumerator.MoveNext"]()) {
            const s_2 = enumerator_1["System.Collections.Generic.IEnumerator`1.get_Current"]();
            const a_2 = clamp(s_2.Life * 1.6, 0, 1);
            window.Gfx.rectA(s_2.X,s_2.Y,1.4,1.4,s_2.C,a_2);
        }
    }
    finally {
        disposeSafe(enumerator_1);
    }
    if (warm() > 0.05) {
        window.Gfx.glow(L().Cx,L().Cy,(L().Rx * 1.3),"rgba(255,170,80,0.35)",(warm() * 0.28));
    }
    if (shower() > 0) {
        for (let i = 0; i <= 26; i++) {
            const sx_1 = (L().W * (i / 26)) + (Math.sin(t() + i) * 3);
            const sy_1 = (L().H * 0.9) - ((t() * (60 + (i * 4))) % (L().H * 0.9));
            window.Gfx.rectA(sx_1,sy_1,1.2,5,"#dff0ff",(clamp(shower() / 6, 0, 1) * 0.7));
        }
    }
    window.Gfx.restore();
}

export let lastMs = createAtom(-1);

export function frame(ms) {
    const dt = (lastMs() < 0) ? 0.016 : clamp((ms - lastMs()) / 1000, 0.001, 0.05);
    lastMs(ms);
    tick(dt);
    draw();
    requestAnimationFrame((ms_1) => {
        frame(ms_1);
    });
}

initLanterns();

relayout();

initWorld();

relayout();

requestAnimationFrame((ms) => {
    frame(ms);
});

