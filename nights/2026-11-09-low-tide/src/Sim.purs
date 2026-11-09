-- Low Tide — the whole rule set of the shore, as pure functions.
-- The JS host (src/host.js) owns pixels, input, audio and the DOM and calls
-- only these functions, so every rule of the piece is testable in node.
module Sim where

import Prelude

import Data.Array as A
import Data.Int as I
import Data.Maybe (Maybe(..), fromMaybe)
import Data.Number as N

-- ------------------------------------------------------------------ types

-- A tide pool: an ellipse on the rock shelf. `wet` rises when it is stirred
-- and slowly settles back; the tide raises every pool's resting wetness.
type Pool =
  { cx :: Number
  , cy :: Number
  , rx :: Number
  , ry :: Number
  , wet :: Number
  , kind :: Int
  }

-- One small resident per pool. `awake` eases back to a low resting value, so
-- a woken creature drifts a little longer and then quiets down, never leaving.
type Beast =
  { kind :: Int
  , home :: Int
  , x :: Number
  , y :: Number
  , awake :: Number
  , woke :: Boolean
  , phase :: Number
  }

type Ripple =
  { x :: Number
  , y :: Number
  , r :: Number
  , life :: Number
  , ttl :: Number
  , grow :: Number
  , kind :: Int -- 0 = open water, 1 = pool
  }

type Bubble =
  { x :: Number
  , y :: Number
  , life :: Number
  , ttl :: Number
  , rise :: Number
  }

type State =
  { w :: Number
  , h :: Number
  , motion :: Number -- 1.0, or ~0.35 under prefers-reduced-motion
  , t :: Number
  , salt :: Number
  , seaY :: Number
  , pools :: Array Pool
  , beasts :: Array Beast
  , ripples :: Array Ripple
  , bubbles :: Array Bubble
  , moonX :: Number
  , moonY :: Number
  , gladeT :: Number -- target of the moonlight secret
  , glade :: Number
  , tide :: Number
  , wakes :: Int
  , done :: Boolean
  , visitor :: Number
  , idle :: Number
  , hint :: Number
  , held :: Boolean
  , heldT :: Number
  , holdOX :: Number
  , holdOY :: Number
  , holdX :: Number
  , holdY :: Number
  , seq :: Int
  , say :: String
  , evt :: Int -- 0 quiet, 1 a creature woke, 2 the tide came in, 3 moonlight
  }

-- ---------------------------------------------------------------- helpers

-- A cheap deterministic hash: the shore's only source of "randomness", so a
-- frame can be reproduced from the state alone.
hash :: Number -> Number -> Number
hash a b = frac (N.sin (a * 12.9898 + b * 78.233) * 43758.5453)

frac :: Number -> Number
frac x = x - N.floor x

clampN :: Number -> Number -> Number -> Number
clampN lo hi v = if v < lo then lo else if v > hi then hi else v

dist :: Number -> Number -> Number -> Number -> Number
dist x1 y1 x2 y2 = N.sqrt ((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1))

setAt :: forall a. Int -> (a -> a) -> Array a -> Array a
setAt i f arr = fromMaybe arr (A.modifyAt i f arr)

pushCapped :: Int -> Ripple -> Array Ripple -> Array Ripple
pushCapped cap r arr =
  let grown = A.snoc arr r
      over = A.length grown - cap
  in if over > 0 then A.drop over grown else grown

-- --------------------------------------------------------------- geometry

-- Where everything sits. Pools are placed as fractions of the rock shelf so
-- the same four pools survive a resize and any phone or desktop aspect.
poolFracs :: Array { cx :: Number, cy :: Number, rx :: Number, ry :: Number }
poolFracs =
  [ { cx: 0.25, cy: 0.24, rx: 0.160, ry: 0.120 }
  , { cx: 0.69, cy: 0.18, rx: 0.135, ry: 0.095 }
  , { cx: 0.47, cy: 0.56, rx: 0.205, ry: 0.150 }
  , { cx: 0.79, cy: 0.82, rx: 0.125, ry: 0.100 }
  ]

type Geo =
  { seaY :: Number
  , pools :: Array Pool
  , moonX :: Number
  , moonY :: Number
  }

geo :: Number -> Number -> Geo
geo w h =
  let seaY = h * 0.40
      band = max 24.0 (h - seaY)
      pools =
        A.mapWithIndex
          ( \i p ->
              { cx: w * p.cx
              , cy: seaY + band * p.cy
              , rx: w * p.rx
              , ry: band * p.ry
              , wet: 0.30
              , kind: i
              }
          )
          poolFracs
  in { seaY, pools, moonX: w * 0.79, moonY: seaY * 0.34 }

