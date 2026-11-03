# AIZOYA Meta keyboard journeys — development candidate

Working description; no final product name selected. One owned practice store, mouse/keyboard route comparison, action restrictions, trace replay and a reviewable test draft. No real payments, user accounts or external-site testing.

## Current state

Original source first written during November 2, 2026 Pacific. Git history begins with the actual first commit; earlier planning and the separate restaurant prototype are not retrospectively represented as commits here. See HACKATHON_CONTRIBUTIONS.md.

Real Chromium acceptance passed on GitHub at source commit `c7878b74198c4174b3e997a9ef31b2fc04d2484a`: six mouse/keyboard comparisons, six saved-action replays, the actual exported Playwright test, and the app's compare/export/replay workflow at 1280×900 and 390×844. Fourteen control/HTTP/Meta-guard tests also pass. See [run 41560892019](https://github.com/aizoya/aizoya-meta-keyboard-journeys/actions/runs/41560892019) and QA_NOTES.md.

These runs use the scripted fixture planner and owned examples. They do not establish live Meta behavior, autonomous discovery on unseen applications, WCAG compliance, physical iPhone acceptance or hosted-product availability. The one authorized transport check returned HTTP 402 without retry (run 41559772934); no successful inference or billed result is established. Further live calls are paused while billing/credits are unresolved. Chromium remains unavailable in this local workspace; GitHub's runner provided the verified browser runtime. The earlier restaurant prototype's tests do not apply here.

## Run locally

Node 22+, with the exact Playwright dependency in package.json:

```
npm install
npx playwright install chromium
npm start
```

Visit http://127.0.0.1:8787. Default mode is **Fixture replay · no AI**, a scripted demonstration rather than autonomous discovery. The server binds loopback by default. Do not expose this development server publicly as-is.

Compare the original, corrected, arrow-key, reordered, Space-key and focus-trap controls. Inspect focused controls, saved actions, screenshots and the practice-kit outcome. Keyboard mode allows only approved key presses; no pointer, direct fill, DOM mutation or scripted focus action exists in its executor. The separate manual iframe records the user's events in the current tab.

Meta mode requires MODEL_API_KEY, PASSAGE_ENABLE_META=1 and a positive PASSAGE_MAX_META_CALLS (at most100). Do not enable it without billing readiness and an authorized finite request allowance. The server reserves requests before dispatch, without automatic retries. This is a request quota, not an exact dollar guarantee or a verified provider bill cap. Standard-mode MuseSpark1.3 is the prepared endpoint. Transport/usage behavior is unverified. Never paste keys into chat, browser fields or source.

Saved runs are in per-session server memory with one-hour expiry, a maximum of six run records and two global active jobs. They do not survive process restart. They are not durable evidence records. No public deployment, arbitrary URL input, production authentication or container isolation is implemented. Anonymous local sessions are not production identity.

## Result interpretation

A recorded completion predicate is separate from the planner. A failed bounded attempt is **needs review**, not proof that no keyboard route exists. Replaying saved actions can establish repeated observed outcomes, not general accessibility or WCAG compliance. Generated test code is built from a fixed template and validated actions; the server never executes model-generated code. The export requires @playwright/test in the consumer's project and is a draft expected-outcome assertion, not an independent diagnosis.

Next acceptance: resolve billing/credits, obtain a new finite live-request authorization, verify live planning, then test more varied tasks before claiming generality. Public hosting, publication and physical-device acceptance remain pending.

Run the same browser checks after installing dependencies and Chromium: `npm run test:browser`. This also needs the pinned `@playwright/test` development dependency.

## Judge and release preparation

See JUDGE_GUIDE.md, DEMO_SCRIPT.md, SUBMISSION_READINESS.md and HOSTING_HANDOFF.md. The practice iframe now fits its content, and completed results scroll into view with reduced-motion support. Six authored examples are regression cases, not an independent benchmark. No production or public release is implied.

Hosting source preparation now supports an explicit HTTPS `PUBLIC_ORIGIN`, Secure cookies on that host and correctly addressed test exports. Nineteen control tests pass locally, including five hosting checks. Actual proxy/TLS, isolation, public hosting and deployment remain unverified; see HOSTING_HANDOFF.md. Model calls remain paused.

## Recorded examples and standalone preview

Open **Explore 6 recorded browser examples** to inspect genuine captured outcomes from run 41561886365. They are explicitly labelled recorded, scripted and no-AI, with source commit/run, archive checksum and image hashes. Viewing them does not start a new comparison or replay.

A self-contained preview is committed at previews/AIZOYA_Recorded_Browser_Preview.html. Open it directly in a browser; all six examples and images are embedded. It is an evidence gallery, not the full application. Regenerate with `node scripts/export-recorded-preview.mjs --deliverable`.

Source 37b4162cf237d316b823a1babd16256e084a2d13 passed 21 control tests and the full browser workflow in run 41563180587. Browser acceptance checked six gallery selections, download with zero comparison POSTs, and standalone file loading with zero external network requests. Live Meta calls remain paused.
