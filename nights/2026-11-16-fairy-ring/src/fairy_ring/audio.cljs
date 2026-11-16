(ns fairy-ring.audio
  "Every sound is synthesised here: no samples. A quiet ambient bed (wind, a
  pad, crickets, and birds once the dawn comes) plus one voice per
  interaction. The master bus ends in a limiter-ish compressor so a fistful
  of overlapping sounds still never clips."
  (:require [fairy-ring.pal :as pal]))

(defonce ^:private S (atom nil))

(def ^:private master-level 0.6)

(defn running? [] (some? (:ctx @S)))

(defn- now [] (let [c (:ctx @S)] (if c (.-currentTime c) 0)))

(defn- connect->
  "Chain nodes: (connect-> a b c) wires a->b->c."
  [& nodes]
  (doseq [[a b] (partition 2 1 nodes)]
    (.connect a b))
  (last nodes))

(defn- noise-buffer [ctx dur]
  (let [len (int (* (.-sampleRate ctx) dur))
        buf (.createBuffer ctx 1 len (.-sampleRate ctx))
        data (.getChannelData buf 0)]
    (dotimes [i len]
      (aset data i (- (* 2 (js/Math.random)) 1)))
    buf))

(defn- noise-src [ctx dur]
  (let [s (.createBufferSource ctx)]
    (set! (.-buffer s) (noise-buffer ctx dur))
    (set! (.-loop s) true)
    s))

(defn- panner [ctx pan]
  (let [p (.createStereoPanner ctx)]
    (set! (.-pan p) (pal/clamp pan -1 1))
    p))

(defn- env!
  "Attack then an exponential tail, on a gain node."
  [ctx g t0 peak attack dur]
  (let [p (.-gain g)]
    (.setValueAtTime p 0.0001 t0)
    (.linearRampToValueAtTime p peak (+ t0 attack))
    (.exponentialRampToValueAtTime p 0.0001 (+ t0 attack dur))))

(defn- tone!
  "One oscillator voice. {:freq :type :dur :peak :attack :pan :glide :dest}"
  [ctx opts]
  (let [t0 (+ (now) (:delay opts 0.0))
        o (.createOscillator ctx)
        g (.createGain ctx)
        p (panner ctx (:pan opts 0))
        dest (or (:dest opts) (:sfx-bus @S))]
    (set! (.-type o) (name (:type opts :sine)))
    (set! (.-frequency o) (:freq opts 440))
    (when-let [gl (:glide opts)]
      (.exponentialRampToValueAtTime (.-frequency o) (max 20 gl) (+ t0 (:dur opts 0.5))))
    (env! ctx g t0 (:peak opts 0.2) (:attack opts 0.01) (:dur opts 0.5))
    (connect-> o g p dest)
    (.start o t0)
    (.stop o (+ t0 (:attack opts 0.01) (:dur opts 0.5) 0.05))
    o))

(defn- pluck!
  "A soft mallet: a triangle body plus a whisper of filtered noise."
  [ctx {:keys [freq peak pan dur delay]}]
  (let [t0 (+ (now) (or delay 0.0))
        o (.createOscillator ctx)
        g (.createGain ctx)
        f (.createBiquadFilter ctx)
        p (panner ctx (or pan 0))
        peak (or peak 0.22)
        dur (or dur 0.8)
        n (noise-src ctx 1.0)
        ng (.createGain ctx)
        nf (.createBiquadFilter ctx)]
    (set! (.-type o) "triangle")
    (set! (.-frequency o) freq)
    (env! ctx g t0 peak 0.006 dur)
    (set! (.-type f) "lowpass")
    (set! (.-frequency f) (* freq 3.2))
    (set! (.-Q f) 0.7)
    (connect-> o g f p (:sfx-bus @S))
    (.start o t0)
    (.stop o (+ t0 dur 0.12))
    (set! (.-type nf) "bandpass")
    (set! (.-frequency nf) 2400)
    (set! (.-Q nf) 0.8)
    (env! ctx ng t0 (* peak 0.30) 0.004 0.18)
    (connect-> n ng nf p)
    (.start n t0)
    (.stop n (+ t0 0.3))))

;; ---- scale: A pentatonic minor ------------------------------------------

