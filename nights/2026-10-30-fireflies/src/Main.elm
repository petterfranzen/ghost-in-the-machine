module Main exposing (main)

{-| Fireflies — a dusk meadow you fill with fireflies.

One tap lifts a small hush of them out of the grass. They drift slowly upward,
blink on their own rhythm and fade out over about a minute. Nothing to win,
nothing to lose, no score and no timer.

The whole app is one Elm module: a pure model, an update, a view. No ports, no
JavaScript beyond the four lines in index.html that mount it.

-}

import Browser
import Browser.Dom
import Browser.Events
import Html exposing (Html)
import Html.Attributes as H
import Html.Events as E
import Json.Decode as D
import Set exposing (Set)
import Svg exposing (Svg, circle, defs, g, linearGradient, path, radialGradient, rect, stop, svg)
import Svg.Attributes as A
import Task


{-| How many fireflies may be in the air at once. Past this, the oldest ones are
sent off early so the sky stays readable (and the frame stays cheap).
-}
cap : Int
cap =
    130


maxSpawn : Int
maxSpawn =
    7



-- MODEL


type alias Firefly =
    { id : Int
    , x : Float
    , y : Float
    , vx : Float
    , vy : Float
    , seed : Float
    , period : Float
    , phase : Float
    , size : Float
    , cool : Bool
    , age : Float
    , life : Float
    }


type alias Star =
    { u : Float
    , v : Float
    , r : Float
    , delay : Float
    , dur : Float
    }


type alias Reed =
    { u : Float
    , height : Float
    , lean : Float
    }


type alias Model =
    { w : Float
    , h : Float
    , t : Float
    , flies : List Firefly
    , stars : List Star
    , reeds : List Reed
    , still : Bool
    , hint : Bool
    , dragging : Bool
    , lastX : Float
    , lastY : Float
    , nextId : Int
    }


type Msg
    = Tick Float
    | Viewport Float Float
    | Down Float Float
    | Move Float Float
    | Up
    | Hush
    | ToggleStill
    | NoOp


{-| A deterministic 0..1 value from two integers. A cheap hash: no state to carry,
so the sky, the stars and every firefly look the same on every load, and the
smoke test can reason about them.
-}
rand : Int -> Int -> Float
rand salt i =
    let
        v =
            sin (toFloat (salt * 7919 + i * 104729)) * 43758.5453
    in
    v - toFloat (floor v)


starField : List Star
starField =
    List.range 0 63
        |> List.map
            (\i ->
                { u = rand 1 i
                , v = rand 2 i * 0.6
                , r = 0.45 + rand 3 i * 1.05
                , delay = rand 4 i * 7
                , dur = 3.2 + rand 5 i * 5.5
                }
            )


reedField : List Reed
reedField =
    List.range 0 31
        |> List.map
            (\i ->
                { u = toFloat i / 31 + (rand 6 i - 0.5) * 0.022
                , height = 0.04 + rand 7 i * 0.12
                , lean = (rand 8 i - 0.5) * 0.9
                }
            )


init : Bool -> ( Model, Cmd Msg )
init _ =
    ( { w = 390
      , h = 844
      , t = 0
      , flies = []
      , stars = starField
      , reeds = reedField
      , still = False
      , hint = True
      , dragging = False
      , lastX = 0
      , lastY = 0
      , nextId = 0
      }
    , Browser.Dom.getViewport
        |> Task.perform (\vp -> Viewport vp.viewport.width vp.viewport.height)
    )



-- SPAWNING


spawn : Int -> Float -> Float -> Firefly
spawn i px py =
    let
        angle =
            rand 21 i * 6.2831853

        speed =
            4 + rand 22 i * 9

        lift =
            10 + rand 23 i * 20
    in
    { id = i
    , x = px
    , y = py
    , vx = cos angle * speed * 0.5
    , vy = sin angle * speed * 0.35 - lift
    , seed = rand 24 i * 10
    , period = 2.4 + rand 25 i * 3.6
    , phase = rand 26 i * 6.2831853
    , size = 2.4 + rand 27 i * 2.6
    , cool = rand 28 i < 0.3
    , age = 0
    , life = 42 + rand 29 i * 48
    }


