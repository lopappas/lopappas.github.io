# Wonderful Summit

Portrait mobile spell-painting roguelite.

## Run and build

Use Node.js 22.13 or newer.

```sh
npm ci
npm run dev
npm test
npm run build
```

The static build is written to `dist-pages/`. Copy its contents into the parent `wonderful-summit/` folder to update the hosted game. Relative asset URLs support subfolder hosting.

## Rarity balance

Uncommon spells cost 40 gold and Legendary spells cost 60. Spell rewards and merchant spell slots use 90:10 Uncommon/Legendary tier weights. Elite relic drops and merchant relic slots use 60:30:10 Common/Uncommon/Rare tier weights, with prices of 45/60/75 gold. Each tier shares its weight equally among eligible items; missing tiers redistribute their weight proportionally. Offers exclude owned spells, prefer unowned relics, and never repeat an item within the same selection. Theodora's Keepsakes stay outside merchant and reward pools.

## Developer panel

Hold Spellbook for 1.5 seconds. Authorization is temporarily disabled for all players; grants apply locally to the current session. There is no account or API requirement in this build. Restore server-side identity checks before restricting access again.


## Encyclopedia

The home menu opens a single-page field journal with Spells, Relics, and Potions chapters, grouped by rarity. Entries use the live game definitions; developer-only spells are excluded. Spell entries include their current drawing shape and casting tips; relic and potion entries include effects and flavor text.

`ENCYCLOPEDIA_PREVIEW` in `src/encyclopedia.ts` currently reveals every entry because journey saving is not implemented. Session discovery tracking stays separate from inventory, so spending a potion or starting a new run does not erase a discovery. Once durable discovery storage exists, disable the preview flag to show question marks until collection. No encyclopedia data is persisted yet.

## Practice

Practice opens above Encyclopedia on the home menu. All spells (including Ender) are temporarily available. Infinite ink defaults to on; turn it off to use normal ink and refill rules. The neutral golden slime absorbs repeated casts without attacking. Movement is off by default; switching it on enables a safe patrol affected by normal slows, roots, stops, and knockback. Upgrade all toggles the standard maximum upgrade on eligible spells. Existing ongoing effects retain their normal combat behavior. Reset restores ink and clears casts, effects, and damage totals while retaining the movement, upgrade, and ink switches. Practice does not modify run progress. Damage totals include direct hits and damage over time.

## Casting relics

Forgiving Calculus (Rare) adds 3 percentage points of accuracy, capped at 100%, with a gold segment at the end of the quality bar. Recognition retains its normal ambiguity checks. Best drawings retain raw accuracy, excluding relic boosts. Perfected Spheredust (transformation only, outside loot and shops) makes the first fizzle each combat deal a flat 10 damage to every present enemy and apply 25 units of knockback. 7 leaf clover (Common) readies after six consecutive Steady-or-better drawn spells. The next attempt gains 7 accuracy points even if it would otherwise be Faint or fizzle, and consumes the bonus. Faint casts and fizzles reset unarmed progress; a fresh six-cast streak is needed after each boosted attempt. Bottled spells leave progress untouched. Filadora’s robes (Starter) grant +2% damage per distinct raw Wonderful spell for the current run. Artisan robes (Rare) replace them and raise every earned and future bonus to +4%. Other combat counters reset between combats. Bottled spells receive Calculus and can qualify for Artisan robes, but do not consume a drawn-spell streak.

Stellar potion is a Common green-liquid bottle. Its non-stacking +10 accuracy points apply only to the next drawn casting attempt, including a fizzle, and do not change raw best-drawing scores or affect bottled spells. True Wonderful achievements appear as green diamond superscripts after the complete spell name. Tap the equipped robes to see the total damage bonus.

Perfected Sphere is a Rare relic granting 15% spell damage. Its hidden fizzle outcome must stay out of player-facing descriptions and lore. Shattering during combat replaces it with a single Perfected Spheredust, immediately deals 25 flat damage to present enemies with strong knockback, flashes grayscale for 0.2 seconds, and plays an original synthesized retro fracture effect. Outside combat it transforms without combat damage. Normal shops, elite rewards, developer grants, and transformation enforce unique relic IDs. Sphere cannot be reacquired while Stardust is owned.

