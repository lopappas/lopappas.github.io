# Wonderful Summit — Project Status

Updated: 2026-11-19

## Start here
- Repository: https://github.com/lopappas/lopappas.github.io — branch master.
- Live game: https://lopappas.github.io/wonderful-summit/
- Read AGENTS.md for workflow and minimal deployment polling.
- Source: wonderful-summit/source/. Detailed game notes: its README.md.
- Commands from source: npm ci, npm test, npm run build.
- Publish the contents of source/dist-pages/ under wonderful-summit/.

## Current state
Tutorial 2.0 milestones 1–7 are complete: Fire/Nature/Water lessons, the goblin quality comparison, guaranteed Colorful Rock inspection and a final independent elemental-slime test. The main menu has one Tutorial entry opening Tutorial 2.0; the old tutorial has been removed.

Latest update (version 0.3.57): Snowman and Snowman+ gain a flat 5 HP and last at all cast qualities until defeated, replaced, or the battle ends. Their base knockback ranges are 13–26 and 16–28. Scorchy and Scorchy+ share 2–4 base knockback and deal 18 and 20 base damage at 80% cast quality, firing every 1.2 and 1 second respectively. All 696 tests and the production build passed. Rendered checks covered Snowman's full-size persistence and health bars.

The selected Apprentice trace glows and reaches 150% saturation before easing back over 0.8 seconds. iPhone appearance is unverified.

Snowman and Scorchy hold their positions until Slime Mother's offspring appear, including Scorchy's hover height. Guardian projectiles leave Black Flash and its chain intact.

Snowman fires from 50 units with 13–26 base knockback. Snowman+ fires from 60 units with 16–28 base knockback. Scorchy fires from 40 units, or 50 when upgraded, and its fireballs ignite wooden shields. Flame Blade applies 30% of the standard knockback curve. Each eligible Flame Blade swing shares one Black Flash roll across its targets.

Scorchy is a Legendary Fire spell with the approved A1 pixel pumpkin and aligned S1 sigil. It floats and bobs, shows a health bar and a quiet mouth ember, and spits fire only while attacking. It can fight alongside Snowman with its own cooldown. The spell is available through the normal spell pool and has a Practice lesson and campsite upgrade.

A successful cast hides its indefinite Apprentice trace when the spell cooldown exceeds 10 seconds.

Snowman uses the approved C1 sprite with a short blue-banded hat, blue scarf, five separate coals, and thick branches. Its right branch flicks on launch. The sigil has two short strokes angled up and out from the upper sides of the body circle, and its tracing guide is 15% larger in combat and Practice. The center track aligns to Filadora's feet, with the other tracks 28 world units above and below.

Combat uses three fixed lanes with ground anchors at y=447, 475, and 503. Solo enemies start in the center and pairs use the outer tracks. Nearby same-lane health bars stack, enemies maintain at least 10 units between them, and faster enemies can overtake. Enemies in a compact group can attack without waiting for the front enemy to leave. Enemy names and HP numbers appear with Spell Details enabled. Reinforcements in Rockweb nest and Webbed ambush prefer open entrance lanes and enter on schedule. Both guardians are anchored to the center lane and can intercept enemies across all three lanes. Enemies engage the foremost guardian they have not passed.

At 80% cast quality, Snowman has 155 HP and 16 base Water damage per snowball, and Scorchy has 100 HP and 18 base Fire damage per fireball. The upgrades grant 185 HP and 17.6 base damage for Snowman+ and 120 HP and 20 base damage for Scorchy+ at 80% quality. Both summons inherit half the player's combined damage boost at cast time. Each has a 30-second cooldown and 250-unit travel limit. Both hold position and fire as soon as an enemy comes into their attack range. Snowman shoots every two seconds, and Scorchy shoots every 1.2 seconds, or every second when upgraded. Enemies hit guardians instantly on contact for 1.5× damage with a 1.5-second cooldown. The guardians stay in place when hit, and enemies can still take knockback. Faint Scorchy lasts 20 seconds and fades over the final three. All Snowman casts and stronger Scorchy casts last until the guardian falls, is recast, or combat ends.

The developer panel's Spell details toggle sits beside Grant all spells. When enabled, an ambiguous fizzle briefly shows every known spell within the seven-point recognition margin. The toggle starts off on page load.