{-| Add a small hush at a point: a loose cluster, not a stamp.
-}
hushAt : Float -> Float -> Model -> Model
hushAt x y m =
    let
        n =
            m.nextId

        fresh =
            List.range 0 (maxSpawn - 1)
                |> List.map
                    (\k ->
                        spawn (n + k)
                            (x + (rand 11 (n + k) - 0.5) * 62)
                            (y + (rand 12 (n + k) - 0.5) * 50)
                    )
    in
    { m | flies = trim (m.flies ++ fresh), nextId = n + maxSpawn }


{-| Keep the sky under the cap without a visible cut: the ones with the least
time left are given a short goodbye instead of being deleted mid-glow.
-}
trim : List Firefly -> List Firefly
trim flies =
    let
        excess =
            List.length flies - cap
    in
    if excess <= 0 then
        flies

    else
        let
            -- the ones with the least time left are given a short goodbye
            doomed : Set Int
            doomed =
                flies
                    |> List.sortBy (\f -> f.life - f.age)
                    |> List.take excess
                    |> List.map .id
                    |> Set.fromList

            marked =
                List.map
                    (\f ->
                        if Set.member f.id doomed then
                            { f | age = max f.age (f.life - 2.2) }

                        else
                            f
                    )
                    flies

            over =
                List.length marked - cap
        in
        -- a burst of taps between two frames can outrun the goodbye; then the
        -- oldest are simply dropped, which is the one moment nothing is missed
        if over <= 0 then
            marked

        else
            List.drop over marked


{-| The hush button: fade everyone out over about two and a half seconds.
-}
sendOff : Firefly -> Firefly
sendOff f =
    { f | age = max f.age (f.life - 2.4) }



-- MOTION


{-| Slow wander plus a very weak pull toward the middle of the air, so fireflies
drift like insects rather than fly in straight lines. Speed is capped so nothing
ever darts.
-}
stepFly : Float -> Float -> Float -> Firefly -> Firefly
stepFly w h dt f =
    let
        age2 =
            f.age + dt

        n1 =
            sin (age2 * 0.21 + f.seed * 7.3)

        n2 =
            cos (age2 * 0.17 + f.seed * 4.1)

        ax =
            n1 * 6.5 + (w * 0.5 - f.x) * 0.0035

        ay =
            n2 * 5.0 + (h * 0.44 - f.y) * 0.010

        damp =
            1 - 0.55 * dt

        vx2 =
            (f.vx + ax * dt) * damp

        vy2 =
            (f.vy + ay * dt) * damp

        sp =
            sqrt (vx2 * vx2 + vy2 * vy2)

        k =
            if sp > 20 then
                20 / sp

            else
                1

        vx3 =
            vx2 * k

        vy3 =
            vy2 * k
    in
    { f
        | age = age2
        , x = f.x + vx3 * dt
        , y = f.y + vy3 * dt
        , vx = vx3
        , vy = vy3
    }


{-| How bright a firefly is right now: a short flash on its own slow rhythm,
scaled by a fade in over the first couple of seconds and a long fade out at the
end of its life.
-}
brightness : Float -> Firefly -> Float
brightness t f =
    let
        fadeIn =
            clamp 0 1 (f.age / 0.35)

        fadeOut =
            clamp 0 1 ((f.life - f.age) / 12)

        pulse =
            sin (2 * pi * (t / f.period) + f.phase)

        flash =
            if pulse > 0 then
                pulse ^ 7

            else
                0
    in
    fadeIn * sqrt fadeOut * (0.22 + 0.78 * flash)


clampFly : Float -> Float -> Firefly -> Firefly
clampFly w h f =
    { f | x = clamp 4 (max 8 (w - 4)) f.x, y = clamp 4 (max 8 (h - 4)) f.y }



-- UPDATE


