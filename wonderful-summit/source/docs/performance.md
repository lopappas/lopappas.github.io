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

A physical iPhone baseline is still outstanding. Browser/phone verification could not be performed because the managed preview relay is unavailable. The metrics and report controls have been built, but their actual Safari presentation and clipboard access need device verification.

### Local baseline before the scheduler change

Source: 8bac59f (0.2.54). Node 24 in the executor, **simulation only**. Ordinary slime encounter, fixed 1/60-second steps; restart after defeat, 2,000 warm-up updates, 20,000 measured updates. Mean 0.002919 ms/update, p95 0.002320 ms/update. Mean exceeding p95 reflects occasional outliers. These values cannot be used as iPhone rendering or heat measurements.

The old combat callback rescheduled itself while paused or awaiting reward collection. The new FrameLoop cancels its outstanding callback and requests none while inactive. Visibility changes resume with a fresh clock, avoiding a large catch-up step. The same active scheduling is used by practice learning and dialogue typing/position tracking. Animated CSS decorations are outside this milestone.

### Verification

Fake-clock tests verify one pending callback at most, no callback while inactive/hidden/terminal, idempotent starts, cleanup, no pause-time catch-up, identical battle steps after resume, and bounded/disabled measurement behavior. The full game suite and production build are required for release.

### Next comparison

Before milestone 2, collect an ordinary-combat iPhone report from this version. Compare update gaps and simulation/commit counts after milestone 2, together with the user's heat observations. A changed synthetic Node number alone is not proof of lower power consumption.
