function need(id) {
    const el = document.getElementById(id);
    if (!el)
        throw new Error(`Nightbloom: missing #${id}`);
    return el;
}
export function hud() {
    return {
        level: need("level"),
        goal: need("goal"),
        hint: need("hint"),
        undo: need("undo"),
        restart: need("restart"),
        next: need("next"),
        banner: need("banner"),
        bannerText: need("banner-text"),
        note: need("note"),
    };
}
export function showLevel(hud, view) {
    hud.level.textContent = `Meadow ${view.index + 1} of ${view.count} \u00b7 ${view.name}`;
    hud.hint.textContent = view.hint;
}
export function showProgress(hud, counts) {
    hud.goal.textContent = `Flowers open ${counts.open} of ${counts.total}`;
}
export function showBanner(hud, view) {
    hud.bannerText.textContent = view.text;
    hud.next.textContent = view.label;
    hud.banner.hidden = false;
}
export function hideBanner(hud) {
    hud.banner.hidden = true;
}
export function setNote(hud, text) {
    hud.note.textContent = text;
}