update : Msg -> Model -> ( Model, Cmd Msg )
update msg m =
    case msg of
        NoOp ->
            ( m, Cmd.none )

        Tick dms ->
            if m.still then
                ( m, Cmd.none )

            else
                let
                    dt =
                        clamp 0 0.05 (dms / 1000)

                    flies =
                        List.map (stepFly m.w m.h dt) m.flies
                            |> List.filter (\f -> f.age < f.life)
                in
                ( { m | t = m.t + dt, flies = flies }, Cmd.none )

        Viewport w h ->
            ( { m
                | w = max 200 w
                , h = max 200 h
                , flies = List.map (clampFly (max 200 w) (max 200 h)) m.flies
              }
            , Cmd.none
            )

        Down x y ->
            ( { m
                | dragging = True
                , lastX = x
                , lastY = y
                , hint = False
              }
                |> hushAt x y
            , Cmd.none
            )

        Move x y ->
            if not m.dragging then
                ( m, Cmd.none )

            else if ((x - m.lastX) ^ 2 + (y - m.lastY) ^ 2) > 34 * 34 then
                ( { m | lastX = x, lastY = y } |> hushAt (x - 6) (y - 4), Cmd.none )

            else
                ( m, Cmd.none )

        Up ->
            ( { m | dragging = False }, Cmd.none )

        Hush ->
            ( { m | flies = List.map sendOff m.flies, hint = False }, Cmd.none )

        ToggleStill ->
            ( { m | still = not m.still }, Cmd.none )



-- VIEW


s : Float -> String
s =
    String.fromFloat


num : Float -> String
num v =
    String.fromFloat (toFloat (round (v * 10)) / 10)


defs_ : List (Svg Msg)
defs_ =
    [ linearGradient
        [ A.id "sky", A.x1 "0", A.y1 "0", A.x2 "0", A.y2 "1" ]
        [ stop [ A.offset "0", A.stopColor "#05080f" ] []
        , stop [ A.offset "0.42", A.stopColor "#0b1322" ] []
        , stop [ A.offset "0.74", A.stopColor "#182036" ] []
        , stop [ A.offset "0.9", A.stopColor "#262a3e" ] []
        , stop [ A.offset "1", A.stopColor "#2f2c3c" ] []
        ]
    , radialGradient
        [ A.id "lastLight", A.cx "0.5", A.cy "1.02", A.r "0.62" ]
        [ stop [ A.offset "0", A.stopColor "#7a4a34", A.stopOpacity "0.55" ] []
        , stop [ A.offset "0.55", A.stopColor "#5c3b34", A.stopOpacity "0.18" ] []
        , stop [ A.offset "1", A.stopColor "#3a2b33", A.stopOpacity "0" ] []
        ]
    , radialGradient
        [ A.id "glowWarm" ]
        [ stop [ A.offset "0", A.stopColor "#fff6d8", A.stopOpacity "1" ] []
        , stop [ A.offset "0.16", A.stopColor "#ffd47c", A.stopOpacity "0.95" ] []
        , stop [ A.offset "0.45", A.stopColor "#ff9f45", A.stopOpacity "0.32" ] []
        , stop [ A.offset "0.75", A.stopColor "#ff7f2a", A.stopOpacity "0.09" ] []
        , stop [ A.offset "1", A.stopColor "#ff7f2a", A.stopOpacity "0" ] []
        ]
    , radialGradient
        [ A.id "glowCool" ]
        [ stop [ A.offset "0", A.stopColor "#f4ffd9", A.stopOpacity "1" ] []
        , stop [ A.offset "0.16", A.stopColor "#dcff96", A.stopOpacity "0.95" ] []
        , stop [ A.offset "0.45", A.stopColor "#a9e86a", A.stopOpacity "0.30" ] []
        , stop [ A.offset "0.75", A.stopColor "#7fd257", A.stopOpacity "0.08" ] []
        , stop [ A.offset "1", A.stopColor "#7fd257", A.stopOpacity "0" ] []
        ]
    ]


skyLayer : Model -> List (Svg Msg)
skyLayer m =
    [ rect [ A.x "0", A.y "0", A.width (s m.w), A.height (s m.h), A.fill "url(#sky)" ] []
    , rect [ A.x "0", A.y "0", A.width (s m.w), A.height (s m.h), A.fill "url(#lastLight)" ] []
    ]


starNode : Model -> Star -> Svg Msg
starNode m st =
    circle
        [ A.cx (num (st.u * m.w))
        , A.cy (num (st.v * m.h))
        , A.r (num st.r)
        , A.fill "#cddaf3"
        , A.class "star"
        , A.style
            ("animation-delay:-"
                ++ num st.delay
                ++ "s;animation-duration:"
                ++ num st.dur
                ++ "s"
            )
        ]
        []


starLayer : Model -> List (Svg Msg)
starLayer m =
    List.map (starNode m) m.stars


