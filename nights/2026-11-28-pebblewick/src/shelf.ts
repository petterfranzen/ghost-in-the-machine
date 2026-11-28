import { matterApi, type Engineish, type MBody, type MatterApi } from "./matter.js";
import { BALL_RADIUS, type Board, type Disc, type Level, type Rect, type Tilt, type Vec } from "./types.js";

/** Gravity at full tilt, in matter.js units (px per ms squared, scaled). */
const GRAVITY = 0.0008;
const STEP_MS = 1000 / 60;
const DRAG_SHELF = 0.02;
const DRAG_MOSS = 0.07;
const DRAG_SLICK = 0.004;
const MOSS_BRAKE = 0.93;

export interface Shelf {
  step(tilt: Tilt): void;
  pos(): Vec;
  speed(): number;
  reset(): void;
}

interface Built {
  engine: Engineish;
  ball: MBody;
}

function disc(d: Disc, p: Vec): boolean {
  return Math.hypot(d.x - p.x, d.y - p.y) < d.r;
}

function inPatch(discs: Disc[], p: Vec): boolean {
  return discs.some((d) => disc(d, p));
}

function wallBody(api: MatterApi, r: Rect): MBody {
  const still = { isStatic: true, friction: 0.9, restitution: 0.2, chamfer: { radius: 10 } };
  return api.Bodies.rectangle(r.x, r.y, r.w, r.h, still);
}

function boundBodies(api: MatterApi, board: Board): MBody[] {
  const thick = 60;
  const half = thick / 2;
  const still = { isStatic: true, friction: 0.9, restitution: 0.2 };
  return [
    api.Bodies.rectangle(board.w / 2, board.h + half, board.w + 2 * thick, thick, still),
    api.Bodies.rectangle(board.w / 2, -half, board.w + 2 * thick, thick, still),
    api.Bodies.rectangle(-half, board.h / 2, thick, board.h + 2 * thick, still),
    api.Bodies.rectangle(board.w + half, board.h / 2, thick, board.h + 2 * thick, still),
  ];
}

function sceneBodies(api: MatterApi, level: Level, board: Board): MBody[] {
  const mounds = level.mounds.map((m) => api.Bodies.circle(m.x, m.y, m.r, { isStatic: true, friction: 0.9, restitution: 0.25 }));
  const bumpers = level.bumpers.map((b) => api.Bodies.circle(b.x, b.y, b.r, { isStatic: true, friction: 0.4, restitution: b.bounce }));
  return [...boundBodies(api, board), ...mounds, ...level.walls.map((r) => wallBody(api, r)), ...bumpers];
}

function create(api: MatterApi, level: Level, board: Board): Built {
  const engine = api.Engine.create({ positionIterations: 8, velocityIterations: 6 });
  engine.gravity.scale = 1;
  const ball = api.Bodies.circle(level.start.x, level.start.y, BALL_RADIUS, {
    friction: 0.9,
    frictionStatic: 1,
    restitution: 0.08,
    frictionAir: DRAG_SHELF,
    density: 0.002,
  });
  for (const body of [...sceneBodies(api, level, board), ball]) api.Composite.add(engine.world, body);
  return { engine, ball };
}

/** The drag under the pebble right now: moss holds it, wet stone lets it run. */
function dragAt(level: Level, p: Vec): number {
  if (inPatch(level.moss, p)) return DRAG_MOSS;
  if (inPatch(level.slick, p)) return DRAG_SLICK;
  return DRAG_SHELF;
}

/**
 * A live physics shelf. Only the pebble moves: the mounds, walls and posts are
 * static, so a shelf is fully described by its level.
 */
export function buildShelf(level: Level, board: Board): Shelf {
  const api = matterApi();
  let built = create(api, level, board);
  const step = (tilt: Tilt): void => {
    built.engine.gravity.x = tilt.x * GRAVITY;
    built.engine.gravity.y = tilt.y * GRAVITY;
    built.ball.frictionAir = dragAt(level, built.ball.position);
    if (inPatch(level.moss, built.ball.position)) {
      const v = built.ball.velocity;
      api.Body.setVelocity(built.ball, { x: v.x * MOSS_BRAKE, y: v.y * MOSS_BRAKE });
    }
    api.Engine.update(built.engine, STEP_MS);
  };
  return {
    step,
    pos: () => ({ x: built.ball.position.x, y: built.ball.position.y }),
    speed: () => api.Body.getSpeed(built.ball),
    reset: () => {
      built = create(api, level, board);
    },
  };
}
