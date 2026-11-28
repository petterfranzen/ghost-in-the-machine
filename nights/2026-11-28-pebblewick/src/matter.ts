import type { Vec } from "./types.js";

/**
 * Just enough of matter.js to say what we use. The library is vendored as a
 * classic script (`vendor/matter.min.js`), so it arrives on `globalThis.Matter`
 * in the page and is required by the smoke check in Node.
 */
export interface MBody {
  position: Vec;
  velocity: Vec;
  angle: number;
  speed: number;
  frictionAir: number;
}

export interface Engineish {
  gravity: { x: number; y: number; scale: number };
  world: unknown;
}

export interface BodyOptions {
  isStatic?: boolean;
  friction?: number;
  frictionStatic?: number;
  restitution?: number;
  frictionAir?: number;
  density?: number;
  chamfer?: { radius: number };
}

export interface MatterApi {
  Engine: {
    create(config?: { positionIterations?: number; velocityIterations?: number }): Engineish;
    update(engine: Engineish, delta: number): void;
  };
  Composite: { add(world: unknown, body: unknown): void };
  Bodies: {
    circle(x: number, y: number, radius: number, options?: BodyOptions): MBody;
    rectangle(x: number, y: number, width: number, height: number, options?: BodyOptions): MBody;
  };
  Body: {
    setVelocity(body: MBody, velocity: Vec): void;
    getSpeed(body: MBody): number;
  };
}

export function matterApi(): MatterApi {
  const host = globalThis as { Matter?: MatterApi };
  if (host.Matter === undefined) throw new Error("Pebblewick: matter.js did not load");
  return host.Matter;
}