Version 0.3.5: Cooldowns now appear at the canvas bottom-left in their existing badge style. New starts enter on the left and earlier cooldowns move right; wrapping preserves visibility. Full automated tests and production build pass in GitHub Actions. Phone review remains outstanding.

Version 0.3.4: In ordinary run combat, opening Spells now dismisses the selected trace via the existing fade without resetting its Expert cooldown. Clear Ink is unmounted while the picker is open. A small Hide trace action appears at the canvas top left only while a guide is active and the picker is closed; it is disabled during pause/end states. Hide trace has been removed from the picker and its props. Ink and mode rules are unchanged.

Version 0.3.3 (displayed 0.3.03): The combat picker remains positioned over the canvas, now with a transparent surface exposing the existing paper/ink. Removed its visible Spells heading and Apprentice guide hint. Close uses a centered SVG cross. Menu shapes use stroke width 4.8 (+20%); menu labels are 15% larger in both three/four-column layouts at weight 500. Guide selection no longer toggles the ordinary combat frame's guide-visible fill; the paper's existing outer edge and single inner rule remain. Mode buttons and labels grow 15% from 0.3.02, preserving equal size, vertical centering/lower position, approved colors and fades. Trace stroke width, scales and cooldowns are unchanged.

Version 0.3.2 (displayed 0.3.02): Puddle Guard trace scale is 1.4. Combat spell choices are transparent and borderless over the canvas paper, arranged in independent Water/Fire/Nature columns with each starter at the top; an Ancient column is added only for owned Ancient spells. Four columns use slightly smaller thumbnails/type. Apprentice/Expert buttons and text shrink 30% from 0.2.99 sizing, maintaining equal dimensions, approved colors, vertical layout and the lower screen position. Home mode choices now start at opacity zero and transition in over 320 ms after the home buttons' 180 ms fade; focus/interaction enables after completion. Reveal callbacks cancel on unmount; reduced motion skips delays.

Version 0.3.1 (displayed 0.3.01): Combat Spells now renders inside the spell canvas as a scrollable three-column grid with centered small/medium sigils and names. Owned starters form the first row (Water/Fire/Nature); remaining owned spells follow Water/Fire/Nature/Ancient order. Combat traces use 180 ms opacity entry/exit and retain exiting artwork briefly, with cancellation on replacement/unmount. Guide stroke width is 4.4 (+10%); visual guide sizes multiply the previous sizing by 1.15 for Bog/Chronos/Firestorm/Flame Blade, 1.5 for Thistle Bush and 1.4 for Torrent. Recognition, ink and gameplay geometry are unchanged. Apprentice/Expert trace deadlines and cooldowns are unchanged.

Version 0.3.0 (displayed 0.3.00): Apprentice is playable and recommended for new players; both modes remain unrestricted. Mode lives on the run, defaults old runs to Expert and persists across encounters. In ordinary run combat, Spells replaces the nearby Spellbook with a quick owned-sigil/name table in elemental colors. Apprentice guides persist through casts/refills until changed/hidden; Expert gets 2 active battle seconds then 10 seconds cooldown. Both use battle time; no new loop. Apprentice contact recoil is 1.5x existing adjusted recoil, capped at the runway end; damage and spell knockback are unchanged. Book Worm now gives +3% spell damage per distinct non-starter spell in both modes; old timing benefits are removed. Other screens and Tutorial/Practice learning keep their book UI. See source/docs/apprentice-mode.md for implemented design, phone checks and proposed next steps.

Version 0.2.99: Both mode labels use 22.8 CSS px text (14% above the former 20 px Expert size). Buttons also grow 14% to 250.8 × 59.28 CSS px, constrained on narrow viewports; both retain matching dimensions, reset letter margins and the approved colors. The complete Apprentice/Expert/Back group moves from viewport center at 50% to 70% height, maintaining its vertical stack. Mode behavior is unchanged.

Version 0.2.98: Apprentice and Expert are centered in one vertical column, each 220 CSS px wide (viewport-constrained) and 52 px high. Apprentice uses 18 px lettering and Expert 20 px. All nested letter span margins are reset so the generic home-button span spacing cannot push the animated text outside the buttons. Colors remain #243c2f / #788d77; the smaller gray Back stays underneath. The title shifts upward on short screens to clear the taller selection. Gameplay and mode actions are unchanged.

