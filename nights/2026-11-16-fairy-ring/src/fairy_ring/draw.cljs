(ns fairy-ring.draw
  "Everything you can see: sky, treeline, moss, the ring of mushrooms, a
  gnome, spores. All of it is drawn into a small pixel grid and blown up by
  the CSS, so a 'pixel' here is one fat screen pixel."
  (:require [fairy-ring.pal :as pal]))

(defn- fract [x] (- x (Math/floor x)))
(defn- hash1 [n] (fract (* (js/Math.sin (* n 12.9898)) 43758.5453)))

(defn- da [dawn] (pal/smooth (pal/clamp (/ dawn 0.9) 0 1)))

;; ---- sky -----------------------------------------------------------------

(defn draw-sky [ctx st]
  (let [{:keys [w h horizon]} (:lay st)
        d (da (:dawn st))
        top (pal/mix pal/sky-top-n pal/sky-top-d d)
        mid (pal/mix pal/sky-mid-n pal/sky-mid-d d)
        low (pal/mix pal/sky-low-n pal/sky-low-d d)
        band 3]
    (loop [y 0 i 0]
      (when (< y (+ h 4))
        (let [t (pal/clamp (/ y (max 1 horizon)) 0 1)
              c (pal/mix3 top mid low t)]
          (pal/span-band ctx y w band c 1 (even? i)))
        (recur (+ y band) (inc i))))))

(defn draw-stars [ctx st]
  (let [{:keys [w h]} (:lay st)
        fade (Math/pow (- 1 (da (:dawn st))) 1.4)
        n 46]
    (when (> fade 0.02)
      (dotimes [i n]
        (let [sy (* h 0.50 (hash1 i))
              sx (* w (hash1 (+ i 91)))
              tw (* 0.6 0.5 (+ 1.0 (js/Math.sin (+ (* (:t st) (pal/lerp 0.4 1.1 (hash1 (+ i 7))))
                                                      (* 6.0 (hash1 (+ i 13)))))))
              r (if (> (hash1 (+ i 41)) 0.88) 1.4 0.8)]
          (pal/disc ctx sx sy r pal/star (pal/clamp (* fade tw) 0 1))
          (when (> r 1.2)
            (pal/dot ctx sx sy pal/star (* fade 0.9))))))))

(defn draw-moon [ctx st]
  (let [{:keys [w h]} (:lay st)
        fade (Math/pow (- 1 (da (:dawn st))) 1.1)
        s (:scale (:lay st))
        cx (* w 0.76)
        cy (* h 0.15)
        r (* 5.5 s)]
    (when (> fade 0.05)
      (pal/halo ctx cx cy (* r 2.6) pal/moon (* fade 0.10) 3)
      (pal/disc ctx cx cy r pal/moon (* fade 0.94))
      (pal/dot ctx (+ cx (* r 0.4)) (+ cy (* r 0.2)) pal/moon-shade (* fade 0.8))
      (pal/dot ctx (- cx (* r 0.35)) (- cy (* r 0.4)) pal/moon-shade (* fade 0.7))
      (pal/dot ctx (+ cx (* r 0.1)) (- cy (* r 0.1)) pal/moon-shade (* fade 0.5)))))

(defn- pine [ctx x y hgt c a]
  (loop [i 0]
    (when (< i hgt)
      (let [t (/ i hgt)
            half (+ 0.6 (* 2.6 t))]
        (pal/px ctx (- x half) (- y i) (* 2 half) 1 c a))
      (recur (inc i)))))

(defn draw-treeline [ctx st]
  (let [{:keys [w horizon]} (:lay st)
        d (da (:dawn st))
        back (pal/mix pal/tree-n pal/tree-d (* d 0.8))
        front (pal/mix pal/tree-n pal/tree-d d)
        rim (pal/mix pal/tree-rim-n pal/tree-rim-d d)
        n (max 8 (int (/ w 9)))]
    (dotimes [row 2]
      (dotimes [i n]
        (let [k (+ i (* row 100))
              x (+ (* w (/ (+ i (if (odd? row) 0.5 0.0)) n)) (pal/rnd* -4 4))
              hgt (+ 8 (* 16 (hash1 (+ k 3))) (* (- 1 row) 6))
              tone (if (zero? row) front back)
              jitter (pal/rnd* -3 3)]
          (pine ctx (+ x jitter) (+ horizon (- (if (zero? row) 0 4)) (* (hash1 (+ k 17)) 3)) hgt tone (if (zero? row) 0.95 0.72))
          (when (and (zero? row) (> d 0.25))
            (pine ctx (+ x jitter -0.6) (+ horizon (* (hash1 (+ k 17)) 3)) (* hgt 0.6) rim (* 0.5 d))))))))