(def ^:private scale [220.0 261.63 293.66 329.63 392.0 440.0 523.25 587.33])

(defn- scale-freq [x] (nth scale (int (pal/clamp (Math/floor (* x (count scale))) 0 (dec (count scale))))))

;; ---- the ambient bed -----------------------------------------------------

(defn- start-bed! [ctx]
  ;; wind: looped noise through a lowpass that breathes
  (let [wind-src (noise-src ctx 2.4)
        wind-lp (.createBiquadFilter ctx)
        wind-g (.createGain ctx)
        lfo (.createOscillator ctx)
        lfo-g (.createGain ctx)
        pad-lp (.createBiquadFilter ctx)
        pad-g (.createGain ctx)
        pad (mapv (fn [f]
                    (let [o (.createOscillator ctx)
                          og (.createGain ctx)
                          d (.createOscillator ctx)
                          dg (.createGain ctx)]
                      (set! (.-type d) "sine")
                      (set! (.-frequency d) 0.07)
                      (set! (.-gain dg) 0.6)
                      (.connect d dg)
                      (.connect dg (.-detune o))
                      (set! (.-type o) "sine")
                      (set! (.-frequency o) f)
                      (.connect o og)
                      (.connect og pad-lp)
                      (.start o)
                      (.start d)
                      {:osc o :gain og :detune d :detune-gain dg}))
                  [110.0 164.81 261.63])
        cr (.createBiquadFilter ctx)
        cols (atom 0)]
    (set! (.-type wind-lp) "lowpass")
    (set! (.-frequency wind-lp) 420)
    (set! (.-Q wind-lp) 0.6)
    (set! (.-gain wind-g) 0.0001)
    (set! (.-type lfo) "sine")
    (set! (.-frequency lfo) 0.05)
    (set! (.-gain lfo-g) 190)
    (.connect lfo lfo-g)
    (.connect lfo-g (.-frequency wind-lp))
    (.start lfo)
    (connect-> wind-src wind-lp wind-g (:amb-bus @S))
    (.start wind-src)
    (set! (.-type pad-lp) "lowpass")
    (set! (.-frequency pad-lp) 430)
    (set! (.-Q pad-lp) 0.9)
    (connect-> pad-lp pad-g (:amb-bus @S))
    (doseq [p pad] (set! (.-gain (:gain p)) 0.0001))
    ;; crickets: a sparse, bright ticking from the grass
    (set! (.-type cr) "bandpass")
    (set! (.-frequency cr) 3600)
    (set! (.-Q cr) 3)
    (.connect cr (:amb-bus @S))
    (swap! S assoc :wind {:src wind-src :lp wind-lp :gain wind-g :lfo lfo :lfo-g lfo-g}
           :pad {:voices pad :lp pad-lp :gain pad-g :chord 0}
           :crickets {:filter cr})
    (js/setInterval
     (fn []
       (let [c (:ctx @S)]
         (when (and c (= "running" (.-state c)) (:on? @S))
           (let [d (or (:dawn @S) 0.0)]
             ;; crickets fade as the light comes
             (when (< (js/Math.random) (- 0.75 (* 0.75 d)))
               (let [t0 (now)]
                 (tone! c {:freq (+ 3100 (* 500 (js/Math.random))) :type :square
                           :dur 0.05 :peak 0.035 :attack 0.004
                           :pan (- (* 2 (js/Math.random)) 1)})))
             ;; birds arrive with the dawn
             (when (and (> d 0.35) (< (js/Math.random) (* 0.5 d)))
               (let [base (+ 1700 (* 900 (js/Math.random)))
                     n (+ 2 (int (* 2 (js/Math.random))))]
                 (dotimes [i n]
                   (tone! c {:freq base :type :sine :dur 0.09 :peak 0.05
                             :attack 0.012 :delay (* i 0.13)
                             :glide (* base 0.55) :pan (- (* 2 (js/Math.random)) 1)})))))
             ;; the pad finds a new chord now and then
             (let [slot (long (Math/floor (/ (now) 26.0)))]
               (when (not= @cols slot)
                 (reset! cols slot)
                 (let [chords [[110.0 164.81 261.63] [98.0 146.83 246.94]
                               [123.47 146.83 293.66] [110.0 174.61 261.63]]
                       ch (nth chords (mod (int (js/Math.random)) (count chords)))]
                   (doseq [[v f] (map vector (:voices (:pad @S)) ch)]
                     (.setTargetAtTime (.-frequency (:osc v)) f (now) 3.5))))))))
     430)))