Version 0.2.97: Apprentice and Expert buttons now use background #243c2f and border #788d77. Both occupy equal minmax(0,1fr) columns at 100% cell width, preserving the existing centered row width. Mode actions, grade lettering and Back are unchanged.

Version 0.2.96: Play opens a mode selection on the home background. Bottom home buttons fade out and become inert; centered side-by-side Apprentice/Expert buttons fade in. Both reuse the Play button style with existing Beautiful/Wonderful grade lettering respectively. Apprentice shows Coming soon and does not start a run. Expert follows the existing selectMode(new) keepsake/adventure flow. A smaller gray Back button (or Escape) restores home actions and Play focus. Reduced motion removes fades. No Apprentice gameplay has been added.

Version 0.2.95: Restored the previous casting glow (24 px charge-track glow and 5 px paper drop shadow). The simpler idle frame shadow remains. Firestorm clouds now use unsampled battle time for full-rate entrance, bobbing and fade; a separate memoized rain layer retains 30 Hz particle motion. No gameplay, damage, timer or input changes.

Version 0.2.94: Requested rendering follow-ups 1–3 implemented. Paper uses a conventional shadow and the charge-track border glow instead of filters over the paper. Enemy labels/health/status/warning and target artwork are memoized using primitive display props, preserving all actual health values and crown offsets. Firestorm, Bog and burn decoration use battle-clock 30 Hz memoized frames; fixed particle metadata/art is reused. Torrent falling motion remains full rate, with only splashes sampled at 30 Hz. Presence/rain onset/recasts/status removal and splash impact/expiry still follow normal state updates. No extra timers or gameplay/audio/resolution changes. The latest supplied 0.2.93 iPhone baseline is saved: device ratio 3 / ink ratio 2, 59.785 updates/s, 17 ms p95, 53 ms max, 60.236 battlefield and 4.287 control commits/s over 77.445 active seconds. User reports improved responsiveness; heat benefit is unmeasured.

Version 0.2.93: Performance milestone 7 implemented. All player-drawn ink canvases cap backing resolution at pixel ratio 2 while lower-density devices retain native resolution. Backing sizing and paint transforms share the same policy. CSS size/line width, pointer/recognition geometry, saved drawings and cast/fade timing remain unchanged. At device ratio 3 this uses about 56% fewer ink backing pixels, not 56% less total game work. Performance reports retain native pixelRatio and add inkCanvasPixelRatio. The supplied 0.2.92 baseline is saved in source/docs/performance-baseline-0.2.92-iphone.json: 59.988 updates/s, 17 ms p95, 29 ms max, 60.154 battlefield and 3.545 control commits/s over 73.628 active seconds. Phone visual quality and heat benefit remain to be measured.

Version 0.2.92: Performance milestone 6 implemented. Recognition normalizes, samples and measures reference sigils/variants once at module load. Bounds, stroke-length and nearest-neighbor loops reduce temporary allocations while retaining Math.hypot, accumulation order, candidate ties, accuracy bonuses and acceptance rules. Recognition still runs once at charge start and once at completion. An independent frozen 0.2.91 scorer verifies exact candidate/error/score/decision parity. Local Node benchmark across 150 alternating attempts per scorer measured 19.455 ms legacy versus 12.507 ms cached mean (about 36% lower); this is not a phone heat or timing measurement. The supplied 0.2.91 iPhone baseline is saved in source/docs/performance-baseline-0.2.91-iphone.json: 59.982 updates/s, 60.161 battlefield and 3.426 control commits/s over 88.147 active seconds, versus 31.048 control commits/s in the previous report. Canvas pixel ratio remains unchanged until milestone 7.

Version 0.2.91: Performance milestone 5 implemented. Combat ink meter and charge frame/track subscribe independently; Combat updates only for ink eligibility bands and held/not-held transitions rather than all progress changes. Shared ink rendering caches native paths and bounds under the existing append/replace stroke model, preserving the 210 ms fade and recognition points. Canvas rectangles are cached until resize/scroll/viewport invalidation or pointer-down refresh. Dialogue positioning reacts to coalesced layout events and follows only active anchor animations, with hidden/cleanup cancellation. Pixel ratio, recognition rules, timing and ink use remain unchanged. The supplied 0.2.90 report is saved in source/docs/performance-baseline-0.2.90-iphone.json: 59.982 updates/s, 60.298 battlefield and 31.048 control commits/s, 6 character-art commits over 60.068 active seconds. Device heat/rendering benefit remains to be measured.

