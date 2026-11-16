(ns fairy-ring.world
  "The clearing's state and its little rules: spores, mushrooms, grass, a
  gnome, and the dawn that creeps in on its own. Nothing here draws or makes
  a sound; it updates state and queues sound events in :sfx for the audio
  module to play."
  (:require [fairy-ring.pal :as pal]))

;; ---- layout --------------------------------------------------------------

(defn layout [w h]
  (let [horizon (* h 0.54)
        ground (- h horizon)
        rx (min (* w 0.28) (* h 0.20) 74)
        ry (* rx 0.56)]
    {:w w :h h :horizon horizon :ground ground
     :ring {:cx (* w 0.5) :cy (+ horizon (* ground 0.34)) :rx rx :ry ry}
     :scale (pal/clamp (/ rx 58) 0.7 1.6)}))

(defn- mk-blade [lay]
  (let [{:keys [w h horizon ground]} lay
        side (< (pal/rnd) 0.35)]
    {:x (if side (if (pal/chance 0.5) (pal/rnd* 0 (* 0.15 w)) (* w (pal/rnd* 0.85 1.0)))
            (pal/rnd* 0 w))
     :y (+ horizon (* ground (pal/rnd* 0.34 1.0)))
     :h (pal/rnd* 4 13)
     :lean (pal/rnd* -0.5 0.5)
     :ph (pal/rnd* 0 6.5)
     :hue (pal/rnd* 0 1)
     :part 0.0
     :part-x 0.0}))

(defn- mk-mushroom [i n lay]
  (let [{:keys [cx cy rx ry]} (:ring lay)
        ang (- (/ js/Math.PI 2) (/ (* 2 js/Math.PI i) n))
        x (+ cx (* rx (js/Math.cos ang)))
        y (+ cy (* ry (js/Math.sin ang)))
        depth (pal/clamp (+ 0.5 (* 0.5 (js/Math.sin ang))) 0 1)
        s (* (:scale lay) (+ 0.80 (* 0.32 depth)))
        elder? (= i 0)]
    {:i i :x x :y y :depth depth :elder? elder?
     :cap-r (* s (if elder? 8.8 6.1))
     :stalk-h (* s (if elder? 16 11))
     :cap (nth pal/caps (mod i (count pal/caps)))
     :glow-c (if (even? i) pal/gill-cool pal/gill-warm)
     :ph (pal/rnd* 0 6.5)
     :bloom 0.0
     :glow 0.12
     :tilt (pal/rnd* -0.10 0.10)
     :door 0.0}))

(defn- mk-firefly [lay]
  (let [{:keys [w h horizon]} lay]
    {:x (pal/rnd* 0 w)
     :y (pal/rnd* (* h 0.30) (+ horizon 6))
     :ph (pal/rnd* 0 6.5)
     :vx (pal/rnd* -3 3)
     :vy (pal/rnd* -1.6 1.6)}))

(defn- mk-mist [lay]
  (let [{:keys [w horizon]} lay]
    {:x (pal/rnd* 0 w)
     :y (+ horizon (pal/rnd* -6 9))
     :r (pal/rnd* 14 34)
     :vx (pal/rnd* 1.4 4.2)
     :a (pal/rnd* 0.05 0.11)}))

(defn- place-gnome [st]
  (let [{:keys [cx cy rx ry w]} (assoc (get-in st [:lay :ring]) :w (get-in st [:lay :w]))
        s (:scale (:lay st))
        margin (* 9 s)
        gx (pal/clamp (+ cx (* rx 1.40)) margin (- w margin))]
    (assoc st :gnome (assoc (:gnome st)
                            :x gx
                            :y (+ cy (* ry 0.90) (* 6 s))
                            :s s))))

