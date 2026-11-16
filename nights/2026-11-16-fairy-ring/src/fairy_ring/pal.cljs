(ns fairy-ring.pal
  "Colours, maths and tiny drawing helpers. Everything here works in the
  canvas' little pixel grid: one unit is one fat pixel.")

;; ---- maths ---------------------------------------------------------------

(defn clamp [v lo hi] (max lo (min hi v)))
(defn lerp [a b t] (+ a (* (- b a) t)))
(defn smooth [t] (let [t (clamp t 0 1)] (* t t (- 3 (* 2 t)))))
(defn mix [a b t] [(lerp (nth a 0) (nth b 0) t)
                   (lerp (nth a 1) (nth b 1) t)
                   (lerp (nth a 2) (nth b 2) t)])
(defn mix3 [ca cb cc t]
  (if (< t 0.5)
    (mix ca cb (* t 2))
    (mix cb cc (* (- t 0.5) 2))))
(defn rnd [] (js/Math.random))
(defn rnd* [a b] (+ a (* (rnd) (- b a))))
(defn chance [p] (< (rnd) p))

;; ---- colours -------------------------------------------------------------
;; Every channel is rounded and clamped before it becomes a string (a canvas
;; keeps the last fillStyle when the new one is invalid, and says nothing).

(defn rgba
  ([c] (rgba c 1))
  ([c a]
   (str "rgba(" (int (clamp (Math/round (nth c 0)) 0 255)) ","
        (int (clamp (Math/round (nth c 1)) 0 255)) ","
        (int (clamp (Math/round (nth c 2)) 0 255)) ","
        (clamp a 0 1) ")")))

(defn fur [c] (let [c (mapv (fn [v] (* v 0.92)) c)] c))

;; sky stops, night -> dawn
(def sky-top-n [8 12 26])      (def sky-top-d [92 138 196])
(def sky-mid-n [26 38 64])     (def sky-mid-d [226 152 132])
(def sky-low-n [58 74 106])    (def sky-low-d [252 208 148])

(def sky-top [sky-top-n sky-top-d])
(def star [214 228 255])
(def moon [238 240 226])
(def moon-shade [196 202 194])

(def tree-n [12 18 28])        (def tree-d [62 66 74])
(def tree-rim-n [40 52 76])    (def tree-rim-d [250 198 142])

(def ground-n [24 36 40])      (def ground-d [70 92 58])
(def ground-dark-n [16 26 32]) (def ground-dark-d [46 62 42])
(def moss-n [34 56 54])        (def moss-d [104 126 76])
(def moss-lit-n [52 82 74])    (def moss-lit-d [142 160 96])

(def cap-a [188 100 108])   ; rose
(def cap-b [152 110 168])   ; lilac
(def cap-c [206 150 96])    ; amber
(def cap-d [110 146 190])   ; dusk blue
(def cap-e [176 88 74])     ; russet
(def caps [cap-a cap-b cap-c cap-d cap-e])
(def cap-spot [238 228 208])
(def stalk [226 214 194])
(def stalk-dim [186 176 164])
(def gill-warm [255 202 138])
(def gill-cool [168 236 220])
(def spore [255 238 206])
(def spore-cool [198 238 232])
(def glow-warm [255 190 120])
(def glow-cool [130 232 200])

(def gnome-hat [178 62 60])
(def gnome-hat-dark [136 44 46])
(def gnome-tunic [92 104 132])
(def gnome-tunic-dark [68 78 104])
(def gnome-skin [226 182 152])
(def gnome-beard [236 230 218])
(def gnome-boot [78 62 54])
(def moth [248 246 234])
(def moth-wing [214 226 224])
(def firefly [252 236 170])
(def dew [200 244 236])

;; ---- pixel helpers -------------------------------------------------------

(defn px [ctx x y w h c a]
  (set! (.-fillStyle ctx) (rgba c a))
  (.fillRect ctx (Math/floor x) (Math/floor y) (max 1 w) (max 1 h)))

(defn dot [ctx x y c a] (px ctx x y 1 1 c a))

(defn disc
  "A filled pixel disc: rows of spans, so it stays chunky."
  [ctx cx cy r c a]
  (let [r (max 0.6 r)]
    (loop [dy (- (Math/floor r))]
      (when (<= dy (Math/floor r))
        (let [dx (Math/sqrt (max 0 (- (* r r) (* dy dy))))]
          (px ctx (- cx dx) (+ cy dy) (+ 1 (* 2 dx)) 1 c a))
        (recur (inc dy))))))

(defn halo
  "A soft glow: a few nested discs with 'lighter' blending."
  ([ctx cx cy r c a] (halo ctx cx cy r c a 3))
  ([ctx cx cy r c a steps]
   (let [prev (.-globalCompositeOperation ctx)]
     (set! (.-globalCompositeOperation ctx) "lighter")
     (dotimes [i steps]
       (let [t (/ i steps)
             rr (* r (+ 0.35 (* 0.65 (- 1 t))))]
         (disc ctx cx cy rr c (* a 0.30 (- 1 (* t 0.6))))))
     (set! (.-globalCompositeOperation ctx) prev))))

(defn span-band
  "One dithered sky band. `dither` is a 0/1 phase so neighbouring bands
  interleave instead of banding harshly."
  [ctx y w h c a phase]
  (px ctx 0 y w h c a)
  (when (> h 1)
    (let [step 4]
      (loop [x (if phase 0 2)]
        (when (< x w)
          (px ctx x (+ y (dec h)) 2 1 c a)
          (recur (+ x step)))))))