(defn- bed-levels! []
  (let [ctx (:ctx @S)]
    (when (and ctx (:on? @S))
      (let [d (or (:dawn @S) 0)
            t0 (now)]
        (.setTargetAtTime (.-gain (:gain (:wind @S))) (+ 0.05 (* 0.05 d)) t0 0.6)
        (.setTargetAtTime (.-frequency (:lp (:wind @S))) (+ 380 (* 460 d)) t0 0.8)
        (doseq [v (:voices (:pad @S))]
          (.setTargetAtTime (.-gain (:gain v)) (+ 0.030 (* 0.030 d)) t0 0.9))
        (.setTargetAtTime (.-frequency (:lp (:pad @S))) (+ 420 (* 520 d)) t0 0.9)))))

(defn init!
  "Built on the first unmute tap, so the browser is happy."
  []
  (when-not (:ctx @S)
    (let [w js/window
          C (or (.-AudioContext w) (.-webkitAudioContext w))
          ctx (new C)
          comp (.createDynamicsCompressor ctx)
          master (.createGain ctx)
          amb (.createGain ctx)
          sfx (.createGain ctx)]
      (set! (.-threshold comp) -14)
      (set! (.-knee comp) 24)
      (set! (.-ratio comp) 3.5)
      (set! (.-attack comp) 0.006)
      (set! (.-release comp) 0.28)
      (set! (.-gain master) master-level)
      (set! (.-gain amb) 0.0001)
      (set! (.-gain sfx) 1.0)
      (connect-> master comp (.-destination ctx))
      (.connect sfx master)
      (.connect amb master)
      (reset! S {:ctx ctx :master master :amb-bus amb :sfx-bus sfx :on? false
                 :dawn 0.0 :brush nil})
      (start-bed! ctx))))

(defn resume! []
  (when-let [ctx (:ctx @S)]
    (when (= "suspended" (.-state ctx)) (.resume ctx))))

(defn set-dawn! [d]
  (when (:ctx @S)
    (swap! S assoc :dawn (pal/clamp d 0 1))
    (bed-levels!)))

(defn- ensure-brush! [ctx]
  (when-not (:brush @S)
    (let [n (noise-src ctx 1.2)
          f (.createBiquadFilter ctx)
          g (.createGain ctx)
          p (panner ctx 0)]
      (set! (.-type f) "bandpass")
      (set! (.-frequency f) 1100)
      (set! (.-Q f) 0.9)
      (set! (.-gain g) 0.0001)
      (connect-> n f g p (:sfx-bus @S))
      (.start n)
      (swap! S assoc :brush {:src n :filter f :gain g :panner p}))))

(defn brush! [on? intensity pan]
  (let [ctx (:ctx @S)]
    (when (and ctx (:on? @S))
      (ensure-brush! ctx)
      (let [{:keys [gain filter panner]} (:brush @S)
            t0 (now)]
        (.setValueAtTime (.-pan panner) (pal/clamp (or pan 0) -1 1) t0)
        (if on?
          (do (.setTargetAtTime (.-gain gain) (* 0.10 (pal/clamp (or intensity 0.5) 0 1)) t0 0.05)
              (.setTargetAtTime (.-frequency filter) (+ 900 (* 900 (pal/clamp (or intensity 0.5) 0 1))) t0 0.12))
          (.setTargetAtTime (.-gain gain) 0.0001 t0 0.12))))))

(defn stop-brush! [] (brush! false 0 0))

(defn set-muted!
  "false = audible. The bed answers within a fraction of a second, and a
  small two-note chime says hello so nobody wonders whether it worked."
  [muted?]
  (let [ctx (:ctx @S)]
    (when ctx
      (swap! S assoc :on? (not muted?))
      (.resume ctx)
      (if muted?
        (do (.setTargetAtTime (.-gain (:amb-bus @S)) 0.0001 (now) 0.25)
            (stop-brush!))
        (do (.setTargetAtTime (.-gain (:amb-bus @S)) 1.0 (now) 0.35)
            (bed-levels!)
            (pluck! ctx {:freq 659.25 :peak 0.16 :dur 0.7})
            (pluck! ctx {:freq 987.77 :peak 0.12 :dur 0.9 :delay 0.13}))))))

