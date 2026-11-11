# Wonderful Summit — Project Status

Updated: 2026-11-11

## Start here
- Repository: https://github.com/lopappas/lopappas.github.io — branch master.
- Live game: https://lopappas.github.io/wonderful-summit/
- Read AGENTS.md for workflow and minimal deployment polling.
- Source: wonderful-summit/source/. Detailed game notes: its README.md.
- Commands from source: npm ci, npm test, npm run build.
- Publish the contents of source/dist-pages/ under wonderful-summit/.

## Current state
Tutorial 2.0 milestones 1–7 are complete: Fire/Nature/Water lessons, the goblin quality comparison, guaranteed Colorful Rock inspection and a final independent elemental-slime test. The main menu has one Tutorial entry opening Tutorial 2.0; the old tutorial has been removed.

Latest update (version 0.1.98): Added Goblin King as a per-run 50/50 alternative to Slime Mother at trail node 12. Selection is stored on startRun and reused on entry/rebuild; legacy runs without a choice retain Mother. King is a 35% larger neutral goblin with gold crown, 1000 HP, constant rock-slime speed, normal goblin timing and exact 34-damage attacks. Faint spell direct/tick/burn damage and knockback are zero, but Faint status effects remain allowed. All spell knockback is halved at competent quality; slowing loses 20 percentage points, clamped at zero. Freeze/root durations stay normal. Boss gold remains 54 and the trail name reflects the selected boss. Previous UI/colors/upgrades remain.

Existing tutorial guide remains One Last Thing! → Practice → Encyclopedia → Tips & Tricks → Tutorial Complete. Home help and spell rewards at victories 1, 5 and 9 remain.

Version 0.1.53 original colors, gentle cast rumble and ink dissolve remain.

Belladora has no protruding potions. Drawn ink remains 3.45 CSS pixels wide; opening version and potion rarity borders remain.

Settings → Version History remains below Audio and above Credits, with the shared summit window and newest releases first.

Version rules: small releases add 1; bigger releases advance to the next ten (0.1.40 → 0.1.50). Change the middle segment only at the user's request. Package versions remain npm-compatible; labels pad the release segment. npm run version:small / version:feature update both package files. Every release must add notes in src/versionHistory.ts; gameVersion tests guard history/version consistency.

Ending relic text remains black. Birkin-stock enlarges Belladora by 15% in combat and the merchant scene; her defeat frown persists.

Opening starter sigils remain removed; the checkmark fades in after the title-screen tap. Theodora's heading is “Choose a keepsake:”. Regular and lit Forgotten Campsite rest restores 60 health, capped at 100, consuming the single camp action.

Home action is “Play”. Theodora's run-opening dialogue retains the 15% slowdown from version 0.1.1; tutorial timing is unchanged. Shared spellbook subtitle, encyclopedia tab numbers and “Before you climb…” remain removed.

Tutorial header reads “Tutorial”; tutorial popup overlines no longer display “Tutorial 2.0”. Home shows the package.json version at the top left below the header. README documents the revised release numbering; 0.1.00 is the displayed starting baseline.
Validation for this update: all 531 tests pass; TypeScript and production build pass. Six new tests cover exact boss-selection split and persistence, neutral stats/speed, Faint direct/tick immunity and statuses, half knockback, flat slowing resistance, freeze potions, 34-damage attacks and boss rewards. Actual SVG scene rendered and inspected for King size, crown and labels; browser interactions remain unverified. Source and matching build are included together; deployment has not yet been verified.

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
- No remaining planned Tutorial 2.0 milestones. Await the next requested change.
- Historical Pages timeouts/queued retries are not evidence of a current outage. Check current status only when relevant, following AGENTS.md.
- Historical generated bundles remain in the published assets folder; cleanup has not been requested.

Replace stale information after significant work. Keep this a current handoff, not a conversation or commit log.
