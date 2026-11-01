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

Hold Spellbook for 3 seconds. Authorization is temporarily disabled for all players; grants apply locally to the current session. There is no account or API requirement in this build. Restore server-side identity checks before restricting access again.


## Encyclopedia

The home menu opens a single-page field journal with Spells, Relics, and Potions chapters, grouped by rarity. Entries use the live game definitions; developer-only spells are excluded. Spell entries include their current drawing shape and casting tips; relic and potion entries include effects and flavor text.

`ENCYCLOPEDIA_PREVIEW` in `src/encyclopedia.ts` currently reveals every entry because journey saving is not implemented. Session discovery tracking stays separate from inventory, so spending a potion or starting a new run does not erase a discovery. Once durable discovery storage exists, disable the preview flag to show question marks until collection. No encyclopedia data is persisted yet.

## Practice

Practice opens above Encyclopedia on the home menu. All spells (including Ender) are temporarily available with the usual drawing, ink, and refill rules. Patches is a neutral, non-attacking scarecrow who absorbs repeated casts. Movement is off by default; switching it on enables a safe patrol affected by normal slows, roots, stops, and knockback. Upgrade all toggles the standard maximum upgrade on eligible spells. Existing ongoing effects retain their normal combat behavior. Reset restores ink and clears casts, effects, and damage totals while retaining the movement and upgrade switches. Practice does not modify run progress. Damage totals include direct hits and damage over time.
