# Submission answer bank — unsubmitted draft

Prepared November 3, 2026. Verify every answer against the actual portal fields and character limits before submission.

## Working title

AIZOYA Keyboard Journeys

## One sentence

Inspect how checkout completes with a mouse and a constrained keyboard agent, replay the recorded actions, and turn a successful route into a regression-test draft.

## Problem

A checkout can work with a mouse while a keyboard attempt gets stuck. Engineers need evidence showing the attempted route, focus movement, observed outcome, reproduction and correction. A bounded failed attempt should invite review instead of being presented as a universal accessibility verdict.

## Product

The prototype runs mouse and keyboard routes in separate Chromium contexts against an owned fictional store. The keyboard executor accepts only approved key presses. A deterministic receipt checks completion independently of the planner. Users can inspect frames and actions, replay saved actions in fresh contexts and export a fixed-template Playwright test draft.

Six authored cases cover an unfocusable control, corrected buttons, arrow-key radios, reordered controls, Space activation and a focus trap. A recorded gallery preserves scripted browser outcomes with source-run provenance and content hashes.

## Meta technology

Muse Spark 1.3 is integrated through the Meta Model API with strict structured output and an allowlisted action vocabulary. In bounded GitHub Actions run [41721095171](https://github.com/aizoya/aizoya-meta-keyboard-journeys/actions/runs/41721095171), Muse Spark completed the known corrected fixture in five requests. We then froze a held-out challenge in Git before inference: renamed labels and machine targets, changed choice order, renamed completion and receipt language, and fixed acceptance criteria. In [run 41749591005](https://github.com/aizoya/aizoya-meta-keyboard-journeys/actions/runs/41749591005), Muse Spark completed that challenge in five requests using Tab, Space, Tab, Tab, Space. No retry occurred, and replay completed with zero additional model calls. Raw results and frames are committed permanently.

Scope is exact: two owned keyboard-only fixtures, one known and one precommitted held-out challenge. These runs did not test arbitrary sites, real accounts, purchases, or the hosted public AI flow. Live Meta is disabled on Vercel to control cost; the hosted judge flow uses clearly labelled scripted examples.

## What was built during the event

Owned storefront controls; constrained route execution; independent outcome checks; trace capture and saved-action replay; fixed-template test export; mobile-responsive interface; recorded evidence gallery; guarded Muse Spark transport; hosted origin/session controls; custom-domain deployment; and automated source, container and browser verification.

Separate restaurant and ReleaseProof prototypes were not imported or counted as new work.

## Technical stack

Node.js 22, authored HTML/CSS/JavaScript, Playwright Chromium and @playwright/test, Meta Model API with Muse Spark 1.3, Docker and Vercel. No customer data or model weights are bundled.

## Verified results

- Hosted deployment: https://meta.aizoya.com
- Known-fixture Meta run: five requests; completed; replay used zero additional requests.
- Precommitted held-out Meta run: five requests; completed renamed/reordered challenge; no retry; replay used zero additional requests.
- Automated browser acceptance: six scripted mouse/keyboard comparisons, six saved-action replays, exported-test execution, desktop and 390px-width judge flows.
- Reliability controls: rejected requests do not consume session capacity; failed replay keeps prior evidence visible; server returns bounded safe errors.

These are owned synthetic cases, not an independent customer benchmark, customer traction or WCAG certification. The owner completed a physical iPhone/Safari smoke check.

## Intended users and value

Engineers and product teams investigating whether customers can complete important keyboard workflows. The value is an inspectable path from observed behavior to replay and a regression check. Customer demand and broader accuracy remain unvalidated.

## Known limitations

One owned practice store; no arbitrary external URLs, real accounts or purchases; two verified Meta keyboard fixtures, including one precommitted held-out challenge; bounded attempts cannot prove that no valid route exists; in-memory one-hour sessions are not durable records; per-process limits are not a global provider-spend cap; physical iPhone/Safari remains to be checked.

## Final fields

| Field | Current value / status |
| --- | --- |
| Representative | Franklyn Rosario, MBA-ITM |
| Organization | AIZOYA; do not claim incorporation unless independently completed |
| Track/theme | Startup track requested; confirm eligibility and final theme in portal |
| Repository | https://github.com/aizoya/aizoya-meta-keyboard-journeys — verified public; MIT license recognized |
| License | MIT, Copyright (c) 2026 Franklyn Rosario |
| Product URL | https://meta.aizoya.com — owner-verified in fresh Private Safari without a sign-in wall |
| Video URL | Pending recording, upload and playback verification |
| Deadline | November 4, 2026, 6:00 PM Pacific, from organizer blast supplied by Franklyn |
| Internal target | November 4, 2026, 5:00 PM Pacific |
| Submission | Not submitted |

## Final link check

Verify anonymous repository access, anonymous product access, video playback, exact submitted branch, required model disclosures, team details and the portal confirmation before calling submission complete.