(defn draw-mist [ctx st]
  (let [d (da (:dawn st))]
    (doseq [m (:mist st)]
      (pal/halo ctx (:x m) (:y m) (:r m)
                (pal/mix [140 170 190] [250 226 200] d)
                (* (:a m) (+ 0.5 (* 0.5 (:wind st)))) 3))))

;; ---- ground --------------------------------------------------------------

(defn draw-ground [ctx st]
  (let [{:keys [w h horizon]} (:lay st)
        d (da (:dawn st))
        base (pal/mix pal/ground-n pal/ground-d d)
        dark (pal/mix pal/ground-dark-n pal/ground-dark-d d)
        band 3]
    (loop [y (Math/floor horizon) i 0]
      (when (< y (+ h 2))
        (let [t (pal/clamp (/ (- y horizon) (max 1 (- h horizon))) 0 1)
              c (pal/mix base dark (* 0.55 t))]
          (pal/span-band ctx y w (+ band 2) c 1 (even? i)))
        (recur (+ y band) (inc i))))
    ;; dew-lit edge along the horizon
    (let [lit (pal/mix pal/moss-n pal/moss-lit-d (* 0.8 d))]
      (pal/px ctx 0 (- horizon 2) w 2 lit 0.35)
      (pal/px ctx 0 horizon w 1 lit 0.20))
    ;; moss speckles, deterministic, brighter where the dawn touches
    (dotimes [i 240]
      (let [x (* w (hash1 (+ i 5)))
            t (* 0.92 (hash1 (+ i 23)))
            y (+ horizon (* (- h horizon) t))
            lit (+ 0.25 (* 0.75 (pal/clamp (- 1 t) 0 1)) d)
            c (pal/mix pal/moss-n pal/moss-d (pal/clamp (* lit (+ 0.4 (* 0.6 (hash1 (+ i 61))))) 0 1))]
        (pal/px ctx x y (if (> (hash1 (+ i 77)) 0.7) 2 1) 1 c (+ 0.25 (* 0.45 d)))))))

(defn draw-glows [ctx st]
  (doseq [g (:glows st)]
    (let [t (/ (:life g) (:max g))
          a (* 0.55 (Math/sin (* js/Math.PI (pal/clamp t 0 1))))
          d (da (:dawn st))
          c (pal/mix pal/dew pal/firefly (* 0.5 d))]
      (pal/halo ctx (:x g) (:y g) (:r g) c a 2))))

(defn draw-ring-shadow [ctx st]
  (let [{:keys [cx cy rx ry]} (get-in st [:lay :ring])]
    (pal/halo ctx cx (+ cy 1) (* rx 1.25) pal/ground-dark-n 0.22 2)
    (pal/halo ctx cx (+ cy 1) (* rx 0.8) pal/ground-dark-n 0.14 2)))

;; ---- mushrooms -----------------------------------------------------------

