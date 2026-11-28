import type { Level } from "./types.js";

/**
 * Six shelves. Each one adds a single idea — a bank to go round, a wall with a
 * gap, moss that drinks momentum, wet stone that will not grip — so a fresh
 * player meets one rule at a time. The hint is the only teaching there is.
 */
export const LEVELS: Level[] = [
  {
    name: "First Roll",
    hint: "Drag a thumb on the shelf to tilt it, and roll the pebble over the light.",
    start: { x: 170, y: 90 },
    motes: [{ x: 170, y: 230 }],
    hollow: { x: 170, y: 370, r: 30 },
    mounds: [],
    walls: [],
    moss: [],
    slick: [],
    bumpers: [],
  },
  {
    name: "Round the Bank",
    hint: "The stone bank will not move, so go round it.",
    start: { x: 80, y: 90 },
    motes: [{ x: 80, y: 300 }],
    hollow: { x: 255, y: 370, r: 28 },
    mounds: [{ x: 170, y: 220, r: 44 }],
    walls: [],
    moss: [],
    slick: [],
    bumpers: [],
  },
  {
    name: "The Narrows",
    hint: "A wall with one gap. The second light waits on the far side.",
    start: { x: 170, y: 80 },
    motes: [{ x: 110, y: 160 }, { x: 230, y: 300 }],
    hollow: { x: 170, y: 400, r: 30 },
    mounds: [],
    walls: [
      { x: 70, y: 215, w: 140, h: 30 },
      { x: 270, y: 215, w: 140, h: 30 },
    ],
    moss: [],
    slick: [],
    bumpers: [],
  },
  {
    name: "Soft Moss",
    hint: "Moss drinks momentum. Keep tilting and it will give.",
    start: { x: 170, y: 80 },
    motes: [{ x: 90, y: 150 }, { x: 250, y: 150 }],
    hollow: { x: 170, y: 400, r: 30 },
    mounds: [],
    walls: [],
    moss: [{ x: 170, y: 250, r: 72 }],
    slick: [],
    bumpers: [],
  },
  {
    name: "Slippery Stone",
    hint: "Wet stone gives no grip. Cross it gently, or the posts will turn you.",
    start: { x: 170, y: 80 },
    motes: [{ x: 80, y: 350 }, { x: 260, y: 350 }],
    hollow: { x: 170, y: 415, r: 30 },
    mounds: [],
    walls: [],
    moss: [],
    slick: [{ x: 170, y: 240, r: 64 }],
    bumpers: [
      { x: 100, y: 245, r: 14, bounce: 0.85 },
      { x: 240, y: 245, r: 14, bounce: 0.85 },
    ],
  },
  {
    name: "All Together",
    hint: "Everything the shelf taught you, plus one hidden stone.",
    start: { x: 70, y: 80 },
    motes: [{ x: 70, y: 200 }, { x: 175, y: 300 }, { x: 290, y: 180 }],
    hollow: { x: 175, y: 425, r: 32 },
    mounds: [{ x: 180, y: 160, r: 40 }],
    walls: [],
    moss: [{ x: 250, y: 300, r: 56 }],
    slick: [{ x: 60, y: 385, r: 40 }],
    bumpers: [
      { x: 80, y: 275, r: 14, bounce: 0.85 },
      { x: 205, y: 375, r: 14, bounce: 0.85 },
    ],
    secret: { x: 305, y: 350 },
  },
];
