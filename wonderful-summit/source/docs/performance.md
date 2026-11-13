# Performance milestones

## Milestone 1 — version 0.2.60

Implemented opt-in measurements and idle scheduling cleanup. The rendering architecture, particle counts, game balance and frame-rate policy are unchanged. Milestone 2 will separate battlefield animation from controls and cache scenery; milestone 3 is conditional on measurements.

### On-device baseline

Hold the Spellbook button for 1.5 seconds to open the Developer panel. Choose **Start performance monitor**, then close the panel and resume combat. Monitoring starts disabled on every page load. Reset after entering the ordinary encounter to compare equivalent captures. Capture at least 30–60 active seconds, repeating the same encounter, spell choices and pace. Use the same device/browser, brightness and charging conditions for the milestone 2 comparison. Copy report before resetting or stopping.

The small overlay refreshes once per second and offers Reset, Copy report and Stop. It remains separate from Combat so reporting does not itself render Combat every second. Reports contain the build version, browser user agent, pixel ratio, viewport and aggregate metrics; nothing is uploaded. Stopping clears the capture and removes its reporting interval.

- Updates/s is measured from active combat callback intervals; it is not a GPU/presented-frame counter.
- p95 and max interval expose long gaps, using at most the last 600 samples.
- Simulation ms/update times only stepBattle/stepPracticeBattle. It excludes React rendering, browser layout, painting, GPU time and updateBattle work.
- Combat commits/s counts active Combat layout-effect commits over the active sample duration. It is not React render duration or a sum of all child renders.
- Total active seconds and update/commit counters describe the full capture. Paused and hidden time is excluded from update intervals.
- No thermal, battery-drain, or heap measurement is claimed.

The user supplied an ordinary-combat iPhone baseline from 0.2.60; see performance-baseline-iphone.json. It captured 56.78 active seconds, 59.874 updates/s, 17 ms p95 interval, 36 ms max interval, 0.04833 ms simulation/update and 61.078 Combat commits/s. The device reports DPR 3 and viewport 430 × 739. Device temperature and power consumption were not measured. Browser/phone verification could not be performed because the managed preview relay is unavailable. The metrics and report controls have been built, but their actual Safari presentation and clipboard access need device verification.

### Local baseline before the scheduler change

Source: 8bac59f (0.2.54). Node 24 in the executor, **simulation only**. Ordinary slime encounter, fixed 1/60-second steps; restart after defeat, 2,000 warm-up updates, 20,000 measured updates. Mean 0.002919 ms/update, p95 0.002320 ms/update. Mean exceeding p95 reflects occasional outliers. These values cannot be used as iPhone rendering or heat measurements.

The old combat callback rescheduled itself while paused or awaiting reward collection. The new FrameLoop cancels its outstanding callback and requests none while inactive. Visibility changes resume with a fresh clock, avoiding a large catch-up step. The same active scheduling is used by practice learning and dialogue typing/position tracking. Animated CSS decorations are outside this milestone.

### Verification

Fake-clock tests verify one pending callback at most, no callback while inactive/hidden/terminal, idempotent starts, cleanup, no pause-time catch-up, identical battle steps after resume, and bounded/disabled measurement behavior. The full game suite and production build are required for release.

### Next comparison

After milestone 2, repeat the ordinary-combat iPhone capture and compare it with performance-baseline-iphone.json. Compare update gaps and simulation/commit counts after milestone 2, together with the user's heat observations. A changed synthetic Node number alone is not proof of lower power consumption.

## Milestone 2 — version 0.2.70

Combat retains a live authoritative battle ref for input and simulation, plus a BattlePresentation store. AnimatedWorld subscribes directly to every live snapshot. Combat/control state is published only when its displayed values change, including health, potion/bottle availability, relic states, message expiry, practice status labels and the next displayed cooldown/effect tenth. Selection never throttles simulation, drawing or enemy motion. Controls do not retain stale action state: actions still read battleRef.current.

StaticScenery is a memoized component containing the original SVG definitions and scenery unchanged. It recomputes only when its Chronos grayscale amount changes. This caches React construction/reconciliation work; it does not claim to rasterize the scenery or stop its existing CSS fireflies.

The original commits/commitsPerActiveSecond report fields still count the Combat component, now representing control-level commits. New worldCommits/worldCommitsPerActiveSecond fields count AnimatedWorld independently. Compare control commits with the 61.078/s baseline while confirming that battlefield commits and updates/s remain near the device’s normal cadence. They are commit counts, not React CPU timings or GPU frame counters.

Automated presentation tests confirm 600 live movement publications with zero control invalidations in the first ten seconds of a seeded ordinary encounter, plus immediate health/terminal updates, tenth-second cooldown boundaries, potion and relic reactivity, transient expiry and practice statuses. The baseline is not a promised heat reduction; physical iPhone measurements on 0.2.70 remain required. Browser QA is blocked by the unavailable preview relay.

## Milestone 3 — version 0.2.80

