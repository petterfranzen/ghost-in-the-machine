function need(id) {
    const el = document.getElementById(id);
    if (el === null)
        throw new Error(`Pebblewick: #${id} is missing`);
    return el;
}
function needCanvas(id) {
    const el = need(id);
    if (!(el instanceof HTMLCanvasElement))
        throw new Error(`Pebblewick: #${id} is not a canvas`);
    return el;
}
function needButton(id) {
    const el = need(id);
    if (!(el instanceof HTMLButtonElement))
        throw new Error(`Pebblewick: #${id} is not a button`);
    return el;
}
export function collectUi() {
    return {
        bg: needCanvas("bg"),
        board: needCanvas("board"),
        level: need("level"),
        goal: need("goal"),
        hint: need("hint"),
        banner: need("banner"),
        bannerText: need("banner-text"),
        next: needButton("next"),
        undo: needButton("undo"),
        restart: needButton("restart"),
        pad: need("pad"),
        note: need("note"),
        sound: needButton("sound"),
    };
}
export function showLevel(ui, index, total, level) {
    ui.level.textContent = `Shelf ${index + 1} of ${total}: ${level.name}`;
    ui.hint.textContent = level.hint;
}
export function showGoal(ui, lit, total, ready) {
    const aim = ready ? "the hollow is awake" : "the hollow still sleeps";
    ui.goal.textContent = total === 1 ? `Light 1 of 1 - ${aim}` : `Lights ${lit} of ${total} - ${aim}`;
}
export function showBanner(ui, text, last) {
    ui.bannerText.textContent = text;
    ui.next.textContent = last ? "Roll the shelves again" : "Next shelf";
    ui.banner.hidden = false;
}
export function hideBanner(ui) {
    ui.banner.hidden = true;
}
export function announce(ui, text) {
    ui.note.textContent = text;
}