(defn draw-mushroom [ctx st m]
  (let [{:keys [x y cap-r stalk-h cap glow-c glow bloom door tilt elder?]} m
        t (:t st)
        d (da (:dawn st))
        sway (* 0.6 (js/Math.sin (+ (:ph m) (* t 0.9))) (:wind st))
        x (+ x sway)
        cap-x (+ x (* tilt cap-r))
        open (* cap-r 0.18 bloom)
        r (+ cap-r open)
        lift (- (* 1.4 bloom) (* 0.6 (:wind st)))
        cap-y (- y stalk-h lift)
        shade (pal/mix cap pal/ground-dark-n 0.35)
        lit (pal/mix cap [255 236 226] (+ 0.12 (* 0.35 d)))]
    ;; shadow
    (pal/halo ctx x (+ y 1) (* cap-r 1.15) pal/ground-dark-n 0.30 2)
    ;; stalk
    (let [sw (* cap-r 0.26)
          wobble (* 0.5 sway)]
      (loop [i 0]
        (when (< i stalk-h)
          (let [t0 (/ i (max 1 stalk-h))
                cx2 (+ x (* wobble (- 1 t0)))
                w0 (* sw (+ 1.0 (* 0.5 (- 1 t0))))
                c (if (< (hash1 (+ (:i m) (* i 3))) 0.5) pal/stalk pal/stalk-dim)]
            (pal/px ctx (- cx2 w0) (- cap-y (- stalk-h) (- i)) (* 2 w0) 1 c 1))
          (recur (inc i)))))
    ;; gills under the cap
    (pal/px ctx (- cap-x r) (- cap-y 0) (* 2 r) 1 (pal/mix glow-c pal/cap-spot 0.3) (+ 0.35 (* 0.5 glow)))
    ;; the cap: a dome drawn row by row
    (loop [dy 0]
      (when (< dy (* r 0.95))
        (let [t0 (/ dy (* r 0.95))
              half (* r (Math/sqrt (max 0 (- 1 (* t0 t0)))))]
          (pal/px ctx (- cap-x half) (- cap-y (dec dy)) (* 2 half) 1 cap 1)
          (recur (inc dy)))))
    ;; lit edge + shaded underside
    (loop [dy 0]
      (when (< dy (* r 0.95))
        (let [t0 (/ dy (* r 0.95))
              half (* r (Math/sqrt (max 0 (- 1 (* t0 t0)))))]
          (pal/px ctx (- cap-x (* half 0.92)) (- cap-y (dec dy)) (* 1.3 half) 1 lit (+ 0.30 (* 0.3 d)))
          (recur (inc (+ dy 2))))))
    (pal/px ctx (- cap-x r) (- cap-y 0) (* 2 r) 1 shade 0.55)
    ;; spots
    (doseq [sp [[-0.42 0.30] [0.16 0.52] [0.55 0.24] [-0.05 0.10]]]
      (let [sx (+ cap-x (* r (nth sp 0)))
            sy (- cap-y (* r (nth sp 1)))]
        (pal/px ctx sx sy (max 1 (* r 0.22)) (max 1 (* r 0.20)) pal/cap-spot (* 0.55 (+ 0.35 d)))))
    ;; glow under the cap and around the stalk
    (when (> glow 0.06)
      (pal/halo ctx cap-x (- cap-y 1) (* r 1.5) glow-c (* 0.55 glow) 3)
      (pal/halo ctx cap-x (- y (* stalk-h 0.45)) (* r 0.7) glow-c (* 0.30 glow) 2))
    ;; the elder's little door, once you find it
    (when (> door 0.05)
      (let [dw (* 6.0 (:scale (:lay st)))
            dh (* 9.0 (:scale (:lay st)))
            dx (- x (* dw 0.5))
            dy (- y dh)]
        (pal/px ctx dx dy dw dh pal/ground-dark-n (* 0.8 door))
        (pal/px ctx (+ dx 1) (+ dy 2) (- dw 2) (- dh 2) pal/glow-warm (* 0.55 door))
        (pal/halo ctx (+ dx (* dw 0.5)) (+ dy (* dh 0.55)) (* dw 1.5) pal/glow-warm (* 0.6 door) 3)
        (pal/px ctx (+ dx 1) (+ dy 1) (- dw 2) 1 [255 232 190] (* 0.9 door))))))

(defn draw-mushrooms [ctx st]
  (doseq [m (sort-by :depth (:mushrooms st))]
    (draw-mushroom ctx st m)))

;; ---- gnome ---------------------------------------------------------------

