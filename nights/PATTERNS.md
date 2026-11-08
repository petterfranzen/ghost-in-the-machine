# Hidden-interaction patterns

Not every night hides something. But when one does, it should feel like a
discovery, not a puzzle: a small thing the player stumbles into, and the scene
answers it gently. This file is the crew's memory of how those interactions are
built, so each night starts from good ground instead of rediscovering it.

Read it before designing a night. Pick at most one or two patterns; a night with
four secrets is a scavenger hunt, not a calm toy.

## The rules that never bend

From the nights' house rules:

- sound off until the player asks for it;
- 44 px targets and 16 px text (a 12 px eyebrow is fine);
- reduced motion respected: the hidden thing still works, it just stops moving;
- one-handed, in the lower part of a 390 px phone;
- calm: nothing flashes, nothing loud, everything fades.

Two more, for hidden things in particular:

- **Never punish.** A missed tap costs nothing: no wrong buzzer, no lost
  progress, no timer, no "you failed". The player can always just stop.
- **Never end the scene.** A hidden interaction adds a small moment and hands
  the scene back to itself. It does not open a screen, take over the view, or
  lock the player in.

## How to hint it

Teach, do not explain. Never a tutorial wall: at most one line of text, and only
when the player has stopped.

The crew's shared nights helper offers an idle hint: `idleHint(el, { after:
12000, show, hide })` shows one soft hint after about twelve seconds with no
input, hides it on the next input, and shows it no more than three times; under
reduced motion the hint is static. Use it, or copy its shape into an older night
that does not have it yet.

A good hint is a nudge ("something here is watching back"), not instructions.
More often the object answering the first tap is hint enough on its own.

---

## 1. Long-press (hold in place)

**Discover:** the player rests a thumb on something longer than a tap. Nothing
invites it, so the idle hint, or the object's own first answer, is what teaches
it.

**One-handed fit:** the most one-handed gesture there is: no travel, no second
hand. Answer within about 400 ms (a soft swell, a gradual brighten) so the
player knows the hold is registering.

**Hint:** a one-line idle hint ("hold the ..."), or let the object breathe
slightly while a finger is down.

**Failure to avoid:** no charge bar, no deadline, no "you let go too early".
Lifting early returns the thing to exactly how it was.

**Seen in:** not shipped in a night yet. Fireflies names it as its own next step
in its README ("let a long press hold a single firefly under your finger"); the
nearest shipped gesture is Koi Drift's drag, which is a hold that travels.

## 2. Counted taps in one spot (three taps)

**Discover:** the player taps the same object again out of curiosity, and the
third tap is a small surprise rather than a reward.

**One-handed fit:** fine, but the spot must be a 44 px target and away from the
screen edge. Count taps landing inside the same hit area within a couple of
seconds, and be generous.

**Hint:** let taps one and two already answer (a wobble, a small note), so the
player learns "this one responds" and keeps going.

**Failure to avoid:** no visible counter, no timeout that wipes progress with a
"miss" sound, no door that stays locked if the player stops at two.

**Seen in:** the repo has a counted goal, not yet a counted tap. Lantern Moss
asks the player to bring three separate lights home; taps there are on separate
objects. The three-taps-in-one-spot form is not shipped yet.

## 3. Tilt (device orientation)

**Discover:** the player tips the phone while holding it and the scene leans
with them: accidental on the first hold, delightful once noticed.

**One-handed fit:** good, it uses the thumb's grip rather than a second hand,
but it must never be the only way to do something. Always pair it with a tap or
drag fallback, because phones ask permission for motion and many players say no.

**Hint:** a one-line idle hint, or move the scene slightly on its own once, so a
still phone still shows the effect exists.

**Failure to avoid:** never require the tilt and never block on the permission
prompt; being declined changes nothing about the scene.

**Seen in:** no night reads device orientation. The nearest one-handed
equivalent is Lantern Moss, where one thumb points and the walker goes: a
position, with no gesture to learn.

## 4. Drag an object onto another (drag to combine)

**Discover:** a thing can be picked up and carried, and dropped on another thing
it answers.

**One-handed fit:** good with a thumb, but keep the carry short, since long
drags across a phone are awkward. Snap the object loosely to nearby targets so
the player does not have to be precise.

**Hint:** let the carried object follow the finger with a little lag and
brighten the target as it comes close.

**Failure to avoid:** no "wrong drop" rejection: dropping anywhere leaves the
object where it landed and the scene unchanged.

**Seen in:** drags exist but nothing combines. Zen Rake drags a rake across the
sand, leaving a mark; Koi Drift drags a trail of food. Dragging one thing onto
another is new.

## 5. Wait-and-see (patience)

**Discover:** the player stops touching and just watches, and the scene does
something on its own.

**One-handed fit:** perfect, it needs no hands at all, which is the calmest kind
of interaction.

**Hint:** usually none is right. The scene should be alive before the player
arrives; the idle hint can point at it once ("stay a while").

**Failure to avoid:** never require waiting and never give only the patient
something the impatient lose. Whatever happens should also be reachable by a
tap, and never on a timer that ends the scene.

**Seen in:** Koi Drift. Its pond keeps moving on its own: "now and then, from
something touching the surface somewhere you are not looking", and crumbs
dissolve if no-one finds them. Fireflies' sky likewise keeps breathing with no
input.

## 6. Tap-the-moon (a thing that looks like scenery)

**Discover:** one element looks decorative and turns out to answer: the moon in
the sky, a star, a far-off leaf.

**One-handed fit:** a tap in the lower half is easy, but a real moon sits high,
out of thumb reach, so either keep the target low or accept that the discovery is
worth a stretch. Prefer a high target that is small and forgiving.

**Hint:** the idle hint, or the existing "tap the sky" line, is enough: the
player taps scenery anyway.

**Failure to avoid:** no punishment for tapping scenery that is not the moon.
Everywhere else stays quiet, and the moon's answer fades back to scenery.

**Seen in:** Songbranch already teaches tapping scenery: its hint reads "tap a
bird, tap the trunk, tap the sky", and tapping the sky moves only the leaves. A
moon that answers is planned for the night's revision; it is not in the shipped
folder yet.

## 7. Edge swipe (a swipe from the screen edge)

**Discover:** the player swipes inward from a screen edge and something slides in
or opens.

**One-handed fit:** good on the lower and side edges, awkward along the top,
which is the browser's own zone. Keep it to the bottom or a side.

**Hint:** a soft affordance, a small tab or a faint line at the edge, rather
than text.

**Failure to avoid:** never make it the only route to something, never punish a
swipe that does not start exactly at the edge, and never let it fight the
browser's own back gesture.

**Seen in:** no night uses an edge swipe. Nights stay single-screen on purpose,
so treat this as the riskiest pattern, and reach for it only when a night needs
a second surface.

## 8. Count-based secret (do a thing N times)

**Discover:** the player does something a few times across a session and the
scene quietly changes: the fifth firefly, the third light home, ten taps in a
minute.

**One-handed fit:** any one-handed action can be the counter; just keep the count
small (three to five) and the window generous.

**Hint:** a gradual change the player can feel before the count completes, the
scene warming or a note rising, so it never reads as a hidden timer.

**Failure to avoid:** never show "3/5", never reset visibly on a miss, and never
lock anything behind the count. Reaching it adds a small change, it does not open
a gate.

**Seen in:** Lantern Moss, where bringing the three lost lights home quietly
lights the clearing. Songbranch's note ladder is a softer cousin: each tap on a
bird steps one note up a pentatonic scale.

## 9. Tap the right spot (a small object in the world)

**Discover:** the player taps a small thing that is part of the scene rather than
the whole screen, and it answers specifically.

**One-handed fit:** good if the object sits in the lower two-thirds; give it a
hit area larger than the sprite (Lantern Moss used 17 px around a 14 px sprite)
so a phone thumb does not have to pixel-hunt.

**Hint:** let the object react to a near miss with a small turn or a glance, so
the player learns it is the thing that answers.

**Failure to avoid:** never make the whole scene dead except one pixel. Tapping
elsewhere should still do something gentle, so a miss is not silence.

**Seen in:** Lantern Moss ("tap near a lost spark, it will follow you home") and
Songbranch (a tap on a bird hops it; a tap on the trunk knocks the tree). This
is the repo's most-used hidden-ish pattern and the safest to start from.

## 10. Trace a shape (draw a circle or a path)

**Discover:** the player drags a particular shape, a circle around a stone or a
line through the leaves, and the scene answers.

**One-handed fit:** good for a small shape in the lower half; keep it small so
the thumb does not have to travel.

**Hint:** the drag already leaves a mark, and the shape should complete
generously (an approximate circle counts).

**Failure to avoid:** never require an exact shape, never fail a near-miss, and
never block the gesture behind a perfect start point.

**Seen in:** Zen Rake invites exactly this in its README ("try a small circle
around one of the stones"), but the circle is not special-cased: the rake draws
wherever the thumb goes. Recognising the shape is new.

## 11. It remembers you (leave and return)

**Discover:** the player closes the page and comes back, and the scene is where
they left it: the same sky, the same garden.

**One-handed fit:** no gesture at all. It is the calmest kind of secret and the
kindest for a one-handed session that gets interrupted.

**Hint:** none. On return, a faint line ("welcome back") is enough, once.

**Failure to avoid:** never make coming back a duty: no streak, no "you missed a
day", no decay. An empty return starts the scene fresh, with no reproach.

**Seen in:** no night ships it, but three READMEs name it as their next step:
Ripple Pool, Zen Rake and Koi Drift all plan to keep their state in
`localStorage`.

## 12. A secret on the sound button (press it twice)

**Discover:** the player presses the sound button a second time and finds a
quieter layer underneath: an ambience, a second sound.

**One-handed fit:** the button already sits in the bottom corner within thumb
reach and is a 44 px target.

**Hint:** none. This is a secret for a player already exploring; keep it in the
existing control and never add a new one.

**Failure to avoid:** never make the second press loud or startling, never make
it the only way to silence the night, and keep the first press always "sound on",
so the rule "sound off by default" still holds.

**Seen in:** Koi Drift names it in its README's next step: "a very quiet ambient
bed (birds, water) that stays off until the sound button is pressed twice, so a
first tap is still silent."

---

_Patterns are the crew's, gathered from the nights' own READMEs and LOG lines.
When a night ships one, add its folder to the "Seen in" line here._