Chronos no longer converts world/effect/enemy colors through PaletteGroup. A fixed pale-blue primary enemy color and translucent blue treatment, static clock marker and short expanding ring identify affected enemies. Freeze rules and durations are unchanged. Drawing points and ink consumption remain synchronous; canvas painting and the ink meter are batched once per frame. Combat charging uses its existing charge clock to paint ink, removing a competing ink animation loop. The separate release fade remains 210 ms. Ambient loops renew their half-second fail-safe deadline at most every 150 ms, and schedule volume changes only when the target changes. Immediate stop/disconnect behavior remains.

Settings → Battery Saver is optional, off on page load, and applies to battlefield snapshot publication only. Normal mode publishes every simulation frame. Saving mode samples battle time at 30 Hz; user actions and terminal transitions publish immediately. Simulation, cooldowns and drawing are not capped. CSS animations are not globally throttled. Reports include the mode flag.

The supplied 0.2.70 capture measured 59.809 updates/s, 60.216 battlefield commits/s, 27.308 control commits/s, 18 ms p95, 36 ms max and 0.03667 ms simulation/update over 56.43 active seconds. Repeat ordinary combat on 0.2.80 with Saver off, then on, and capture a separate Chronos-heavy session. Counters do not measure temperature or power; no measured heat reduction is claimed. Browser and physical-device visual checks remain outstanding because the preview relay is unavailable.

## Chronos sigil projection — version 0.2.81

The per-enemy blue treatment and clock markers and the brief cast ring are replaced by a single projected Chronos circle-and-hand sigil near the battlefield’s top center. Its hand starts upright and makes one clockwise rotation over the remaining active Chronos field duration. Each successful recast (including bottles) restarts the shared hand from the latest cast time toward the longest remaining field expiry, preserving stronger prior freezes. The projection uses battle time and the existing world publication cadence, so pausing/hidden time and Battery Saver behave consistently with the simulation. It disappears at expiry or when combat ends. No new animation timer, color-conversion pass or gameplay effect is introduced.

## Settings update — version 0.2.82
Battery Saver, the visual sampling throttle, and the report mode flag have been removed at the user’s request. Battlefield publication follows normal simulation cadence. The prior mode descriptions above are historical. Game Settings is a non-opening placeholder above Audio. Combat uses a pause icon for Settings; other screens retain the cog.

## Milestone 4 — version 0.2.90

Fila, slime/rocky/mother bodies, goblin bodies, normal helmets, King crown artwork, spider bodies and Belladora are memoized independently of world movement and health/status UI. Attack colors, practice colors, rocky details, crown movement/loss, recoil, freeze/hit CSS and entrance wrappers retain their original behavior. Spider legs keep their exact walking clock; stationary spider art ignores clock-only changes. Source SVG paths/paints are preserved and tested against pre-extraction markup fixtures.

Opt-in reports add artCommits and artCommitsPerActiveSecond. These sum commits of cached body/crown/purse components, including mounts and actual appearance changes; they are not GPU timings. A moving enemy can have many battlefield commits and zero new body commits. Reports must be reset inside combat for a comparable capture.

The supplied 0.2.82 ordinary-combat baseline is saved in performance-baseline-0.2.82-iphone.json: 60.909 active seconds, 59.749 updates/s, 18 ms p95, 39 ms max, 0.055 ms simulation/update, 60.024 battlefield commits/s and 27.960 control commits/s. Repeat ordinary combat on 0.2.90; no heat reduction is claimed before device comparison. Browser visual verification remains blocked by the unavailable preview relay. Milestones 5 (drawing controls/geometry), 6 (recognition templates), and 7 (canvas pixel ratio 2) remain pending.

## Milestone 5 — version 0.2.91

Combat ink and charge use independent DrawingPresentation subscriptions. The ink meter updates at its existing precision, while Combat updates only when refill eligibility/empty status changes. Charge progress updates the drawing frame/track independently; Combat retains only held/not-held state for input controls. Paint reads the live progress and retains the original rumble, expansion, color thresholds and 210 ms release fade. Recognizer input and synchronous ink accounting are unchanged.

The shared ink renderer caches native paths and bounds until append/replace/clear/resize/scripted drawing changes invalidate them. The cache follows the existing append-or-replace stroke model and never simplifies points. Unsupported native-path environments retain the previous point renderer. Canvas layout is measured once per pointer-down or after resize, viewport or scroll invalidation, instead of twice per pointer movement. Pixel ratio is unchanged.

Dialogue positioning uses coalesced resize/scroll/viewport/text events. It follows anchor animations only while they are active, then stops requesting frames. Hidden/inactive dialogue and cleanup cancel pending work, including late observer callbacks.

The supplied 0.2.90 report is preserved in performance-baseline-0.2.90-iphone.json: 60.068 active seconds, 59.982 updates/s, 18 ms p95, 30 ms max, 0.03667 ms simulation/update, 60.298 battlefield commits/s, 31.048 control commits/s, and only 6 cached-art commits. This supports body reuse; it does not measure temperature. Repeat ordinary combat and a separate drawing-heavy session on 0.2.91. Browser and physical-device visual verification remain outstanding because the preview relay is unavailable. Milestones 6 (recognition templates) and 7 (pixel ratio 2) remain pending.