(defn draw-gnome [ctx st]
  (let [{:keys [x y s state hop breath snore-t face]} (:gnome st)
        t (:t st)
        asleep? (= state :asleep)
        tucked? (= state :tucked)
        hat? (= state :hat)
        breathy (* 0.5 (+ 1.0 (js/Math.sin (* breath 0.9))))
        by (- y (* hop 3.0))
        slouch (+ (if tucked? 1.6 0.0) (if asleep? 0.6 0.0))
        hat-lift (if hat? 2.2 0.0)
        hat-tilt (if hat? 1.6 (* face 0.2))
        r (fn [dx dy dw dh c a]
            (pal/px ctx (+ x (* dx s)) (+ by (* (+ dy slouch) s)) (max 1 (* dw s)) (max 1 (* dh s)) c a))
        y0 (- -1.2 (* 0.5 breathy))]
    ;; the stone he sits on
    (r -6.0 0.0 12.0 3.0 pal/ground-dark-n 0.85)
    (r -6.0 0.0 12.0 1.0 pal/moss-n 0.55)
    (r 6.0 -1.0 2.0 1.0 pal/ground-dark-n 0.7)
    ;; boots
    (r -3.2 -2.0 2.6 2.0 pal/gnome-boot 1)
    (r 0.7 -2.0 2.6 2.0 pal/gnome-boot 1)
    ;; tunic
    (r -3.6 -8.0 7.4 6.0 pal/gnome-tunic 1)
    (r -3.6 -8.0 2.0 6.0 pal/gnome-tunic-dark 0.9)
    (r -3.6 -5.2 7.4 0.9 [140 120 90] 0.7)
    ;; beard and face
    (r -2.8 -10.6 5.8 3.2 pal/gnome-beard 1)
    (r -2.2 -12.4 4.6 2.4 pal/gnome-skin 1)
    (if (or asleep? tucked?)
      (do (r -1.7 -11.6 1.1 0.9 pal/gnome-tunic-dark 0.85)
          (r 0.7 -11.6 1.1 0.9 pal/gnome-tunic-dark 0.85))
      (do (r -1.8 -11.8 1.1 1.4 pal/gnome-tunic-dark 1)
          (r 0.7 -11.8 1.1 1.4 pal/gnome-tunic-dark 1)))
    ;; nose
    (r -0.6 -11.0 1.4 1.0 [214 158 132] 1)
    ;; arms
    (if hat?
      (do (r -4.6 -9.4 2.0 1.6 pal/gnome-tunic 1)
          (r -5.2 -12.4 3.2 1.4 pal/gnome-hat-dark (* 0.6 (+ 0.4 breathy))))
      (do (r -4.2 -7.6 1.6 3.6 pal/gnome-tunic-dark 0.95)
          (r 2.8 -7.6 1.6 3.6 pal/gnome-tunic-dark 0.95)))
    ;; hat: a small cone
    (let [tip (- 17.6 (* 0.4 breathy))
          base -11.8]
      (loop [dy base]
        (when (< dy tip)
          (let [t0 (/ (- dy base) (- tip base))
                half (+ 0.7 (* 2.8 t0))]
            (r (- (+ hat-tilt (- half))) (- dy) (* 2 half) 1.1 pal/gnome-hat 1))
          (recur (+ dy 1.1))))
      (r (- (+ hat-tilt -3.9)) (- base 0.6) 8.6 1.4 pal/gnome-hat-dark 0.95)
      (r (+ hat-tilt -3.9) (- base 0.6) 3.4 1.4 pal/gnome-hat (* 0.9 (+ 0.1 breathy))))
    ;; while he sleeps, small puffs drift up from him
    (when (or asleep? tucked?)
      (let [period (if tucked? 3.4 6.4)
            phase (/ (mod snore-t period) period)
            a (* 0.55 (Math/sin (* js/Math.pi phase)))]
        (when (> a 0.05)
          (pal/px ctx (+ x (* 6 s)) (- by (* 14 s) (* phase 4 s)) (max 1 (* 1.6 s)) (max 1 (* 1.4 s))
                  pal/gnome-beard (* a 0.8)))))))

;; ---- grass, spores, wings ------------------------------------------------

(defn draw-blade [ctx st b]
  (let [{:keys [x y h lean ph hue part part-x]} b
        t (:t st)
        d (da (:dawn st))
        sway (* (:wind st) (js/Math.sin (+ (* t 1.15) ph)) 2.2)
        base (pal/mix pal/moss-n pal/moss-d (pal/clamp (* hue (+ 0.35 (* 0.65 d))) 0 1))
        tip (pal/mix pal/moss-lit-n pal/moss-lit-d (+ (* 0.4 hue) (* 0.5 d)))
        push (* part (if (neg? part-x) -1 1) 4.0)]
    (loop [i 0]
      (when (< i h)
        (let [t0 (/ i h)
              ox (+ (* lean i 0.22) (* sway t0 t0) (* push t0 t0))]
          (pal/px ctx (+ x ox) (- y i) 1 1
                  (if (> t0 0.65) tip base)
                  (+ 0.55 (* 0.35 (- 1 t0))))
          (recur (inc i)))))))

