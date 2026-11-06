# Tutorial 2.0 — Milestone 6 verification

Verified against GitHub master 04817e415f13ad78be13e36b67f02251b9172b17 on 2026-11-07.

## Automated result

519 tests passed, zero failures; TypeScript and production build passed. No runtime progression defect was found in this pass. The old tutorial and its exclusive tests remain intact.

Run the complete regression suite from wonderful-summit/source/:

```sh
node --experimental-strip-types --test --test-concurrency=2 tests/*.test.ts
npm run build
```

## Added full-sequence coverage

`tests/tutorial2Journey.test.ts` drives the public tutorial state transitions from Fire entry through completion, using the real recognizer, projectile combat, potion effects and enemy health. It repeats the complete journey for Fire, Nature and Water final slimes.

- All elemental lessons, the refill and potion recovery dialogue, goblin comparison, relic inspection and final battle are reachable in order.
- A sub-Steady first cast fails against the real enemy, resets the attempt and recovers through the one-second retry gate.
- Every reached step rejects stale dialogue callbacks; pause blocks ticking, continuation and casting, and resume preserves the current token and progress.
- Time alone cannot dismiss player dialogue, including after ten simulated minutes.
- Water ambush deals one real hit; healing restores the player and consumes the potion.
- The recognizer scores the nephew/perfect triangles at 48%/100%; real damage exhausts the 58 HP goblin exactly.
- Relic inspection reaches the reading-delay gate before dismissal; the final battle uses real elemental damage and reaches victory and completion.
- Replay and final retry invalidate outcomes from prior attempts and keep the relic award.

Existing focused tests additionally cover timing boundaries, guide direction and recognition at different sizes, canonical spell grades, control restrictions, final defeat/resource reset, dialogue/audio lifecycle, fonts and text colors. Full-suite execution also checks the old tutorial and normal game behavior.

## Manual release checklist — not yet verified in this pass

Automated state/combat tests are not browser or physical-device tests. Do not describe the items below as passed without performing them.

- One complete touch-driven journey: draw all three sigils, release Cast early once, fizzle once, retry and replay a guide; verify player ink is above the guide.
- Pause/resume while typing, drawing, holding Cast, replaying a guide and refilling. Background and resume the page; confirm no catch-up combat, duplicate input or continuing pencil audio.
- Confirm a completed Filadora line waits for a tap; the acknowledgement disappears and its tap does not activate the next control.
- Confirm Water fades in, attacks once after its wait, Belladora arrives, and potion healing finishes before the recovery line.
- Confirm nephew drawing pops in without dimming/prompt, perfect drawing animates, and relic dismissal is delayed and centered on the canvas.
- Lose the final fight and retry: same element, fresh drawing, 100 HP, 100 ink, one potion and Colorful Rock. Win and return to the menu; re-entry starts a fresh tutorial.
- Check narrow/short portrait layouts and landscape, large text, reduced motion, keyboard focus, and VoiceOver labels; instructions must not cover required targets.
- Check actual sound/volume and scrolling on a physical iPhone/Safari and Android/Chrome. Device audio and touch behavior remain unverified here.

## Next milestone

Old-tutorial removal is a separate requested cleanup milestone. Do not remove its code, menu entry or exclusive tests as part of verification. Keep current milestones 1–5 behavior unchanged unless a verified defect requires a fix.