;; ---- the brush (dragging across the moss) --------------------------------

;; ---- a warm sustained tone while a mushroom is held ----------------------

(defn hold! [on? freq pan]
  (let [ctx (:ctx @S)]
    (when (and ctx (:on? @S))
      (if on?
        (when-not (:hold @S)
          (let [o (.createOscillator ctx)
                o2 (.createOscillator ctx)
                g (.createGain ctx)
                f (.createBiquadFilter ctx)
                p (panner ctx (or pan 0))
                t0 (now)]
            (set! (.-type o) "triangle")
            (set! (.-frequency o) freq)
            (set! (.-type o2) "sine")
            (set! (.-frequency o2) (* freq 2.005))
            (set! (.-gain g) 0.0001)
            (set! (.-type f) "lowpass")
            (set! (.-frequency f) (* freq 4))
            (connect-> o g f p (:sfx-bus @S))
            (connect-> o2 g)
            (.start o)
            (.start o2)
            (.setValueAtTime (.-frequency o) freq t0)
            (.exponentialRampToValueAtTime (.-frequency o) (* freq 1.5) (+ t0 1.8))
            (.setTargetAtTime (.-gain g) 0.075 t0 0.35)
            (swap! S assoc :hold {:osc o :osc2 o2 :gain g :panner p :filter f :freq freq})))
        (when-let [h (:hold @S)]
          (let [t0 (now)]
            (.setTargetAtTime (.-gain (:gain h)) 0.0001 t0 0.35)
            (.stop (:osc h) (+ t0 1.2))
            (.stop (:osc2 h) (+ t0 1.2))
            (swap! S assoc :hold nil)))))))

;; ---- one-shot voices -----------------------------------------------------

(defn- whoosh! [ctx pan]
  (let [t0 (now)
        n (noise-src ctx 0.9)
        f (.createBiquadFilter ctx)
        g (.createGain ctx)
        p (panner ctx (or pan 0))]
    (set! (.-type f) "bandpass")
    (set! (.-Q f) 1.1)
    (.setValueAtTime (.-frequency f) 500 t0)
    (.exponentialRampToValueAtTime (.-frequency f) 2100 (+ t0 0.30))
    (.exponentialRampToValueAtTime (.-frequency f) 620 (+ t0 0.85))
    (env! ctx g t0 0.13 0.10 0.85)
    (connect-> n f g p (:sfx-bus @S))
    (.start n t0)
    (.stop n (+ t0 1.0))))

(defn- peal! [ctx]
  ;; the dawn breaking: a slow warm chord, four soft bells in a row
  (let [freqs [220.0 329.63 440.0 554.37]]
    (doseq [[i f] (map-indexed vector freqs)]
      (pluck! ctx {:freq f :peak 0.14 :dur 2.4 :delay (* i 0.16)})
      (tone! ctx {:freq (* f 2) :type :sine :dur 2.0 :peak 0.03
                  :attack 0.3 :delay (* i 0.16)}))))

(defn- door! [ctx]
  ;; the little door in the elder stalk opening: a four-note warm arpeggio
  (doseq [[i f] (map-indexed vector [329.63 440.0 523.25 659.25])]
    (pluck! ctx {:freq f :peak 0.13 :dur 1.5 :delay (* i 0.26)}))
  (tone! ctx {:freq 110.0 :type :sine :dur 2.6 :peak 0.05 :attack 0.5})
  (pluck! ctx {:freq 880.0 :peak 0.07 :dur 2.0 :delay 1.2}))

(defn- tock! [ctx pan]
  (let [t0 (now)
        n (noise-src ctx 0.2)
        f (.createBiquadFilter ctx)
        g (.createGain ctx)
        p (panner ctx (or pan 0))
        o (.createOscillator ctx)
        og (.createGain ctx)]
    (set! (.-type f) "lowpass")
    (set! (.-frequency f) 420)
    (env! ctx g t0 0.16 0.003 0.10)
    (connect-> n f g p (:sfx-bus @S))
    (.start n t0)
    (.stop n (+ t0 0.2))
    (set! (.-type o) "sine")
    (.setValueAtTime (.-frequency o) 190 t0)
    (.exponentialRampToValueAtTime (.-frequency o) 120 (+ t0 0.14))
    (env! ctx og t0 0.20 0.004 0.16)
    (connect-> o og p)
    (.start o t0)
    (.stop o (+ t0 0.3))))

