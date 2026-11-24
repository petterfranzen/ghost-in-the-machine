// The page: find the elements, size the board, and hand everything to a
// Session. Nothing here knows how the game works.
import { Sink } from './audio.js';
import { parseAll } from './grid.js';
import { RAW_LEVELS } from './levels.js';
import { fitCanvas } from './render.js';
import { Session } from './session.js';
const el = (id) => {
    const found = document.getElementById(id);
    if (!found)
        throw new Error(`deeproot: missing #${id}`);
    return found;
};
const hudOf = () => ({
    level: el('level'),
    goal: el('goal'),
    hint: el('hint'),
    note: el('note'),
    undo: el('undo'),
    restart: el('restart'),
});
const labelSound = (button, on) => {
    button.textContent = on ? 'Sound on' : 'Sound off';
    button.setAttribute('aria-pressed', on ? 'true' : 'false');
    button.title = on ? 'Sound is on — tap to mute' : 'Sound is off — tap to hear the underground';
};
const wireSound = (sound) => {
    const button = el('sound');
    labelSound(button, sound.enabled);
    sound.onChange((on) => labelSound(button, on));
    button.addEventListener('click', () => sound.toggle());
    const nudge = () => sound.resume();
    window.addEventListener('pointerdown', nudge, { once: true });
    window.addEventListener('keydown', nudge, { once: true });
};
export function start() {
    const canvas = el('board');
    const ctx = canvas.getContext('2d');
    if (!ctx)
        return;
    const sound = new Sink();
    wireSound(sound);
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const session = new Session({ canvas, ctx, hud: hudOf(), calm, levels: parseAll(RAW_LEVELS), sound });
    fitCanvas(canvas);
    window.addEventListener('resize', () => fitCanvas(canvas));
    session.begin();
}
