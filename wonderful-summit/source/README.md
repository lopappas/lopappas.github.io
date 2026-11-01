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

Forgiving Calculus (Rare) adds 3 percentage points of accuracy, capped at 100%, with a gold segment at the end of the quality bar. Recognition retains its normal ambiguity checks. Best drawings retain raw accuracy, excluding relic boosts. Perfected Spheredust (transformation only, outside loot and shops) makes the first fizzle each combat deal a flat 10 damage to every present enemy and apply 25 units of knockback. 7 leaf clover (Common) readies a green canvas glow after six consecutive successful casts; the seventh gains 7 accuracy points. The cycle repeats, and a fizzle resets the streak. Filadora’s robes (Starter) grant +2% damage per distinct raw Wonderful spell for the current run. Artisan robes (Rare) replace them and raise every earned and future bonus to +4%. Other combat counters reset between combats. Bottled spells receive Calculus and can qualify for Artisan robes, but do not consume a drawn-spell streak.

Stellar potion is a Common green-liquid bottle. Its non-stacking +10 accuracy points apply only to the next drawn casting attempt, including a fizzle, and do not change raw best-drawing scores or affect bottled spells. True Wonderful achievements appear as green diamond superscripts after the complete spell name. Tap the equipped robes to see the total damage bonus.

Perfected Sphere is a Rare relic granting 15% spell damage. Its hidden fizzle outcome must stay out of player-facing descriptions and lore. Shattering during combat replaces it with a single Perfected Spheredust, immediately deals 25 flat damage to present enemies with strong knockback, flashes grayscale for 0.2 seconds, and plays an original synthesized retro fracture effect. Outside combat it transforms without combat damage. Normal shops, elite rewards, developer grants, and transformation enforce unique relic IDs. Sphere cannot be reacquired while Stardust is owned.

Run and act ending screens show best and worst drawings side by side, best on the left. Both use original strokes and raw accuracy; the worst excludes fizzles and keeps the earliest drawing on ties. The records include battle, bottled, and event casts, survive encounters, and reset on a new run.

Drawn casts track an encounter-local spell streak. The third and later consecutive casts of the same spell snapshot a 0.75 damage and knockback multiplier, including burns and ground effects. A different successful drawn spell resets the streak; fizzles and bottled spells leave it intact. Bottled spells always bypass this penalty.

Chronos Denalis freezes at every successful quality, including Faint against rocky enemies, retaining all prior duration endpoints and upgrade scaling. Its 20-second cooldown starts at launch and advances only with combat time. A blocked attempt preserves the drawing and all cast bonuses; the canvas displays an italic cooldown message. Active spell cooldowns appear beneath player health. Bottled Chronos ignores and does not change the cooldown.

Slime Mother retains the killing spell’s knockback during her death animation. The split and offspring location follow her final pushed position.

Theodara’s Coinpurse is a keepsake granting 100 gold once upon collection. Untouched Box grants one unowned normal relic, with existing rarity weights and normal duplicate and starter restrictions; an Artisan robes gift performs its normal takeover. Madora’s Earring grants 5% spell damage. The ink keepsake is now named Giant Inkwell. Stale drawn casts briefly gray only their casting paper and show a fading stale label. Cooldown labels use the spell sigil, the word cooldown, and remaining seconds. Calculus gold and green segments share a flush edge within the quality track.

New runs draw three distinct keepsake offers uniformly without replacement; the offers remain fixed until another run starts. Every keepsake has a 3/5 chance to appear in the current five-item pool. Only offered keepsakes may be selected. Perfected Spheredust uses a circular cluster of individual dots in all relic displays. Stale feedback is labeled “Stale”, lasts 0.975 seconds independently of the cast animation, and uses 30px text. The Calculus gold segment stays flush on the left and has a rounded cap on the right.

Dewdrop, Hearthspark and Little Sprout interpolate base damage within each quality tier: Faint 7–11, Steady 17–22, Beautiful 26–31, Wonderful 36–52. Their upgrades add 25% with normal integer rounding. Other spells and knockback retain their previous curves. The shape-quality bar uses the normal rounded fill without Calculus; equipping Calculus instantly enables flush segments and a gold right cap, including a decorative cap when the actual accuracy gain is zero.
