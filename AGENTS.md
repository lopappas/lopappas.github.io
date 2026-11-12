# Wonderful Summit — Agent Instructions

These instructions apply to Wonderful Summit in this repository.

## Start here
- Read PROJECT_STATUS.md before making changes.
- GitHub is the source of truth: lopappas/lopappas.github.io, branch master. Inspect the current branch head before editing; do not assume a scratch copy is current.
- The game source is in wonderful-summit/source/. The published build is in wonderful-summit/index.html and wonderful-summit/assets/.
- Use GitHub and GitHub Pages. Do not create or publish a ChatGPT Site.

## Work efficiently
- Keep file reads and tool output focused. Batch independent reads and checks.
- Use a short plan for substantial work; implement routine authorized changes without repeatedly asking for permission.
- Do not spawn subagents unless the user explicitly requests them.
- Keep this file and PROJECT_STATUS.md concise. Do not append conversation transcripts or a running activity log.

## Validation
- Run checks appropriate to the change. For game logic, use relevant tests and the production build; run the full suite when shared behavior or milestone scope warrants it.
- Do not add tests that merely duplicate low-impact text or styling changes.
- Once checks pass, do not rerun them without a new change, failure, or unresolved concern.
- Browser verification should target the changed interaction or a meaningful visual change. Avoid replaying unrelated tutorial sections, repeated screenshots, and browser restarts.
- Documentation-only updates do not require game tests, browser verification, or deployment monitoring.
- Report actual test results; a different test count alone does not prove a newer or older version.

## Publishing
- Keep source changes and their production build consistent in the same commit when updating the game.
- Use a guarded branch update against the inspected head. Do not overwrite newer remote work.
- Reduce deployment polling decisively: one status check per update by default. If publishing is still pending, report that clearly and stop polling.
- Check again only when the user asks or when investigating a reported failure. Do not keep the model active in a deployment-wait loop.
- Do not retry an already active deployment repeatedly. Inspect a failure before deciding on a retry.
- Distinguish committed, deployment pending, and verified live. Never claim a change is live based only on a commit or build success.

## Project decisions
- Player-facing tutorial labels use "Tutorial". Internal Tutorial 2.0 module names remain unchanged.
- The current tutorial is the main tutorial. Milestone 7 removed the old tutorial and its exclusive tests; retain shared game coverage.
- The user has explicitly approved the unrestricted developer panel for the live game.
- Preserve existing spell balance and behavior outside the requested change.

## Release versions
- Current scheme: 0.2.00, displaying the last segment with two digits (e.g. 0.1.03). package.json remains the source for the home label.
- Small changes add 1 to the last segment; bigger changes advance to the next ten. Change the middle number only when the user specifies it; ask before exceeding 99.
- Use `npm run version:small` / `npm run version:feature` from wonderful-summit/source/, or an explicit version when requested. Bump once per published release.
- Add brief player-facing notes to the top of src/versionHistory.ts for every release; “Bug fix” is enough for small fixes. Retain prior entries. Run tests/gameVersion.test.ts when releasing. See source/README.md for details.

## Handoffs
- After a completed milestone or significant change, replace outdated information in PROJECT_STATUS.md with the current state, validation, unresolved issues, and next work.
- Git history is the change log. Do not duplicate every commit or test log in the handoff.
- The user's latest explicit instructions take precedence over older project notes.
