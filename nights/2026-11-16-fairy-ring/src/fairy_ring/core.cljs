(ns fairy-ring.core
  "Boot, input and the frame loop. The canvas is a small pixel grid stretched
  to the viewport by the CSS, so the whole clearing is always one screen with
  no scrolling, on a phone held one-handed or on a desktop."
  (:require [fairy-ring.world :as w]
            [fairy-ring.draw :as d]
            [fairy-ring.audio :as a]
            [fairy-ring.pal :as pal]))

(defonce S (atom nil))

(def ^:private scale-var "fairy-ring-sound")

(defn- read-pref []
  (try (= "on" (.getItem js/localStorage scale-var)) (catch :default _ false)))

(defn- save-pref! [on?]
  (try (.setItem js/localStorage scale-var (if on? "on" "off")) (catch :default _ nil)))

;; ---- canvas --------------------------------------------------------------

(defn- build-view []
  (let [cv (.getElementById js/document "scene")
        [cw ch] [(.-innerWidth js/window) (.-innerHeight js/window)]
        s (if (< (min cw ch) 560) 2 3)
        vw (max 96 (Math/round (/ cw s)))
        vh (max 96 (Math/round (/ ch s)))]
    (set! (.-width cv) vw)
    (set! (.-height cv) vh)
    {:cv cv :ctx (.getContext cv "2d") :vw vw :vh vh :cw cw :ch ch :s s}))

(defn- coords [view e]
  (let [r (.getBoundingClientRect (:cv view))
        x (* (- (.-clientX e) (.-left r)) (/ (:vw view) (max 1 (.-width r))))
        y (* (- (.-clientY e) (.-top r)) (/ (:vh view) (max 1 (.-height r))))]
    [(pal/clamp x 0 (:vw view)) (pal/clamp y 0 (:vh view))]))

;; ---- sound button --------------------------------------------------------

(defn- paint-button! [on?]
  (let [b (.getElementById js/document "sound")
        label (if on? "Sound on" "Sound off")
        glyph (if on? "\uD83D\uDD0A" "\uD83D\uDD07")]
    (set! (.-innerHTML b) (str "<span aria-hidden=\"true\">" glyph "</span><span>" (if on? "Sound" "Muted") "</span>"))
    (.setAttribute b "aria-pressed" (if on? "true" "false"))
    (.setAttribute b "aria-label" label)))

(declare unmute!)

(defn- toggle-sound! []
  (let [on? (:sound? @S)]
    (a/init!)
    (a/set-muted! on?)
    (save-pref! (not on?))
    (swap! S assoc :sound? (not on?) :auto-arm false)
    (paint-button! (not on?))))

(defn- unmute! []
  (when-not (:sound? @S)
    (a/init!)
    (a/set-muted! false)
    (swap! S assoc :sound? true :auto-arm false)
    (paint-button! true)))

;; ---- input ---------------------------------------------------------------

(defn- on-down [e]
  (when (:auto-arm @S) (unmute!))
  (.preventDefault e)
  (let [view (:view @S)
        cv (:cv view)]
    (try (.setPointerCapture cv (.-pointerId e)) (catch :default _ nil)))
  (let [[x y] (coords (:view @S) e)]
    (swap! S update :world w/begin-gesture x y)))

(defn- on-move [e]
  (when (:gesture (:world @S))
    (let [[x y] (coords (:view @S) e)]
      (swap! S update :world w/gesture-move x y))))

(defn- on-up [e]
  (when (:gesture (:world @S))
    (swap! S update :world w/end-gesture)))

;; ---- frame loop ----------------------------------------------------------

(defn- frame [ts]
  (let [st @S
        prev (:ts st)
        dt (if prev (pal/clamp (/ (- ts prev) 1000) 0.0 0.05) 0.016)
        world (:world st)]
    (swap! S assoc :ts ts)
    (swap! S update :world w/update-world dt)
    (let [[events world'] (w/drain-sfx (:world @S))]
      (swap! S assoc :world world')
      (doseq [e events] (a/sfx! e)))
    (let [world (:world @S)
          g (:gesture world)
          tgt (:target g)
          holding? (and g (= (:kind tgt) :mushroom))
          m (when holding? (get-in world [:mushrooms (:i tgt)]))]
      (when holding?
        (a/hold! true (* 2.2 (:cap-r m)) (- (* 2 (/ (:x m) (get-in world [:lay :w]))) 1)))
      (when (and (:hold-tone st) (not holding?))
        (a/hold! false 0 0))
      (swap! S assoc :hold-tone holding?)
      (if (:on? (:stroke world))
        (a/brush! true 0.45 (:pan (:stroke world)))
        (a/brush! false 0 0))
      ;; the ambient bed follows the dawn, checked a few times a second
      (when (or (nil? (:dawn-sent st)) (> (- (:t world) (:dawn-sent st)) 0.5))
        (a/set-dawn! (:dawn world))
        (swap! S assoc :dawn-sent (:t world)))
      (d/draw-scene (:ctx (:view @S)) world))
    (js/requestAnimationFrame frame)))

(defn- start! []
  (when-not (:view @S)
    (let [view (build-view)
          lay (w/layout (:vw view) (:vh view))]
      (reset! S {:view view
                 :world (w/new-world lay)
                 :ts nil
                 :sound? false
                 :auto-arm (read-pref)
                 :hold-tone false})
      (paint-button! false)
      (.addEventListener (:cv view) "pointerdown" on-down (js-obj "passive" false))
      (.addEventListener (:cv view) "pointermove" on-move (js-obj "passive" false))
      (.addEventListener (:cv view) "pointerup" on-up (js-obj "passive" false))
      (.addEventListener (:cv view) "pointercancel" on-up (js-obj "passive" false))
      (.addEventListener (:cv view) "contextmenu" (fn [e] (.preventDefault e)))
      (.addEventListener js/window "gesturestart" (fn [e] (.preventDefault e)))
      (.addEventListener js/window "resize"
                         (fn [_]
                           (let [view (build-view)]
                             (swap! S assoc :view view)
                             (swap! S update :world w/resize! (w/layout (:vw view) (:vh view))))))
      (.addEventListener js/document "visibilitychange"
                         (fn [_] (when (and (not (.-hidden js/document)) (:sound? @S)) (a/resume!))))
      (.addEventListener (.getElementById js/document "sound") "click" (fn [e] (.preventDefault e) (toggle-sound!)))
      (js/requestAnimationFrame frame))))

(start!)
