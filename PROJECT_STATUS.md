# Wonderful Summit — Project Status

Updated: 2026-11-07

## Start here
- Repository: https://github.com/lopappas/lopappas.github.io — branch master.
- Live game: https://lopappas.github.io/wonderful-summit/
- Read AGENTS.md for workflow and minimal deployment polling.
- Source: wonderful-summit/source/. Detailed game notes: its README.md.
- Commands from source: npm ci, npm test, npm run build.
- Publish the contents of source/dist-pages/ under wonderful-summit/.

## Current state
Tutorial 2.0 milestones 1–7 are complete: Fire/Nature/Water lessons, the goblin quality comparison, guaranteed Colorful Rock inspection and a final independent elemental-slime test. The main menu has one Tutorial entry opening Tutorial 2.0; the old tutorial has been removed.

Milestone 7: removed the old tutorial session/state machine, combat hooks, spellbook hints, styling and exclusive tests. Retained shared elemental-resistance tests and mode guards. Existing ?tutorial=2 review links remain compatible. Validation: all 494 retained tests pass; TypeScript and production build pass. Source and matching build are published in one commit; deployment status is checked once. No new browser/device pass was performed for this cleanup.

Earlier completed changes: title card waits for every bundled font before mounting; title-screen pencil-audio priming is explicitly muted until dialogue lettering. Credits return prompt uses the Wonderful rainbow lettering. Encyclopedia subtitle removed. Theodora's name is 15% smaller, portrait 20% smaller, and dialogue types 20% faster. Starter relic heading is “Filadora's starter relic”; duplicate robe details above its inspection icon are removed.

Milestone 6 validation: 519 tests passed and the production build passed against current GitHub source. New full-sequence tests run all three final elements with real recognition, combat, potion healing, failed-cast recovery and pause/stale-callback checks. No runtime defect was found in the automated pass. On 2026-11-07, the user confirmed completion of the manual browser and physical-device checks. See wonderful-summit/source/docs/tutorial2-verification.md for the user-reported sign-off; device/browser versions were not recorded.

## Important current decisions
- Shared Filadora dialogue: bold full speaker name, stable Kurale font, fading letters, 48/1.15 ms character interval and extra 500 ms punctuation pauses.
- Completed dialogue waits indefinitely for a tap. The white "Tap to continue" hint disappears on acknowledgement. Early, paused or duplicate taps must not skip steps.
- Pencil audio primes muted on game gestures, unmutes only for lettering, stops for punctuation/reading pauses, pause, hidden-page time and unmount, and follows Master/Sound Effects volume.
- Element/spell names and elemental slime phrases include adjacent punctuation in their colors. "Non-elemental" is dark gray; Faint grade text is pale white and readable.
- Opening Fire slime: 800 ms slide plus 600 ms wait before dialogue. Water ambush fades in at contact range and waits 1.5 seconds before attacking.
- The inkwell spill occurs on "Whoops!", empties ink and plays the bottle sound. Refill precedes Hearthspark, followed by the Nature-slime recovery line. Potion recovery keeps its 1.8-second wait before the Water-slime recovery line.
- Nephew's 48% triangle appears instantly without a cast prompt or spotlight. The 100% triangle draws over 3 seconds. Their real 6.5 + 51.5 damage exactly defeats the 58 HP neutral goblin.
- After goblin defeat: 1.8-second wait, quality explanation, relic dialogue and Colorful Rock inspection. After inspection, wait 1 active second before the canvas-centered "Tap anywhere to continue".
- Final heading: "Your Final Test". Free controls; full health, full ink, one health potion and Colorful Rock. Retry restores resources and retains the same slime element.

## Where to look
Paths below are relative to wonderful-summit/source/:
- Presentation: src/Tutorial2Session.tsx, src/FilaDialogue.tsx, src/tutorial2.css.
- Sequence: src/tutorial2Elements.ts, src/tutorial2Goblin.ts, src/tutorial2Final.ts.
- Dialogue/audio: src/filaDialogue.ts, src/dialogueAudio.ts, src/sound.ts.
- Credits: src/Settings.tsx, src/Credits.tsx, src/TitleMountain.tsx.
- Recording/license: src/audio/frostnox_quick-pencil-writing.ogg and src/audio/ATTRIBUTION.txt.

## Remaining work
- No remaining planned Tutorial 2.0 milestones. Await the next requested change.
- Historical Pages timeouts/queued retries are not evidence of a current outage. Check current status only when relevant, following AGENTS.md.
- Historical generated bundles remain in the published assets folder; cleanup has not been requested.

Replace stale information after significant work. Keep this a current handoff, not a conversation or commit log.