(defn new-world [lay]
  (-> {:lay lay
       :t 0.0
       :dawn 0.04
       :wind 0.5
       :dip 0.0
       :last-touch 0.0
       :spores []
       :glows []
       :blades (vec (repeatedly 110 #(mk-blade lay)))
       :mushrooms (vec (map-indexed (fn [i _] (mk-mushroom i 7 lay)) (range 7)))
       :fireflies (vec (repeatedly 5 #(mk-firefly lay)))
       :mist (vec (repeatedly 7 #(mk-mist lay)))
       :gnome {:x 0 :y 0 :s 1 :state :asleep :timer 0.0 :breath 0.0 :hop 0.0
               :face 1 :snore-t 0.0 :pokes []}
       :moth {:state :away :x 0 :y 0 :vx 0 :vy 0 :wing 0.0 :land-t 0.0}
       :door 0.0
       :peal? false
       :sfx []
       :gesture nil
       :stroke {:on? false :pan 0.0}}
      (place-gnome)))

(defn resize! [st lay] (place-gnome (assoc st :lay lay)))

;; ---- spawning helpers ----------------------------------------------------

(defn spawn-spore
  ([st x y vx vy life r c]
   (if (>= (count (:spores st)) 700)
     st
     (update st :spores conj
             {:x (double x) :y (double y) :vx (double vx) :vy (double vy)
              :life (double life) :max (double life) :r r :c c
              :ph (pal/rnd* 0 6.5)}))))

(defn- spore-burst [st x y n spread speed c]
  (reduce (fn [st i]
            (let [a (+ (* 2 js/Math.PI (/ i n)) (pal/rnd* -0.25 0.25))
                  sp (pal/rnd* speed (* 1.6 speed))]
              (spawn-spore st x y
                           (* (js/Math.cos a) sp)
                           (* (js/Math.sin a) sp spread)
                           (pal/rnd* 3.2 6.2)
                           (if (pal/chance 0.25) 2 1)
                           (if (pal/chance 0.3) pal/spore-cool c))))
          st (range n)))

(defn- glow-at [st x y]
  (if (>= (count (:glows st)) 46)
    st
    (update st :glows conj {:x x :y y :life 42.0 :max 42.0 :r (pal/rnd* 2.2 3.8)})))

(defn- part-grass [st x y force]
  (update st :blades
          (fn [bs]
            (mapv (fn [b]
                    (if (and (< (js/Math.abs (- (:x b) x)) 16)
                             (< (js/Math.abs (- (:y b) y)) 22))
                      (assoc b :part (min 1.0 (+ (:part b) force))
                             :part-x (- (:x b) x))
                      b))
                  bs))))

(defn- hit-target [st x y]
  (let [s (:scale (:lay st))
        g (:gnome st)]
    (if (and (< (js/Math.abs (- x (:x g))) (* 12 s))
             (>= y (- (:y g) (* 14 s)))
             (<= y (+ (:y g) (* 5 s))))
      {:kind :gnome}
      (let [hit (->> (:mushrooms st)
                     (sort-by :depth >)
                     (filter (fn [m]
                               (let [cx (:x m)
                                     cy (- (:y m) (* 0.8 (:stalk-h m)))
                                     dx (/ (- x cx) (+ (:cap-r m) 4.0))
                                     dy (/ (- y cy) (+ (* 0.85 (:cap-r m)) 5.0))]
                                 (< (+ (* dx dx) (* dy dy)) 1.6))))
                     first)]
        (if hit {:kind :mushroom :i (:i hit)} {:kind :ground})))))

;; ---- gestures ------------------------------------------------------------

(declare nudge-moth)

(defn- sky? [st y] (< y (get-in st [:lay :horizon])))

(defn begin-gesture [st x y]
  (assoc st
         :last-touch (:t st)
         :gesture {:x0 x :y0 y :x x :y y :lx x :ly y :t0 (:t st) :dur 0.0
                   :moved 0.0
                   :kind (if (sky? st y) :sky :ground)
                   :target (hit-target st x y)
                   :whoosh false :painted false}))

(defn- gnome-poke! [st]
  (let [t (:t st)
        g (:gnome st)
        pokes (conj (vec g) t)
        recent (count (filter #(> (- t %) 24) (:pokes g)))
        many? (>= recent 2)]
    (-> st
        (assoc :gnome (assoc g
                             :pokes (conj (vec (:pokes g)) t)
                             :state (if many? :hat :stir)
                             :timer (if many? 3.6 1.6)
                             :hop 1.0))
        (update :sfx conj {:kind :tock})
        (cond-> many? (update :sfx conj {:kind :mutter})))))

(defn- open-door [st]
  (let [m (get-in st [:mushrooms 0])
        st (-> st
               (assoc :door (max 0.02 (:door st)))
               (assoc-in [:mushrooms 0 :door] (max 0.02 (:door m))))
        st (reduce (fn [st _]
                     (spawn-spore st
                                  (+ (:x m) (pal/rnd* -7 7))
                                  (- (:y m) (* 1.1 (:stalk-h m)))
                                  (pal/rnd* -12 12) (- (pal/rnd* 6 22))
                                  (pal/rnd* 4 9) (if (pal/chance 0.4) 2 1) pal/spore))
                   st (range 18))]
    (update st :sfx conj {:kind :door})))

(defn end-gesture [st]
  (let [g (:gesture st)]
    (if (nil? g)
      st
      (let [dur (- (:t st) (:t0 g))
            moved (:moved g)
            target (:target g)
            w (get-in st [:lay :w])
            h (get-in st [:lay :h])
            tap? (and (< dur 0.45) (< moved 7))
            st (assoc st :gesture nil :stroke {:on? false :pan 0.0})]
        (cond
          (= (:kind target) :gnome)
          (if (> dur 1.05)
            (-> st
                (assoc-in [:gnome :state] :tucked)
                (assoc-in [:gnome :timer] 26.0)
                (assoc-in [:gnome :snore-t] 0.0)
                (update :sfx conj {:kind :snooze}))
            (-> (gnome-poke! st) (assoc :last-touch (:t st))))

          (= (:kind target) :mushroom)
          (let [m (get-in st [:mushrooms (:i target)])]
            (if (and (:elder? m) (> dur 1.05) (> (:dawn st) 0.84))
              (open-door st)
              (-> st
                  (assoc :last-touch (:t st))
                  (update :sfx conj {:kind :shimmer
                                     :pan (- (* 2 (/ (:x m) w)) 1)}))))

          tap?
          (let [x (:x0 g) y (:y0 g) ground (not (sky? st y))
                moth (:moth st)
                near-moth? (and (#{:landed :fluttering} (:state moth))
                                (< (js/Math.hypot (- x (:x moth)) (- y (:y moth))) 12))]
            (if near-moth?
              (nudge-moth st x y)
              (-> st
                  (assoc :last-touch (:t st) :dip 1.0)
                  (spore-burst x y
                               (if ground 28 14)
                               (if ground 0.35 0.7)
                               (if ground 15 9)
                               (if ground pal/spore pal/spore-cool))
                  (glow-at x y)
                  (part-grass x y 0.5)
                  (update :sfx conj
                          (if ground
                            {:kind :pluck :pan (- (* 2 (/ x w)) 1)
                             :pitch (pal/clamp (/ y h) 0 1)}
                            {:kind :twinkle :pan (- (* 2 (/ x w)) 1)})))))

          :else st)))))

(defn gesture-move [st x y]
  (if-let [g (:gesture st)]
    (let [dx (- x (:lx g)) dy (- y (:ly g))
          dist (js/Math.hypot dx dy)
          st (-> st
                 (assoc-in [:gesture :x] x)
                 (assoc-in [:gesture :y] y)
                 (assoc-in [:gesture :lx] x)
                 (assoc-in [:gesture :ly] y)
                 (update-in [:gesture :moved] + dist))
          target (get-in st [:gesture :target])
          target (if (and (= (:kind target) :mushroom)
                          (> (get-in st [:gesture :moved]) 9))
                   {:kind :ground} target)
          st (assoc-in st [:gesture :target] target)
          w (get-in st [:lay :w])]
      (cond
        (= (:kind g) :sky)
        (let [lift (* (- dy) 0.0045)
              before (:dawn st)
              st (-> st
                     (update :dawn #(pal/clamp (+ % lift) 0 1))
                     (assoc :last-touch (:t st))
                     (assoc :last-dawn-lift (:t st)))]
          (cond
            (and (< dy -1.2) (not (get-in st [:gesture :whoosh])))
            (-> st (assoc-in [:gesture :whoosh] true)
                (update :sfx conj {:kind :whoosh}))
            (and (< before 0.84) (>= (:dawn st) 0.84))
            (update st :sfx conj {:kind :peal})
            :else st))

        (= (:kind target) :gnome) st

        :else
        (let [painting? (not (get-in st [:gesture :painted]))
              st (-> st
                     (assoc :last-touch (:t st))
                     (part-grass x y (* 0.14 (min 1.2 dist)))
                     (cond-> (< (pal/rnd) 0.20) (glow-at x y))
                     (cond-> painting?
                       (assoc :stroke {:on? true
                                       :pan (- (* 2 (/ x w)) 1)}))
                     (cond-> painting?
                       (assoc-in [:gesture :painted] true))
                     (cond-> painting? (update :sfx conj {:kind :brush-start})))]
          (if (and (:on? (:stroke st)) (< (pal/rnd) (min 1.0 (* dist 0.30))))
            (-> st
                (spawn-spore x y (pal/rnd* -6 6) (- (pal/rnd* 2 14)) (pal/rnd* 2.0 4.2) 1
                             (if (pal/chance 0.5) pal/spore pal/spore-cool))
                (assoc :stroke {:on? true :pan (:pan (:stroke st))})
                (update :sfx conj {:kind :brush :intensity (min 1.0 (* dist 0.12))}))
            st))))
    st))

;; ---- per-frame systems ---------------------------------------------------

(defn- step-spores [st dt]
  (let [w (get-in st [:lay :w])
        h (get-in st [:lay :h])
        wind (:wind st)]
    (update st :spores
            (fn [spores]
              (->> spores
                   (map (fn [s]
                          (let [dr (Math/pow 0.5 dt)
                                wob (* 3.0 (js/Math.sin (+ (:ph s) (* (- (:max s) (:life s)) 1.4))))]
                            (-> s
                                (update :life - dt)
                                (update :vx #(+ (* % dr) (* wob dt)))
                                (update :vy #(+ (* % dr) (* -1.6 dt)))
                                (update :x #(+ % (* (:vx s) dt) (* wind 1.2 dt)))
                                (update :y #(+ % (* (:vy s) dt)))))))
                   (filter (fn [s] (and (> (:life s) 0)
                                        (> (:x s) -12) (< (:x s) (+ w 12))
                                        (< (:y s) (+ h 6)))))
                   vec)))))

(defn- step-glows [st dt]
  (assoc st :glows (->> (:glows st)
                        (mapv #(update % :life - dt))
                        (filterv #(> (:life %) 0)))))

(defn- step-blades [st dt]
  (update st :blades
          (fn [bs] (mapv (fn [b]
                           (if (pos? (:part b))
                             (update b :part #(max 0.0 (- % (* dt 0.055))))
                             b))
                         bs))))

(defn- step-mushrooms [st dt]
  (let [g (:gnome st)
        quiet (if (#{:asleep :tucked} (:state g)) 1.0 0.4)
        held-t (get-in st [:gesture :target])
        held-i (when (= (:kind held-t) :mushroom) (:i held-t))
        dur (get-in st [:gesture :dur] 0.0)
        dawn (:dawn st)
        st (update st :mushrooms
                   (fn [ms]
                     (mapv (fn [m]
                             (let [is-held (= held-i (:i m))
                                   bloom (pal/clamp (+ (:bloom m) (* dt (if is-held 1.5 -0.26))) 0 1)
                                   door (if (and (:elder? m) is-held (> dur 1.05) (> dawn 0.84))
                                          (min 1.0 (+ (:door m) (* dt 0.9)))
                                          (:door m))]
                               (assoc m
                                      :bloom bloom
                                      :door door
                                      :glow (pal/clamp (+ (* 0.10 quiet)
                                                          (* 0.8 bloom quiet)
                                                          (* 0.45 door)
                                                          (* 0.10 dawn))
                                                       0 1.2))))
                           ms)))
        blooming (some #(> (:bloom %) 0.5) (:mushrooms st))
        m0 (get-in st [:mushrooms 0])]
    (-> st
        (cond-> (and (> (:door m0) 0.5) (< (pal/rnd) (* dt 9)))
          (spawn-spore (:x m0) (- (:y m0) (* 1.05 (:stalk-h m0)))
                       (pal/rnd* -7 7) (- (pal/rnd* 8 24)) (pal/rnd* 4 8) 1 pal/spore))
        (cond-> (and blooming (< (pal/rnd) (* dt 3.2)))
          (spawn-spore (+ (:x (rand-nth (:mushrooms st))) (pal/rnd* -6 6))
                       (- (:y (rand-nth (:mushrooms st))) (:stalk-h (rand-nth (:mushrooms st))))
                       (pal/rnd* -4 4) (- (pal/rnd* 3 9)) (pal/rnd* 3 6) 1 pal/spore)))))

(defn- step-gnome [st dt]
  (let [g (:gnome st)
        g (-> g
              (update :timer #(max 0.0 (- % dt)))
              (update :breath + (* dt 1.5))
              (update :hop #(max 0.0 (- % (* dt 2.2)))))
        st (assoc st :gnome g)
        st (cond
             (and (= (:state g) :stir) (zero? (:timer g)))
             (assoc st :gnome (assoc g :state :asleep :hop 0.0))
             (and (#{:hat :tucked} (:state g)) (zero? (:timer g)))
             (assoc st :gnome (assoc g :state :asleep))
             :else st)
        g (:gnome st)
        asleep? (#{:asleep :tucked} (:state g))]
    (if asleep?
      (let [period (if (= (:state g) :tucked) 3.4 6.4)
            nt (+ (:snore-t g) dt)]
        (if (> nt period)
          (-> st
              (assoc-in [:gnome :snore-t] 0.0)
              (update :sfx conj {:kind :snore :deep (= (:state g) :tucked)}))
          (assoc-in st [:gnome :snore-t] nt)))
      (assoc-in st [:gnome :snore-t] 0.0))))

(defn- step-moth [st dt]
  (let [m (:moth st)
        m0 (get-in st [:mushrooms 0])
        lx (:x m0)
        ly (- (:y m0) (* 1.7 (:stalk-h m0)))
        ready (>= (:dawn st) 0.9)]
    (case (:state m)
      :away
      (if (and ready (< (pal/rnd) (* dt 0.5)))
        (-> st
            (assoc :moth {:state :descending :x (+ lx (pal/rnd* -16 16)) :y -6
                          :vx (pal/rnd* -3 3) :vy 5 :wing 0.0 :land-t 0.0})
            (update :sfx conj {:kind :moth-away}))
        st)

      :descending
      (let [m (-> m
                  (update :wing + (* dt 6.0))
                  (update :x + (* (:vx m) dt))
                  (update :y + (* (:vy m) dt))
                  (assoc :vx (pal/lerp (:vx m) (* 7.0 (js/Math.sin (* (:y m) 0.14))) (* dt 1.2))))
            m (if (> (:y m) ly) (assoc m :y ly :state :landed :land-t 0.0) m)]
        (if (= (:state m) :landed)
          (-> st (assoc :moth m) (update :sfx conj {:kind :moth-land}))
          (assoc st :moth m)))

      ;; landed or fluttering
      (let [m (-> m
                  (update :wing + (* dt (if (= (:state m) :fluttering) 15.0 2.2)))
                  (update :land-t + dt)
                  (update :y #(pal/lerp % ly (* dt (if (= (:state m) :fluttering) 6.0 2.0)))))]
        (cond
          (> (:land-t m) 26.0) (assoc st :moth (assoc m :state :away))
          (and (= (:state m) :fluttering) (< (:land-t m) 1.6) (> (:y m) (- ly 26)))
          (assoc st :moth m)
          (and (= (:state m) :fluttering) (<= (:y m) (- ly 26)))
          (assoc st :moth (assoc m :state :descending :vy 5.0 :vx 0.0))
          :else (assoc st :moth m))))))

(defn nudge-moth [st x y]
  (let [m (:moth st)]
    (if (and (#{:landed :fluttering} (:state m))
             (< (js/Math.hypot (- x (:x m)) (- y (:y m))) 10))
      (-> st
          (assoc :moth (assoc m :state :fluttering :land-t 0.0
                              :vx (pal/rnd* -14 14) :vy -14))
          (update :sfx conj {:kind :twinkle :pan (- (* 2 (/ x (get-in st [:lay :w]))) 1)})
          (assoc :last-touch (:t st)))
      st)))

(defn- step-ambient [st dt]
  (let [{:keys [w h horizon]} (:lay st)
        wind (:wind st)]
    (-> st
        (update :fireflies
                (fn [fs]
                  (mapv (fn [f]
                          (let [f (-> f
                                      (update :ph + (* dt 0.8))
                                      (update :x #(+ % (* (:vx f) dt) (* wind 1.6 dt)))
                                      (update :y #(+ % (* (:vy f) dt)))
                                      (update :vx #(pal/clamp (+ % (pal/rnd* -0.6 0.6)) -4 4))
                                      (update :vy #(pal/clamp (+ % (pal/rnd* -0.4 0.4)) -2.2 2.2)))]
                            (cond
                              (< (:x f) -6) (assoc f :x (+ w 5))
                              (> (:x f) (+ w 6)) (assoc f :x -5)
                              (< (:y f) (* h 0.18)) (assoc f :vy (js/Math.abs (:vy f)))
                              (> (:y f) (+ horizon 4)) (assoc f :vy (- (js/Math.abs (:vy f))))
                              :else f)))
                        fs)))
        (update :mist
                (fn [ms]
                  (mapv (fn [m]
                          (let [m (update m :x #(+ % (* (:vx m) dt (* 0.4 wind))))]
                            (cond-> m
                              (> (:x m) (+ w 40))
                              (assoc :x -40 :y (+ horizon (pal/rnd* -6 9))))))
                        ms)))
        (assoc :wind (+ 0.42
                        (* 0.34 (js/Math.sin (* (:t st) 0.055)))
                        (* 0.24 (js/Math.sin (+ 1.7 (* (:t st) 0.017)))))))))

(defn- step-dawn [st dt]
  (let [idle (- (:t st) (:last-touch st))
        rate (if (> idle 14.0) (/ 1.0 210.0) (/ 1.0 1500.0))
        dawn (pal/clamp (+ (:dawn st) (* dt rate)) 0 1)
        peal? (and (not (:peal? st)) (>= dawn 0.84))]
    (-> st
        (assoc :dawn dawn)
        (assoc :peal? (or (:peal? st) peal?))
        (cond-> peal? (update :sfx conj {:kind :peal})))))

(defn update-world [st dt]
  (let [dt (min dt 0.05)
        st (assoc st :t (+ (:t st) dt))
        st (-> st
               (update :dip #(max 0.0 (- % (* dt 3.4))))
               (update :gesture #(when % (update % :dur + dt)))
               (cond-> (< (pal/rnd) (* dt 0.12))
                 (spawn-spore (pal/rnd* 0 (get-in st [:lay :w]))
                              (+ (get-in st [:lay :horizon]) (pal/rnd* 20 60))
                              (pal/rnd* -3 3) (- (pal/rnd* 2 6)) (pal/rnd* 5 9) 1
                              (if (pal/chance 0.4) pal/spore-cool pal/spore))))]
    (-> st
        (step-dawn dt)
        (step-mushrooms dt)
        (step-gnome dt)
        (step-moth dt)
        (step-spores dt)
        (step-glows dt)
        (step-blades dt)
        (step-ambient dt))))

(defn drain-sfx [st]
  (let [s (:sfx st)] [s (assoc st :sfx [])]))