(defn draw-grass-back [ctx st]
  (doseq [b (:blades st)]
    (when (<= (:y b) (:y (:gnome st))) (draw-blade ctx st b))))

(defn draw-grass-front [ctx st]
  (doseq [b (:blades st)]
    (when (> (:y b) (:y (:gnome st))) (draw-blade ctx st b))))

(defn draw-spores [ctx st]
  (let [prev (.-globalCompositeOperation ctx)]
    (set! (.-globalCompositeOperation ctx) "lighter")
    (doseq [s (:spores st)]
      (let [t (/ (:life s) (:max s))
            a (* 0.9 (pal/clamp (min (* (- 1 t) 3.0) (* t 1.6)) 0 1))]
        (pal/px ctx (:x s) (:y s) (:r s) (:r s) (:c s) a)
        (when (> (:r s) 1)
          (pal/px ctx (- (:x s) 1) (+ (:y s) 1) 1 1 (:c s) (* a 0.45)))))
    (set! (.-globalCompositeOperation ctx) prev)))

(defn draw-fireflies [ctx st]
  (let [prev (.-globalCompositeOperation ctx)]
    (set! (.-globalCompositeOperation ctx) "lighter")
    (doseq [f (:fireflies st)]
      (let [blink (* 0.5 (+ 1 (js/Math.sin (* (:ph f) 1.7))))
            a (* 0.75 blink)]
        (pal/halo ctx (:x f) (:y f) 3.4 pal/firefly (* a 0.55) 2)
        (pal/dot ctx (:x f) (:y f) pal/firefly a)))
    (set! (.-globalCompositeOperation ctx) prev)))

(defn draw-moth [ctx st]
  (let [{:keys [state x y wing]} (:moth st)]
    (when (not= state :away)
      (let [flap (+ 0.35 (* 0.65 (js/Math.abs (js/Math.sin wing))))
            prev (.-globalCompositeOperation ctx)]
        (set! (.-globalCompositeOperation ctx) "lighter")
        (pal/halo ctx x y 6.0 pal/moth 0.16 2)
        (set! (.-globalCompositeOperation ctx) prev)
        (pal/px ctx x (- y 1) 1 3 pal/moth-wing 0.95)
        (loop [i 0]
          (when (< i 4)
            (let [dy (* i flap 0.8)]
              (pal/px ctx (- x 4) (+ y dy -1) 3 1 pal/moth-wing 0.9)
              (pal/px ctx (+ x 1) (+ y dy -1) 3 1 pal/moth-wing 0.9))
            (recur (inc i))))))))

(defn draw-frame [ctx st]
  (let [{:keys [w h]} (:lay st)
        dip (:dip st)]
    ;; a breath of light when something is touched
    (when (> dip 0.02)
      (pal/px ctx 0 0 w h [255 244 228] (* 0.045 dip)))
    (pal/px ctx 0 0 w 1 pal/sky-top-n 0.12)
    (pal/px ctx 0 (- h 1) w 1 pal/ground-dark-n 0.18)))

(defn draw-scene [ctx st]
  (let [dip (* 1.6 (:dip st))]
    (.save ctx)
    (.translate ctx 0 dip)
    (draw-sky ctx st)
    (draw-stars ctx st)
    (draw-moon ctx st)
    (draw-treeline ctx st)
    (draw-ground ctx st)
    (draw-mist ctx st)
    (draw-ring-shadow ctx st)
    (draw-glows ctx st)
    (draw-grass-back ctx st)
    (draw-mushrooms ctx st)
    (draw-gnome ctx st)
    (draw-grass-front ctx st)
    (draw-spores ctx st)
    (draw-fireflies ctx st)
    (draw-moth ctx st)
    (.restore ctx)
    (draw-frame ctx st)))