beastSpeed :: Array Number
beastSpeed = [ 0.50, 0.30, 0.22, 0.80 ]

beastName :: Int -> String
beastName k = fromMaybe "Something small wakes." (A.index names k)
  where
  names =
    [ "The hermit crab wakes and scuttles."
    , "The starfish stretches."
    , "The anemone unfolds."
    , "The little goby darts awake."
    ]

inside :: Number -> Number -> Pool -> Boolean
inside x y p =
  let rx = if p.rx < 1.0 then 1.0 else p.rx
      ry = if p.ry < 1.0 then 1.0 else p.ry
      dx = (x - p.cx) / rx
      dy = (y - p.cy) / ry
  in dx * dx + dy * dy <= 1.0

poolOf :: Array Pool -> Int -> Pool
poolOf ps i = fromMaybe dud (A.index ps i)
  where
  dud = { cx: 0.0, cy: 0.0, rx: 1.0, ry: 1.0, wet: 0.0, kind: 0 }

-- ------------------------------------------------------------------ life

initial :: Number -> Number -> Number -> State
initial w h motion =
  let g = geo w h
      beasts =
        A.mapWithIndex
          ( \i p ->
              { kind: i
              , home: i
              , x: p.cx - p.rx * 0.25
              , y: p.cy
              , awake: 0.0
              , woke: false
              , phase: 0.7 * I.toNumber i
              }
          )
          g.pools
  in { w
     , h
     , motion
     , t: 0.0
     , salt: 0.37
     , seaY: g.seaY
     , pools: g.pools
     , beasts
     , ripples: []
     , bubbles: []
     , moonX: g.moonX
     , moonY: g.moonY
     , gladeT: 0.0
     , glade: 0.0
     , tide: 0.0
     , wakes: 0
     , done: false
     , visitor: 0.0
     , idle: 0.0
     , hint: 0.0
     , held: false
     , heldT: 0.0
     , holdOX: 0.0
     , holdOY: 0.0
     , holdX: 0.0
     , holdY: 0.0
     , seq: 0
     , say: ""
     , evt: 0
     }

resize :: Number -> Number -> State -> State
resize w h s =
  let g = geo w h
      keepWet = A.length s.pools == 4
      pools = if keepWet then A.zipWith (\nw old -> nw { wet = old.wet }) g.pools s.pools else g.pools
      beasts =
        if A.length s.beasts == 4 then A.zipWith (\nw old -> old { x = nw.cx, y = nw.cy }) g.pools s.beasts
        else s.beasts
  in s { w = w, h = h, seaY = g.seaY, pools = pools, beasts = beasts, moonX = g.moonX, moonY = g.moonY }

withMotion :: Number -> State -> State
withMotion m s = s { motion = m }

-- ---------------------------------------------------------------- input

press :: Number -> Number -> State -> State
press x y s =
  s { held = true, heldT = 0.0, holdOX = x, holdOY = y, holdX = x, holdY = y, idle = 0.0 }

move :: Number -> Number -> State -> State
move x y s =
  if s.held && dist s.holdOX s.holdOY x y > 8.0 then s { held = false, heldT = 0.0, holdX = x, holdY = y }
  else s { holdX = x, holdY = y }

release :: State -> State
release s = s { held = false, heldT = 0.0 }

-- A tap always blooms softly. In a pool it wets the rim, settles bubbles and
-- wakes whatever lives there; on open water it sends a longer ring across.
tap :: Number -> Number -> State -> State
tap x y s =
  let s0 = s { idle = 0.0 }
      calm = s0.motion < 1.0
      openRing = { x, y, r: 3.0, life: 0.0, ttl: if calm then 1.4 else 2.8, grow: 26.0, kind: 0 }
      poolRing = { x, y, r: 2.0, life: 0.0, ttl: if calm then 1.0 else 2.0, grow: 14.0, kind: 1 }
      hit = A.findIndex (inside x y) s0.pools
  in case hit of
      Just i -> wake i s0 poolRing
      Nothing ->
        s0
          { ripples = pushCapped 40 poolRing (pushCapped 40 openRing s0.ripples)
          , bubbles = A.snoc s0.bubbles { x, y, life: 0.0, ttl: 1.6, rise: 2.5 }
          , seq = s0.seq + 1
          , say = "The water rings out and settles."
          }