(defn- mutter! [ctx pan]
  (tone! ctx {:freq 262.0 :type :triangle :dur 0.16 :peak 0.10 :attack 0.02 :pan pan})
  (tone! ctx {:freq 233.0 :type :triangle :dur 0.20 :peak 0.08 :attack 0.02 :pan pan :delay 0.17}))

(defn- snooze! [ctx pan]
  (tone! ctx {:freq 392.0 :type :sine :dur 0.30 :peak 0.09 :attack 0.10 :pan pan})
  (tone! ctx {:freq 294.0 :type :sine :dur 0.45 :peak 0.07 :attack 0.12 :pan pan :delay 0.24}))

(defn- snore! [ctx deep?]
  (let [t0 (now)
        n (noise-src ctx 1.6)
        f (.createBiquadFilter ctx)
        g (.createGain ctx)
        p (panner ctx 0.35)
        o (.createOscillator ctx)
        og (.createGain ctx)]
    (set! (.-type f) "lowpass")
    (set! (.-frequency f) (if deep? 240 300))
    (set! (.-Q f) 0.8)
    (env! ctx g t0 (if deep? 0.10 0.07) 0.35 0.7)
    (connect-> n f g p (:sfx-bus @S))
    (.start n t0)
    (.stop n (+ t0 1.7))
    (set! (.-type o) "sine")
    (.setValueAtTime (.-frequency o) (if deep? 78 92) t0)
    (.linearRampToValueAtTime (.-frequency o) (if deep? 110 126) (+ t0 0.4))
    (.exponentialRampToValueAtTime (.-frequency o) (if deep? 70 84) (+ t0 0.9))
    (env! ctx og t0 0.07 0.28 0.75)
    (connect-> o og p)
    (.start o t0)
    (.stop o (+ t0 1.3))))

(defn- shimmer! [ctx pan]
  (tone! ctx {:freq 392.0 :type :triangle :dur 0.40 :peak 0.11 :attack 0.01
              :glide 587.0 :pan pan})
  (tone! ctx {:freq 784.0 :type :sine :dur 0.30 :peak 0.05 :attack 0.02 :pan pan :delay 0.04}))

(defn- twinkle! [ctx pan]
  (tone! ctx {:freq 1174.66 :type :sine :dur 1.1 :peak 0.06 :attack 0.006 :pan pan})
  (tone! ctx {:freq 1567.98 :type :sine :dur 0.9 :peak 0.035 :attack 0.01 :pan pan :delay 0.08}))

(defn sfx!
  "Play one queued event from the world."
  [ev]
  (let [ctx (:ctx @S)]
    (when (and ctx (:on? @S))
      (let [pan (:pan ev 0)]
        (case (:kind ev)
          :pluck (do (pluck! ctx {:freq (scale-freq (* 0.55 (:pitch ev 0.5))) :peak 0.24 :pan pan})
                     (pluck! ctx {:freq (* 2 (scale-freq (* 0.55 (:pitch ev 0.5)))) :peak 0.07 :pan pan :delay 0.02}))
          :twinkle (twinkle! ctx pan)
          :brush-start (brush! true 0.45 pan)
          :brush (brush! true (:intensity ev 0.4) pan)
          :shimmer (shimmer! ctx pan)
          :whoosh (whoosh! ctx pan)
          :peal (peal! ctx)
          :door (door! ctx)
          :tock (tock! ctx pan)
          :mutter (mutter! ctx pan)
          :snooze (snooze! ctx pan)
          :snore (snore! ctx (:deep ev))
          :moth-away (dotimes [i 3] (pluck! ctx {:freq (+ 880 (* 90 i)) :peak 0.05 :dur 0.3 :delay (* i 0.07) :pan 0.2}))
          :moth-land (pluck! ctx {:freq 1318.51 :peak 0.08 :dur 1.0 :pan 0.25})
          nil)))))