Version 0.2.90: Performance milestone 4 implemented. CharacterBodies memoizes unchanged Fila, slime/rocky/mother, goblin, helmet, crown and spider body geometry independently of movement, health/status UI, attack effects and crown transforms. Spider legs retain their walking clock; stationary spiders ignore clock-only changes. Belladora is memoized by expression/size. Opt-in reports add artCommits and artCommitsPerActiveSecond, summing cached character component commits. The new 0.2.82 iPhone baseline is saved in source/docs/performance-baseline-0.2.82-iphone.json (59.749 updates/s, 60.024 battlefield and 27.960 control commits/s, 18 ms p95, 39 ms max over 60.909 active seconds). Frame rate, visuals, balance and canvas pixel ratio remain unchanged. Heat benefit requires a new physical-device comparison.

Version 0.2.82: Removed Battery Saver, its rendering throttle and report flag. Battlefield snapshots publish at the normal simulation cadence. Settings now has a non-opening Game Settings placeholder above Audio. SettingsButton accepts a combat presentation flag: combat/practice/tutorial combat use a pause glyph and accessible pause/settings label, while other screens retain the cog.

Version 0.2.81: Chronos now projects one shared circle-and-hand sigil near the top center of the battlefield. The upright radial hand rotates clockwise once over the remaining active field duration; recasts and bottles restart it toward the longest remaining expiry. It follows battle time, pauses with combat and disappears at expiry or combat end. Removed the per-enemy pale-blue tint, small clock markers and short cast ring. No extra animation loop or gameplay change.

Version 0.2.80: Performance milestone 3 implemented. Chronos uses fixed pale-blue treatment, static clock markers and a brief ring instead of continuous grayscale conversion. Combat pointer painting/ink display is batched per frame; charging uses one animation driver. Ambient sound deadlines renew at most every 150 ms and volume targets update on change, retaining immediate stop/disconnect safety. Settings has optional Battery Saver (off on page load), sampling battlefield publication at 30 Hz while simulation/drawing retain normal cadence; input actions and terminal states publish immediately. Reports include the mode flag. The supplied 0.2.70 comparison (59.809 updates/s, 27.308 control commits/s, 60.216 battlefield commits/s) is documented. Heat improvement remains unmeasured; repeat phone captures with Saver off/on and a separate Chronos-heavy session.

Version 0.2.70: Performance milestone 2 implemented. BattlePresentation publishes live snapshots directly to AnimatedWorld while the Combat/control state changes only for displayed UI values (health, potions/bottles, relic states, practice statuses, transient message expiry and cooldown/effect tenths). Simulation and actions still use the current battleRef. StaticScenery memoizes the unchanged SVG definitions/background and retains Chronos color transitions; no frame cap or balance changes. Reports retain the original Combat commit fields and add independent battlefield commits. The supplied 0.2.60 iPhone baseline is preserved in source/docs/performance-baseline-iphone.json (59.874 updates/s, 17 ms p95, 0.04833 ms simulation, 61.078 Combat commits/s over 56.78 active seconds). Repeat the ordinary-combat phone capture on 0.2.70 to measure the result; no temperature/power improvement is claimed yet.

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
Validation for this update: all 646 tests and TypeScript/production build passed in GitHub Actions run 43977581732. New badge checks cover targeted feedback, unchanged queue/countdowns, repeated cue restart and completion tokens. Matching production assets and version 0.3.6 release notes are included. The temporary workflow was removed after success. Phone border-highlight appearance remains unverified; deployment is checked once after merge.

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
- Tutorial 2.0 is complete. Performance milestones 1–7 are implemented. Battery Saver remains removed. Rendering follow-ups 1–3 are also implemented. Compare 0.2.94 ordinary combat and persistent-spell-heavy rendering/heat against the saved 0.2.93 baseline. Restored casting glow, full-rate clouds and decorative 30 Hz rain need phone review. Scenery layer separation and selective first-use sound preparation remain optional profiling-led suggestions, not scheduled changes.
- Historical Pages timeouts/queued retries are not evidence of a current outage. Check current status only when relevant, following AGENTS.md.
- Historical generated bundles remain in the published assets folder; cleanup has not been requested.

Replace stale information after significant work. Keep this a current handoff, not a conversation or commit log.
