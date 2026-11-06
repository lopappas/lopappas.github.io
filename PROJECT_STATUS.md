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
Tutorial 2.0 milestones 1–5 are implemented: Fire/Nature/Water lessons, the goblin quality comparison, guaranteed Colorful Rock inspection and a final independent elemental-slime test. The old tutorial remains available.

Latest completed feature: Settings → Credits (below Audio), with the iconic summit, supplied credits, Frostnox attribution and tap-anywhere return. Filadora's dialogue now uses the supplied pencil-writing recording.

Latest game-changing commit: cdf82ace6fb56e29e456de3f1b9260cdc035c7b6.
Validation: 514 tests passed; production build passed; Pages deployment succeeded. Credits layout, entry and dismissal were checked live. No game changes are pending.

## Important current decisions
- Shared Filadora dialogue: bold full speaker name, stable Kurale font, fading letters, 48/1.15 ms character interval and extra 500 ms punctuation pauses.
- Completed dialogue waits indefinitely for a tap. The white "Tap to continue" hint disappears on acknowledgement. Early, paused or duplicate taps must not skip steps.
- Pencil audio follows lettering, stops for punctuation/reading pauses, pause, hidden-page time and unmount, and follows Master/Sound Effects volume.
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
- Further end-to-end tutorial verification and eventual old-tutorial cleanup remain. Confirm the requested next milestone's scope; do not start a new milestone solely from this handoff.
- Preserve the old tutorial, menu entry and exclusive tests until its cleanup is requested.
- Historical Pages timeouts/queued retries are not evidence of a current outage. Check current status only when relevant, following AGENTS.md.
- Historical generated bundles remain in the published assets folder; cleanup has not been requested.

Replace stale information after significant work. Keep this a current handoff, not a conversation or commit log.
