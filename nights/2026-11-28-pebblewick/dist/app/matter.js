export function matterApi() {
    const host = globalThis;
    if (host.Matter === undefined)
        throw new Error("Pebblewick: matter.js did not load");
    return host.Matter;
}
