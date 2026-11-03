# AIZOYA Meta keyboard journeys — development candidate

Working description; no final product name selected. One owned practice store, mouse/keyboard route comparison, action restrictions, trace replay and a reviewable test draft. No real payments, user accounts or external-site testing.

## Current state

Original source first written during November 2, 2026 Pacific. Git history begins with the actual first commit; earlier planning and the separate restaurant prototype are not retrospectively represented as commits here. See HACKATHON_CONTRIBUTIONS.md.

This initial checkpoint is incomplete. Source syntax checks and 10 policy/HTTP tests pass. HTTP tests use an injected runner and are not browser or Meta end-to-end tests. Automated-browser runtime could not be established in the current workspace: Playwright's Chromium download returned an invalid/truncated archive. No successful comparison, live Meta request, hosted product or accessibility finding has been verified yet. Manual desktop-browser checks completed the mouse route, corrected keyboard route and valid arrow-key alternative. The arrow-key route recorded four key events and zero pointer activations. A keyboard-click classification bug found during this check was fixed. The comparison UI correctly displayed the unavailable-browser infrastructure failure. These manual checks are not automated comparison or mobile acceptance. The earlier restaurant prototype's 52 tests do not apply to this candidate.

## Run locally

Node 22+, with the exact Playwright dependency in package.json:

```
npm install
npx playwright install chromium
npm start
```

Visit http://127.0.0.1:8787. Default mode is **Fixture replay · no AI**, a scripted demonstration rather than autonomous discovery. The server binds loopback by default. Do not expose this development server publicly as-is.

Compare the original control, corrected control and valid arrow-key radio group. Inspect focused controls, saved actions, screenshots and the practice-kit outcome. Keyboard mode allows only approved key presses; no pointer, direct fill, DOM mutation or scripted focus action exists in its executor. The separate manual iframe records the user's events in the current tab.

Meta mode requires MODEL_API_KEY, PASSAGE_ENABLE_META=1 and a positive PASSAGE_MAX_META_CALLS (at most100). Do not enable it without billing readiness and an authorized finite request allowance. The server reserves requests before dispatch, without automatic retries. This is a request quota, not an exact dollar guarantee or a verified provider bill cap. Standard-mode MuseSpark1.3 is the prepared endpoint. Transport/usage behavior is unverified. Never paste keys into chat, browser fields or source.

Saved runs are in per-session server memory with one-hour expiry, a maximum of six run records and two global active jobs. They do not survive process restart. They are not durable evidence records. No public deployment, arbitrary URL input, production authentication or container isolation is implemented. Anonymous local sessions are not production identity.

## Result interpretation

A recorded completion predicate is separate from the planner. A failed bounded attempt is **needs review**, not proof that no keyboard route exists. Replaying saved actions can establish repeated observed outcomes, not general accessibility or WCAG compliance. Generated test code is built from a fixed template and validated actions; the server never executes model-generated code. The export requires @playwright/test in the consumer's project and is a draft expected-outcome assertion, not an independent diagnosis.

Next acceptance: real browser setup, healthy/defective fixture checks, actual replay, infrastructure-failure behavior and UI/browser verification; then an authorized real Meta call. Preserve the new contribution boundary and run held-out cases before claiming generality.