Run and act ending screens show best and worst drawings side by side, best on the left. Both use original strokes and raw accuracy; the worst excludes fizzles and keeps the earliest drawing on ties. The records include battle, bottled, and event casts, survive encounters, and reset on a new run.

Drawn casts track an encounter-local spell streak. The fourth and later consecutive casts of the same spell snapshot a 0.75 damage and knockback multiplier, including burns and ground effects. A different successful drawn spell resets the streak; fizzles and bottled spells leave it intact. Bottled spells always bypass this penalty.

Chronos Denalis freezes at every successful quality, including Faint against rocky enemies, retaining all prior duration endpoints and upgrade scaling. Its 20-second cooldown starts at launch and advances only with combat time. A blocked attempt preserves the drawing and all cast bonuses; the canvas displays an italic cooldown message. Active spell cooldowns appear beneath player health. Bottled Chronos ignores and does not change the cooldown.

Slime Mother retains the killing spell’s knockback during her death animation. The split and offspring location follow her final pushed position.

Theodora’s Coinpurse is a keepsake granting 80 gold once upon collection. Untouched Box grants two unowned normal relics, with existing rarity weights and normal duplicate and starter restrictions; an Artisan robes gift performs its normal takeover. Madora’s Earring grants 5% spell damage. The ink keepsake is now named Giant Inkwell. Stale drawn casts briefly gray only their casting paper and show a fading stale label. Cooldown labels use the spell sigil, the word cooldown, and remaining seconds. Calculus gold and green segments share a flush edge within the quality track.

New runs draw three distinct keepsake offers uniformly without replacement; the offers remain fixed until another run starts. Every keepsake has a 3/5 chance to appear in the current five-item pool. Only offered keepsakes may be selected. Perfected Spheredust uses a circular cluster of individual dots in all relic displays. Stale feedback is labeled “Stale”, lasts 0.975 seconds independently of the cast animation, and uses 30px text. The Calculus gold segment stays flush on the left and has a rounded cap on the right.

Dewdrop, Hearthspark and Little Sprout interpolate base damage within each quality tier: Faint 7–11, Steady 17–22, Beautiful 26–31, Wonderful 36–52. Their upgrades add 25% with normal integer rounding. Other spells and knockback retain their previous curves. The shape-quality bar uses the normal rounded fill without Calculus; equipping Calculus instantly enables flush segments and a gold right cap, including a decorative cap when the actual accuracy gain is zero.

Moss Locket heals 10 health after each victory, capped at 100. Firestorm, Drudge Bog and Tidalcrest cost 50 gold at either merchant. Stellar’s player-facing description reads: “Your next cast gains 10% spell quality. Does not stack with other stellar potions.” Its consumption and non-stacking behavior are unchanged.

Spell rewards occur every third combat victory and offer two distinct unlearned spells (or fewer if the collection is nearly complete). Regular battles begin with a player-controlled review: large spell symbols and names in stable spellbook element groups. Newly learned spells get a subtle highlight until acknowledged with Ready. The review stays open indefinitely; Ready dismisses it immediately and starts combat. Battle time, input and enemy countdowns remain paused until then. Tutorial and practice retain their existing entry flows.

Pre-battle review hides visible element headings while retaining grouped spell positions and accessible group labels. Tapping a spell immediately opens a compact description dialog using the live spell description. Close it with its 44px close target, an outside click, or Escape; focus returns to the inspected spell. The underlying review is inert during inspection, and outside dismissal never starts combat. Ready remains the only way to begin combat.



## Tutorial 2.0 — milestone 5

The menu offers a separate **Tutorial 2.0 preview**, while **The old tutorial** remains available until the final cleanup milestone. The preview now runs the complete fire-slime lesson: village dialogue → spellbook → explicit Dewdrop selection → Ready → 4.5-second counterclockwise brush demonstration → draw over a persistent guide → hold Cast → impact → victory dialogue.

