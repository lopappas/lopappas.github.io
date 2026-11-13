# Wonderful Summit — Project Status

Updated: 2026-11-13

## Start here
- Repository: https://github.com/lopappas/lopappas.github.io — branch master.
- Live game: https://lopappas.github.io/wonderful-summit/
- Read AGENTS.md for workflow and minimal deployment polling.
- Source: wonderful-summit/source/. Detailed game notes: its README.md.
- Commands from source: npm ci, npm test, npm run build.
- Publish the contents of source/dist-pages/ under wonderful-summit/.

## Current state
Tutorial 2.0 milestones 1–7 are complete: Fire/Nature/Water lessons, the goblin quality comparison, guaranteed Colorful Rock inspection and a final independent elemental-slime test. The main menu has one Tutorial entry opening Tutorial 2.0; the old tutorial has been removed.

Latest update (version 0.2.70; package 0.2.70): Performance milestone 2 implemented. BattlePresentation publishes live snapshots directly to AnimatedWorld while the Combat/control state changes only for displayed UI values (health, potions/bottles, relic states, practice statuses, transient message expiry and cooldown/effect tenths). Simulation and actions still use the current battleRef. StaticScenery memoizes the unchanged SVG definitions/background and retains Chronos color transitions; no frame cap or balance changes. Reports retain the original Combat commit fields and add independent battlefield commits. The supplied 0.2.60 iPhone baseline is preserved in source/docs/performance-baseline-iphone.json (59.874 updates/s, 17 ms p95, 0.04833 ms simulation, 61.078 Combat commits/s over 56.78 active seconds). Repeat the ordinary-combat phone capture on 0.2.70 to measure the result; no temperature/power improvement is claimed yet.

Version 0.2.60: Performance milestone 1 implemented. Combat now owns one animation callback only while active/visible and unpaused; ending combat cancels scheduling immediately, and pause/visibility resumes with a fresh clock. Practice-learning animation and dialogue typing/position tracking also stop while inactive/hidden. An opt-in Developer-panel performance monitor reports bounded (600 sample) active combat callback intervals, simulation-only time and Combat commit counts. It is off on page load, refreshes its independent overlay once per second only when enabled, and can copy a local aggregate report. No frame cap or combat rendering refactor yet. See source/docs/performance.md for metric definitions, capture protocol and local pre-change baseline. A before-change iPhone baseline has been supplied; the after-change comparison remains outstanding.

Version 0.2.54: Ink costs are divided by 1.4, giving 40% more drawing distance from the unchanged 100-ink capacity. Burn visuals use 5 particles instead of 7, spread over the original width; Firestorm uses 41 rain streaks instead of 58. Damage and effect timing are unchanged. Torrent’s practice demonstration is one continuous stroke from the left tip through the bottom junction to the right tip, using the existing shape. Casting tips match.

Version 0.2.53: Released spell ink now fades intact over 210 ms. The shared ink hook paints the released drawing once, then updates canvas opacity without redrawing paths each frame (repainting only if the canvas size or drawing changes). Fragment movement is removed; charge rumble/expansion and the 210 ms canvas lockout remain. Combat recognition compares geometry once at charge start and once at completion for both pointer and keyboard casting. applyRecognitionBonus derives boosted acceptance from existing candidate scores, retaining raw accuracy, original ambiguity margins, rescue of below-threshold scores, and the 100% cap.

Version 0.2.52: Applied the approved Torrent glyph revision: removed the center vertical jet, preserving the original mirrored low arcs as two strokes sharing their bottom point. Recognition, practice tracing, encyclopedia tips and README now use the two-arc shape.

Version 0.2.51: Casting now uses only the 210 ms ink fade, with no page flip or extra drawing lockout. An act introduction listens for taps anywhere on screen: a tap skips the remaining 1200 ms destination pause and starts sweeping; taps during the sweep keep it moving without restarting. Sweep speed is reduced by 15% (650 / 0.85 ≈ 765 ms). Navigation cleanup removes all listeners and pending animation frames; manual wheel/keyboard cancellation remains. Reduced motion jumps to the bottom on tap.

