const TAU = Math.PI * 2;
function randRange(lo, hi) {
    return lo + Math.random() * (hi - lo);
}
export function makeMotes(count, size) {
    const motes = [];
    for (let i = 0; i < count; i += 1) {
        motes.push({
            x: randRange(0, size),
            y: randRange(0, size),
            vx: randRange(-6, 6),
            vy: randRange(-4, 4),
            r: randRange(0.8, 1.8),
            alpha: randRange(0.05, 0.16),
        });
    }
    return motes;
}
export function stepMotes(motes, step) {
    for (const m of motes) {
        m.x += m.vx * step.dt;
        m.y += m.vy * step.dt;
        if (m.x < 0 || m.x > step.size)
            m.vx *= -1;
        if (m.y < 0 || m.y > step.size)
            m.vy *= -1;
        m.x = Math.max(0, Math.min(step.size, m.x));
        m.y = Math.max(0, Math.min(step.size, m.y));
    }
}
export function spawnPulse(list, spot) {
    list.push({ x: spot.x, y: spot.y, color: spot.color, age: 0, life: spot.life });
}
export function stepPulses(list, dt) {
    for (const p of list)
        p.age += dt;
    for (let i = list.length - 1; i >= 0; i -= 1)
        if (list[i].age >= list[i].life)
            list.splice(i, 1);
}
export function makeFireflies(count, perches) {
    const flies = [];
    for (let i = 0; i < count && perches.length > 0; i += 1) {
        const spot = perches[Math.floor(Math.random() * perches.length)];
        flies.push({
            x: randRange(0, spot.x + 1),
            y: randRange(0, spot.y + 1),
            vx: 0,
            vy: 0,
            tx: spot.x,
            ty: spot.y,
            resting: randRange(0, 2),
        });
    }
    return flies;
}
function wander(fly, dt) {
    fly.vx += Math.cos(randRange(0, TAU)) * 30 * dt;
    fly.vy += Math.sin(randRange(0, TAU)) * 30 * dt;
    const speed = Math.hypot(fly.vx, fly.vy);
    if (speed > 26) {
        fly.vx = (fly.vx / speed) * 26;
        fly.vy = (fly.vy / speed) * 26;
    }
}
function driftHome(fly, dt) {
    const dx = fly.tx - fly.x;
    const dy = fly.ty - fly.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 3)
        return true;
    fly.vx += (dx / dist) * 60 * dt;
    fly.vy += (dy / dist) * 60 * dt;
    return false;
}
function stepOne(fly, step) {
    if (fly.resting > 0) {
        fly.resting -= step.dt;
        fly.vx *= 0.9;
        fly.vy *= 0.9;
        return;
    }
    if (driftHome(fly, step.dt) && Math.random() < 0.02) {
        fly.resting = randRange(1.5, 4);
        return;
    }
    wander(fly, step.dt);
}
export function stepFireflies(flies, step) {
    const limit = step.size - 4;
    for (const fly of flies) {
        stepOne(fly, step);
        fly.x = Math.max(4, Math.min(limit, fly.x + fly.vx * step.dt));
        fly.y = Math.max(4, Math.min(limit, fly.y + fly.vy * step.dt));
    }
}
