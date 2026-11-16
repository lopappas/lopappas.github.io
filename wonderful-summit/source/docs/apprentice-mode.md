# Apprentice mode — 0.3.0

Implemented in three steps:

1. **Mode identity and entry.** Both home choices are open to everyone. Apprentice is recommended for new players; both choices enter the same keepsake selection, trail and encounters. An optional run playMode field defaults legacy runs to Expert. Mode survives rewards, shops and encounters; returning to a fresh menu clears it.
2. **Touch-first combat guides.** The Spells button occupies the former combat Spellbook location. Its quick table shows only owned spell shapes and names, in their elemental colors. Tap once to select a faint, non-interactive SVG reference behind the ink. Apprentice references remain through casts/refills, can be changed without limit and have a Hide trace action. Expert references last two active battle seconds, then require ten more active seconds before another selection. Pause/hidden time is excluded. Hiding, reopening or changing table views cannot bypass cooldown. No guide points enter the drawing or recognizer. No extra frame loop or permanent timer was added; only visibility/readiness transitions update the surrounding controls. Other screens retain Spellbook. Tutorial and Practice retain the existing learning book for their scripted lessons and Learn controls.
3. **Recovery space and Book Worm.** Apprentice scales contact-triggered enemy recoil by 1.5, after existing first-hit, rejection, relic and shield modifiers and before the existing runway cap. Damage, incoming attack timing and spell knockback are unchanged. Book Worm replaces its old timing ability with +3% spell damage per distinct owned non-starter spell. Its multiplier stacks with the existing damage factors in both modes and updates as spells are acquired.

The expert guide policy is fixed at 2 + 10 active seconds; Book Worm does not alter it. New mode and trace state are not a save system. No mid-run mode switch or additional balance adjustment was added.

Validation: run mode/reward/reset isolation, trace expiration/cooldown boundaries and pause-compatible clocks, acquired-spell filtering, guide hiding, contact recoil/caps and Book Worm scaling have regression tests. Full suite and production build are required for this release. Browser preview relay is unavailable; phone checks remain outstanding: select each mode, select/change/hide a trace, cast/refill without losing the Apprentice trace, pause through an Expert trace/cooldown, inspect the quick table with many spells, and compare recoil with/without Book Worm/Glass Bell/Gravity Needle.

## Suggested next design steps (not implemented)

- Add an optional start dot and stroke-direction arrows to guides, especially for multi-stroke sigils.
- Add Undo last stroke alongside clear-all, reducing accidental loss of a nearly complete drawing.
- Offer a short failed-cast hint based on an actual recognition failure reason, without inventing an explanation for ambiguous results.
- Offer an Apprentice encounter retry that restores the entry snapshot instead of restarting the entire run; define reward/randomness rules before implementing.
- Consider an optional pause while the quick spell table is open, giving players time to choose without pressure.
- Consider a tap-to-start/tap-to-release cast alternative for players who struggle with prolonged holds.

Retry/progress preservation and adjustable input/difficulty assistance are consistent with Microsoft’s Xbox Accessibility Guidelines: https://learn.microsoft.com/en-us/gaming/accessibility/xbox-accessibility-guidelines/108 and https://learn.microsoft.com/en-us/windows/uwp/gaming/accessibility-for-games . These are design references, not evidence that the proposed changes have been playtested in Wonderful Summit.
