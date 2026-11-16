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


## 0.3.1 visual update

The combat picker now overlays only the drawing canvas, with three centered cells per row and scrolling for larger collections. Starter Water/Fire/Nature spells come first, then the remaining owned spells are grouped Water/Fire/Nature/Ancient. No unearned Ancient spells appear. The header provides close and Hide trace controls; the remaining battle remains visible.

Guides fade in and out over 180 ms using opacity transitions; exiting artwork remains mounted briefly, and replacements fade the prior guide before entering the next. Timers and scheduled entry frames are cancelled on replacement/unmount. This is presentation time, independent of the unchanged active battle-time guide/cooldown rules. Guide-only stroke width increases from 4 to 4.4. Relative guide dimensions increase by 15% for Bog/Chronos/Firestorm/Flame Blade, 50% for Thistle Bush and 40% for Torrent. Menu thumbnails, recognition points and drawn ink are not scaled. Phone checks should include short canvases, long spell collections, rapid guide changes and hiding/expiry during a fade.


## 0.3.2 picker and home refinements

The canvas picker now has independent Water, Fire and Nature columns, preserving starter-first order inside each. A fourth Ancient column appears only when such spells are owned. Cells use transparent backgrounds and no border, retaining keyboard focus outlines and elemental colors. Puddle Guard joins Torrent at 1.4× original guide size. Mode buttons and their labels shrink 30%; the original colors, equal sizes and lower vertical stack remain. Mode-choice opacity is now controlled by mounted state instead of an entry keyframe, with the initial transparent frame, home fade, mode fade and focus timing explicitly sequenced and cancelled on unmount.


## 0.3.3 canvas overlay refinements

The picker surface is transparent over the existing drawing canvas. Its visible Spells title and Apprentice guide hint are removed; cooldown guidance remains. The close button uses a geometrically centered SVG cross. Menu-only glyph strokes increase 20% to 4.8; labels increase 15% to 11.5 px (10.35 px in four columns) at weight 500. Ordinary guide selection no longer changes the frame fill, keeping the permanent paper outer edge and single inset rule consistent. Existing guide geometry/timing and rune borders are preserved. Apprentice/Expert buttons and labels grow 15% from the previous release.


## 0.3.4 canvas trace controls

Opening the combat picker hides the Clear Ink action and dismisses any selected guide, using its existing exit fade. Closing the picker restores Clear Ink but cannot restore the dismissed guide. The small top-left canvas Hide trace button appears only with an active trace and a closed picker. The picker itself no longer has Hide trace. Explicit hiding and opening Spells clear only the selected guide; Expert’s original 12-second selection-to-ready deadline remains unchanged, preventing menu reopen from bypassing cooldown. Apprentice can choose another owned spell immediately.