Version 0.2.50 added Torrent, an Uncommon Water spell using the original approved low-arc blowhole glyph. One large water orb per second lands at a random runway x position and a reachable encounter lane, including future enemy lanes; positions are independent of enemy locations. Each splash hits every present foe in its 65 × 35 world-unit ellipse for Steady (60%) Dewdrop base damage and knockback. Quality selects 5/8/11/14 seconds by grade and controls defenses. Cooldown is 10 seconds; recasts replace the rain. Standard damage upgrades add 25%; relic bonuses are snapshotted, Black Flash is rolled per landing and shared by its victims, and bottles work. Rewards, shops, developer grants, encyclopedia, spellbook and practice include Torrent.

Current act-intro and cast timing: 1200 ms gold destination hold unless tapped, then about 765 ms sweep; only a 210 ms ink fade (210 ms total canvas lockout). Act 2 ends at Webbed ambush. Prior two-act themes, relics and combat Spellbook placement remain.

Existing tutorial guide remains One Last Thing! → Practice → Encyclopedia → Tips & Tricks → Tutorial Complete. Home help and spell rewards at victories 1, 5 and 9 remain.

Version 0.1.53 original colors, gentle cast rumble and ink dissolve remain.

Belladora has no protruding potions. Drawn ink remains 3.45 CSS pixels wide; opening version and potion rarity borders remain.

Settings → Version History remains below Audio and above Credits, with the shared summit window and newest releases first.

Version rules: small releases add 1; bigger releases advance to the next ten (0.1.40 → 0.1.50). Change the middle segment only at the user's request. Package versions remain npm-compatible; labels pad the release segment. npm run version:small / version:feature update both package files. Every release must add notes in src/versionHistory.ts; gameVersion tests guard history/version consistency.

Ending relic text remains black. Birkin-stock enlarges Belladora by 15% in combat and the merchant scene; her defeat frown persists.

Opening starter sigils remain removed; the checkmark fades in after the title-screen tap. Theodora's heading is “Choose a keepsake:”. Regular and lit Forgotten Campsite rest restores 60 health, capped at 100, consuming the single camp action.

Home action is “Play”. Theodora's run-opening dialogue retains the 15% slowdown from version 0.1.1; tutorial timing is unchanged. Shared spellbook subtitle, encyclopedia tab numbers and “Before you climb…” remain removed.

Tutorial header reads “Tutorial”; tutorial popup overlines no longer display “Tutorial 2.0”. Home shows the package.json version at the top left below the header. README documents the revised release numbering; 0.1.00 is the displayed starting baseline.
Validation for this update: all 596 tests pass; TypeScript and production build pass. Eight new tests cover live publication with zero control invalidations for 600 ordinary movement updates, immediate health/terminal/potion/relic reactivity, displayed cooldown tenths and expiry, transient messages, practice effects and independent monitor counters. Extracted scenery SVG matches the original source. Browser QA remains blocked by the unavailable preview relay; an on-device capture and visual pass are outstanding. Source and matching build are published together; deployment status is checked once.

Milestone 7: removed the old tutorial session/state machine, combat hooks, spellbook hints, styling and exclusive tests. Retained shared elemental-resistance tests and mode guards. Existing ?tutorial=2 review links remain compatible. Validation: all 494 retained tests pass; TypeScript and production build pass. Source and matching build are published in one commit; deployment status is checked once. No new browser/device pass was performed for this cleanup.

Earlier completed changes: title card waits for every bundled font before mounting; title-screen pencil-audio priming is explicitly muted until dialogue lettering. Credits return prompt uses the Wonderful rainbow lettering. Encyclopedia subtitle removed. Theodora's name is 15% smaller, portrait 20% smaller. Dialogue speed was subsequently adjusted in version 0.1.1. Starter relic heading is “Filadora's starter relic”; duplicate robe details above its inspection icon are removed.

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
- Settings/history/credits: src/Settings.tsx, src/SummitWindow.tsx, src/Credits.tsx, src/VersionHistory.tsx, src/versionHistory.ts.
- Release numbering: src/gameVersion.ts, scripts/bump-version.mjs, tests/gameVersion.test.ts.
- Recording/license: src/audio/frostnox_quick-pencil-writing.ogg and src/audio/ATTRIBUTION.txt.

## Remaining work
- Tutorial 2.0 is complete. Performance milestones 1–2 are implemented and the 0.2.60 iPhone baseline is recorded. Collect the 0.2.70 iPhone comparison before choosing milestone 3 optimizations.
- Historical Pages timeouts/queued retries are not evidence of a current outage. Check current status only when relevant, following AGENTS.md.
- Historical generated bundles remain in the published assets folder; cleanup has not been requested.

Replace stale information after significant work. Keep this a current handoff, not a conversation or commit log.
