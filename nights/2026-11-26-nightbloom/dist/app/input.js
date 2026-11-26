import { CELL } from "./palette.js";
const LONG_PRESS_MS = 340;
const SLOP = 14;
function cellAt(canvas, clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const scale = canvas.width / rect.width;
    const x = (clientX - rect.left) * scale;
    const y = (clientY - rect.top) * scale;
    return { r: Math.floor(y / CELL), c: Math.floor(x / CELL) };
}
function within(canvas, r, c) {
    return r >= 0 && c >= 0 && r < canvas.height / CELL && c < canvas.width / CELL;
}
export function attachPointer(canvas, handlers) {
    let down = null;
    let moving = false;
    let timer = 0;
    let previewing = false;
    const endPreview = () => {
        if (previewing)
            handlers.onPreviewEnd();
        previewing = false;
    };
    const clear = () => {
        window.clearTimeout(timer);
        down = null;
        moving = false;
    };
    canvas.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        const { r, c } = cellAt(canvas, event.clientX, event.clientY);
        if (!within(canvas, r, c))
            return;
        down = { clientX: event.clientX, clientY: event.clientY, r, c };
        moving = false;
        timer = window.setTimeout(() => {
            if (!down || moving)
                return;
            previewing = true;
            handlers.onPreview(down.r, down.c);
        }, LONG_PRESS_MS);
    }, { passive: false });
    canvas.addEventListener("pointermove", (event) => {
        if (!down)
            return;
        if (Math.hypot(event.clientX - down.clientX, event.clientY - down.clientY) > SLOP) {
            moving = true;
            if (previewing)
                endPreview();
        }
    });
    canvas.addEventListener("pointerup", () => {
        if (!down)
            return;
        const { r, c } = down;
        const tapped = !previewing && !moving ? { r, c } : null;
        endPreview();
        clear();
        if (tapped)
            handlers.onTap(tapped.r, tapped.c);
    });
    canvas.addEventListener("pointercancel", () => {
        endPreview();
        clear();
    });
}
