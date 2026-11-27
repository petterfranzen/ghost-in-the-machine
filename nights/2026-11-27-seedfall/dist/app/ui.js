function need(id) {
    const el = document.getElementById(id);
    if (el === null)
        throw new Error(`Seedfall: #${id} is missing from the page`);
    return el;
}
export function collectUi() {
    return {
        board: need("board"),
        bg: need("bg"),
        level: need("level"),
        goal: need("goal"),
        hint: need("hint"),
        banner: need("banner"),
        bannerText: need("banner-text"),
        next: need("next"),
        sound: need("sound"),
        undo: need("undo"),
        restart: need("restart"),
        note: need("note"),
        pad: { up: need("move-up"), down: need("move-down"), left: need("move-left"), right: need("move-right") },
    };
}
export function showLevel(ui, label) {
    ui.level.textContent = `Glade ${label.index + 1} of ${label.total}`;
    ui.hint.textContent = `${label.name}. ${label.hint}`;
    ui.goal.textContent = "";
}
export function showGoal(ui, done, total) {
    ui.goal.textContent = `Seeds tucked ${done} of ${total}`;
}
export function showBanner(ui, text, last) {
    ui.bannerText.textContent = text;
    ui.next.textContent = last ? "Wander again" : "Next glade";
    ui.banner.hidden = false;
}
export function hideBanner(ui) {
    ui.banner.hidden = true;
}
export function announce(ui, text) {
    ui.note.textContent = text;
}
export function showSound(ui, on) {
    ui.sound.setAttribute("aria-pressed", String(on));
    ui.sound.setAttribute("aria-label", on ? "Sound is on" : "Sound is off");
    ui.sound.textContent = on ? "Sound on" : "Sound off";
}