wake :: Int -> State -> Ripple -> State
wake i s ring =
  let p = poolOf s.pools i
      splash =
        A.snoc s.bubbles
          { x: p.cx + (s.salt - 0.5) * p.rx * 0.6
          , y: p.cy + (hash s.salt 5.0 - 0.5) * p.ry * 0.6
          , life: 0.0
          , ttl: 1.8
          , rise: 2.0
          }
      stirred =
        s
          { pools = setAt i (\q -> q { wet = min 1.0 (q.wet + 0.40) }) s.pools
          , ripples = pushCapped 40 ring s.ripples
          , bubbles = splash
          }
  in case A.index s.beasts i of
      Just b
        | not b.woke ->
            let wakes = s.wakes + 1
                finished = wakes >= 4
            in stirred
                 { beasts = setAt i (\bb -> bb { awake = 1.0, woke = true, phase = bb.phase }) stirred.beasts
                 , wakes = wakes
                 , done = finished
                 , seq = stirred.seq + 1
                 , evt = if finished then 2 else 1
                 , say =
                     if finished then "The tide comes in, and every pool shines."
                     else beastName b.kind
                 }
      Just _ -> stirred { beasts = setAt i (\bb -> bb { awake = 1.0 }) stirred.beasts }
      Nothing -> stirred

-- ------------------------------------------------------------------ time

stepBeast :: Number -> Number -> State -> Beast -> Beast
stepBeast dt m s b =
  let p = poolOf s.pools b.home
      resting = if b.woke then 0.26 else 0.0
      awake = max resting (b.awake - dt * 0.14)
      e = clampN 0.0 1.0 ((awake - 0.30) / 0.70)
      speed = fromMaybe 0.4 (A.index beastSpeed b.kind)
      k = I.toNumber b.kind
      phase = if b.awake > 0.30 then b.phase + dt * speed * m else b.phase
      sway = 0.55 + 0.45 * hash k 3.0
      x = p.cx + N.cos phase * p.rx * 0.45 * e * sway
      y = p.cy + N.sin (phase * (1.0 + 0.4 * hash k 9.0)) * p.ry * 0.40 * e
  in if e <= 0.0 then b { awake = awake, phase = phase }
     else b { awake = awake, phase = phase, x = x, y = y }

tick :: Number -> State -> State
tick dt0 s =
  let dt = clampN 0.0 0.05 dt0
      m = s.motion
      s0 = s { t = s.t + dt, idle = s.idle + dt, salt = hash s.salt (s.t + 1.0) }
      -- A still press held over the moon: the secret. A quick tap there is
      -- just an ordinary bloom.
      heldT = if s0.held then s0.heldT + dt else 0.0
      overMoon = s0.held && dist s0.holdX s0.holdY s0.moonX s0.moonY < 15.0
      fire = overMoon && heldT >= 1.05 && s0.gladeT < 0.5
      s1 =
        s0
          { heldT = heldT
          , gladeT = if fire then 1.0 else s0.gladeT
          , seq = if fire then s0.seq + 1 else s0.seq
          , evt = if fire then 3 else s0.evt
          , say = if fire then "Moonlight pours across the water." else s0.say
          }
      s2 = s1 { tide = if s1.done then min 1.0 (s1.tide + dt / 7.0) else 0.0 }
      s3 =
        s2
          { visitor = if s2.tide > 0.85 then min 1.0 (s2.visitor + dt / 3.5) else s2.visitor
          , glade = s2.glade + (s2.gladeT - s2.glade) * clampN 0.0 1.0 (dt * 0.9)
          , hint = clampN 0.0 1.0 ((s2.idle - 25.0) / 12.0)
          }
      ripples =
        A.filter (\r -> r.life < r.ttl)
          (map (\r -> r { r = r.r + r.grow * dt * m, life = r.life + dt }) s3.ripples)
      bubbles =
        A.filter (\b -> b.life < b.ttl)
          (map (\b -> b { y = b.y - b.rise * dt * m, life = b.life + dt }) s3.bubbles)
      wetBase = 0.28 + s3.tide * 0.72
      pools = map (\p -> p { wet = p.wet + (wetBase - p.wet) * clampN 0.0 1.0 (dt * 0.9) }) s3.pools
      beasts = map (stepBeast dt m s3) s3.beasts
  in s3 { ripples = ripples, bubbles = bubbles, pools = pools, beasts = beasts }