The Fire slime has 24 HP and cannot approach or attack. No relics or upgrades modify damage. A 60% Steady Dewdrop defeats it in one hit; Faint casts cannot. Wrong spells, fizzles, and insufficient hits reset the enemy, drawing and ink. Optional **Show me again** replays the demonstration; ordinary retries restore only the static guide. Player ink renders above the guide. Drawing and clearing stay available while preparing to cast; early release never advances the lesson.

The explicit sequence, token-checked callbacks, control restrictions, highlights and pause/resume foundation remain shared. The brush pauses while the tutorial is paused or the page is hidden. Cast results are acknowledged after projectile impact, and stale outcomes cannot complete another attempt.

Direct preview: `https://lopappas.github.io/wonderful-summit/?tutorial=2`. Exit returns to the menu; reloading this link starts a fresh lesson.

Next: verification, then removal of the old tutorial in its planned cleanup milestone. No old tutorial code or exclusive tests have been removed.

Fila dialogue in Tutorial 2.0 always uses a canvas-textured bubble above and to her right, without a spotlight or dark backdrop. Each line types at 48 ms per character, with an additional 500 ms pause after every period or exclamation mark, then stays for 2.2 seconds before automatically advancing. Pause and hidden-page time freeze both typing and the reading delay. Future dialogue steps inherit this presentation. The cast instruction reads **Hold Cast!**. Fila’s dialogue uses the bundled Kurale storybook font (SIL Open Font License).

Fila bubbles use compact padding and line spacing, positioned further above Fila. All Tutorial 2.0 dialogue and instruction text colors complete element and spell names from the live spell catalog; typewriter fragments retain the color of the full term.

Milestone 3 continues directly into a 24 HP Nature slime, spilled-ink clearing lesson and 4-second counterclockwise Hearthspark demonstration. Next, a Water slime spawns at contact range and lands one real attack. Belladora arrives smiling from the left for the tap-to-heal lesson; the tutorial waits for actual potion healing. Ink is set empty for the refill lesson, which waits for completion and pauses its timer with the tutorial. Little Sprout is demonstrated over 5 seconds: left top branch through the V, then from the V’s corner down the stem, without a connecting line. Each lesson retains a static guide, optional replay and fresh retry against its own slime. The preview continues from the water victory dialogue into milestone 4.

Tutorial pacing refinements: spilled ink appears when “Whoops!” is typed; the Nature victory is followed by 1.5 seconds before the Water slime appears, and its hit is followed by 1.5 seconds before dialogue. Belladora enters for one second, followed by 1.5 seconds before the potion highlight. Little Sprout drawing/casting stays undimmed with no cast message; after six active seconds a button-only reminder appears. Spotlights now use 35% dimming. Term colors include adjacent periods/exclamation marks and slime nameplates include their elements.

Elemental slime phrases are fully colored (including “slime” and adjacent punctuation). Tutorial 2.0 suppresses the normal victory popup. The spill line is “Whoops! I spilled my inkwell…”. The Water slime waits 1.5 seconds on screen before attacking. Pressing the health potion starts a 1.8-second pause before the refill dialogue; its flight and healing run during that pause.

Fila’s text reveals with a gentle 220 ms fade per character and no insertion cursor, preserving typing speed and punctuation pauses. Little Sprout’s demonstration takes 4 seconds. Instruction popups omit final periods. The inkwell spill plays the potion bottle sound. Casts below 60% in any elemental lesson show a one-second, pause-safe “Try again” notice before restoring the static-guide drawing step.

All Tutorial 2.0 victory quips are followed by a two-second pause before advancing. New tutorial enemies slide in from the right over 800 ms; the Water slime instead fades in over 800 ms at contact range, then waits its existing 1.5 seconds before attacking. Enemy entry animations freeze when the tutorial is paused.

Casting demonstrations are labeled “<spell> casting tutorial”; drawing prompts say “Try to draw your own <spell>!”. Spilling the inkwell empties ink to zero. To keep the lesson playable, the refill lesson now follows clearing the spill, before Hearthspark; the Water lesson continues from healing to Little Sprout without a second forced emptying.

