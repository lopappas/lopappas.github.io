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
