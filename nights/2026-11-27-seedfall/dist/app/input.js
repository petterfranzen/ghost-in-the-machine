const SWIPE = 26;
const MOVE = 10;
const HOLD = 620;
export function bindInput(board, handlers) {
    wirePointer(board, handlers);
    wireKeys(handlers);
}
function direction(dx, dy) {
    if (Math.abs(dx) >= Math.abs(dy))
        return [Math.sign(dx), 0];
    return [0, Math.sign(dy)];
}
function wirePointer(board, handlers) {
    let startX = 0;
    let startY = 0;
    let active = false;
    let moved = false;
    let held = false;
    let hold = 0;
    const stopHold = () => window.clearTimeout(hold);
    board.addEventListener("pointerdown", (e) => {
        active = true;
        moved = false;
        held = false;
        startX = e.clientX;
        startY = e.clientY;
        hold = window.setTimeout(() => {
            if (moved)
                return;
            held = true;
            handlers.listen();
        }, HOLD);
        if (board.setPointerCapture)
            board.setPointerCapture(e.pointerId);
        e.preventDefault();
    }, { passive: false });
    board.addEventListener("pointermove", (e) => {
        if (!active)
            return;
        if (Math.hypot(e.clientX - startX, e.clientY - startY) > MOVE) {
            moved = true;
            stopHold();
        }
        e.preventDefault();
    }, { passive: false });
    board.addEventListener("pointerup", (e) => {
        if (!active)
            return;
        active = false;
        stopHold();
        if (held) {
            e.preventDefault();
            return;
        }
        const [dx, dy] = [e.clientX - startX, e.clientY - startY];
        if (Math.hypot(dx, dy) >= SWIPE) {
            const [sx, sy] = direction(dx, dy);
            handlers.step(sx, sy);
        }
        else {
            const rect = board.getBoundingClientRect();
            handlers.tap((e.clientX - rect.left) / rect.width, (e.clientY - rect.top) / rect.height);
        }
        e.preventDefault();
    }, { passive: false });
    board.addEventListener("pointercancel", () => {
        active = false;
        stopHold();
    });
    board.addEventListener("contextmenu", (e) => e.preventDefault());
}
const KEYS = {
    ArrowUp: [0, -1], ArrowDown: [0, 1], ArrowLeft: [-1, 0], ArrowRight: [1, 0],
    w: [0, -1], s: [0, 1], a: [-1, 0], d: [1, 0],
};
function wireKeys(handlers) {
    window.addEventListener("keydown", (e) => {
        const move = KEYS[e.key] ?? KEYS[e.key.toLowerCase()];
        if (move) {
            handlers.step(move[0], move[1]);
            e.preventDefault();
            return;
        }
        if (e.key === "u" || e.key === "U")
            handlers.undo();
        if (e.key === "r" || e.key === "R")
            handlers.restart();
    });
}
export function bindButtons(buttons, handlers) {
    buttons.up.addEventListener("click", () => handlers.step(0, -1));
    buttons.down.addEventListener("click", () => handlers.step(0, 1));
    buttons.left.addEventListener("click", () => handlers.step(-1, 0));
    buttons.right.addEventListener("click", () => handlers.step(1, 0));
}