Milestone 4 adds a stationary 58 HP non-elemental goblin. The nephew’s visibly wobbly triangle scores exactly 48% in the real recognizer and deals 6.5 damage; the perfect triangle is drawn in three seconds, scores 100%, and deals the remaining 51.5. Scripted casts use the normal hold-to-cast and projectile damage path. After the five quality explanations (with “weak” emphasized), the relic explanation awards Colorful Rock, pauses 1.5 seconds, and requires opening its real effect panel. “Tap anywhere to continue” consumes its dismissal click and ends this milestone preview; the final slime combat remains milestone 5.

Focused milestone 4 review: `https://lopappas.github.io/wonderful-summit/?tutorial=2&milestone=4`. The regular preview still starts with the Fire slime and continues through all four lessons.

Dialogue pacing update: the Fire slime arrives for 800 ms, then waits 1.5 seconds before Filadora speaks. All player dialogue uses a shared 1.8-second reading hold with an unadvertised tap-to-continue during that hold. Kurale is loaded before starting the tutorial (with a stable Georgia fallback on failure); the speaker name is bold Filadora. Goblin defeat has its own 1.8-second pause. Quality explanation labels use the game’s grade styling, with weak/average/amazing/the best emphasized. The relic screen is replaced by “The goblin dropped a relic. Neat!”, then immediate inspection guidance after that dialogue. Casting titles now read “Tutorial: How to draw <spell>”.

Milestone 5 continues from Colorful Rock inspection into a normal, full-health elemental slime chosen once per tutorial. It slides in from the right (including Water), then the final battle reminder waits for Continue. Combat allows free drawing, clearing, spellbook selection, casting, refilling and healing with no forced guides or spotlights. Filadora starts this fight with 100 health, 100 ink, one health potion and Colorful Rock. A defeat offers Retry final battle, restoring those resources and the same slime without repeating earlier lessons. A real victory waits 1.8 active seconds, then shows Tutorial complete and Return to menu. Pause and hidden-page behavior apply throughout. Focused review: `https://lopappas.github.io/wonderful-summit/?tutorial=2&milestone=5`. The initial Fire slime now waits 1 second after its 800 ms slide before Filadora speaks.

Tutorial pacing polish: the opening Fire slime's post-entry wait is 600 ms. Player dialogue types 15% faster (48/1.15 ms per character), preserving punctuation and reading holds. The nephew's complete 48% triangle appears instantly and permits casting without a prompt or spotlight; the perfect triangle still draws over three seconds. Faint labels use pale white text with a dark readability shadow. Relic inspection says “Tap relic to inspect its magical effects”; its effect panel appears immediately, followed after one active second by “Tap anywhere to continue” centered on the spell canvas. The final introduction is titled “Your Final Test”.

Filadora's completed dialogue now shows a small white “Tap to continue” hint below her bubble during the existing skippable reading hold. Completing the Nature lesson's ink refill leads to “Ok, back to taking down this nature slime.” The Water potion's recovery delay leads to “Much better. You’ll pay for this water slime!” before the spellbook lesson. “Non-elemental” uses dark gray in dialogue, including partially typed text.

Filadora dialogue now waits indefinitely for a tap after its final letters fade in. “Tap to continue” and its fullscreen tap target remain available until acknowledged, disappear immediately on acknowledgement, and are unavailable while typing or paused. A single tap advances only one dialogue; timed scene delays still use their existing timing.

Settings now includes Credits below Audio, over the iconic summit artwork. Tap anywhere (or press Escape) to return to Settings. Credits include Lorenzo Pappas, Frostnox's Quick Pencil Writing 1 (https://freesound.org/s/796659/, Attribution 4.0), Slay the Spire, Witch Hat Atelier and Made with Codex. The supplied original Ogg lives under src/audio; Filadora's lettering plays it softly through Master/Sound effects volume, stopping during punctuation pauses, after typing, on pause, when hidden and on unmount.