groundPath : Model -> String
groundPath m =
    let
        y0 =
            m.h * 0.94

        w5 =
            m.w / 5

        cx i =
            (toFloat i + 0.5) * w5

        cy i =
            y0 + (rand 31 i - 0.5) * m.h * 0.02

        endX i =
            toFloat i * w5

        endY i =
            y0 + (rand 32 i - 0.5) * m.h * 0.03

        segs =
            List.range 0 4
                |> List.map
                    (\i ->
                        " Q "
                            ++ num (cx i)
                            ++ " "
                            ++ num (cy i)
                            ++ " "
                            ++ num (endX (i + 1))
                            ++ " "
                            ++ num (endY (i + 1))
                    )
                |> String.concat
    in
    "M 0 " ++ num m.h ++ " L 0 " ++ num (endY 0) ++ segs ++ " L " ++ num m.w ++ " " ++ num m.h ++ " Z"


groundNode : Model -> Svg Msg
groundNode m =
    path [ A.d (groundPath m), A.fill "#050810" ] []


reedNode : Model -> Reed -> Svg Msg
reedNode m rd =
    let
        x0 =
            rd.u * m.w

        top =
            m.h * (1 - rd.height)

        base =
            m.h * 0.965

        lean =
            rd.lean * m.w * 0.022
    in
    path
        [ A.d
            ("M "
                ++ num x0
                ++ " "
                ++ num base
                ++ " Q "
                ++ num (x0 + lean * 0.4)
                ++ " "
                ++ num ((base + top) / 2)
                ++ " "
                ++ num (x0 + lean)
                ++ " "
                ++ num top
            )
        , A.fill "none"
        , A.stroke "#070a12"
        , A.strokeWidth (num (1.4 + rd.height * 11))
        , A.strokeLinecap "round"
        ]
        []


reedLayer : Model -> List (Svg Msg)
reedLayer m =
    List.map (reedNode m) m.reeds


flyNode : Float -> Firefly -> Svg Msg
flyNode t f =
    let
        b =
            brightness t f

        r =
            f.size * (0.9 + 0.85 * b)
    in
    circle
        [ A.cx (num f.x)
        , A.cy (num f.y)
        , A.r (num r)
        , A.fill
            (if f.cool then
                "url(#glowCool)"

             else
                "url(#glowWarm)"
            )
        , A.opacity (num (clamp 0 1 (b * 1.1)))
        ]
        []


flyLayer : Model -> List (Svg Msg)
flyLayer m =
    [ g [ A.class "flies", A.style "mix-blend-mode:screen" ]
        (m.flies
            |> List.filter (\f -> brightness m.t f > 0.004)
            |> List.map (flyNode m.t)
        )
    ]


view : Model -> Html Msg
view m =
    Html.div
        [ H.class "stage"
        , E.on "pointerdown" (D.map2 Down (D.field "clientX" D.float) (D.field "clientY" D.float))
        , E.on "pointermove" (D.map2 Move (D.field "clientX" D.float) (D.field "clientY" D.float))
        , E.on "pointerup" (D.succeed Up)
        , E.on "pointercancel" (D.succeed Up)
        ]
        [ svg
            [ A.class "scene"
            , A.viewBox ("0 0 " ++ num m.w ++ " " ++ num m.h)
            , A.preserveAspectRatio "none"
            ]
            (defs_
                ++ skyLayer m
                ++ starLayer m
                ++ [ groundNode m ]
                ++ reedLayer m
                ++ flyLayer m
            )
        , Html.div
            [ H.class ("hint" ++ (if m.hint then "" else " gone")) ]
            [ Html.text "tap the air" ]
        , Html.div [ H.class "chrome", E.stopPropagationOn "pointerdown" (D.succeed ( NoOp, True )) ]
            [ Html.button
                [ H.class "pill", H.type_ "button", E.onClick Hush ]
                [ Html.text "hush" ]
            , Html.button
                [ H.class ("pill" ++ (if m.still then " on" else ""))
                , H.type_ "button"
                , E.onClick ToggleStill
                ]
                [ Html.text "still" ]
            ]
        ]


subscriptions : Model -> Sub Msg
subscriptions _ =
    Sub.batch
        [ Browser.Events.onAnimationFrameDelta Tick
        , Browser.Events.onResize (\w h -> Viewport (toFloat w) (toFloat h))
        ]


main : Program Bool Model Msg
main =
    Browser.element
        { init = init
        , update = update
        , view = view
        , subscriptions = subscriptions
        }
