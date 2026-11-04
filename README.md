# AIZOYA Meta keyboard journeys — development candidate

Working description; no final product name selected. One owned practice store, mouse/keyboard route comparison, action restrictions, trace replay and a reviewable test draft. No real payments, user accounts or external-site testing.

## Current state

Original source first written during November 2, 2026 Pacific. Git history begins with the actual first commit; earlier planning and the separate restaurant prototype are not retrospectively represented as commits here. See HACKATHON_CONTRIBUTIONS.md.

Real Chromium acceptance passes on the current source in GitHub Actions, including six scripted mouse/keyboard comparisons, six saved-action replays, the exported Playwright test, and the judge flow at desktop and 390px mobile width. The hosted application is deployed at https://meta.aizoya.com and was owner-verified in a signed-out Private Safari session.

Two bounded Meta checks have passed. On November 3, 2026, Muse Spark completed the keyboard route on the owned corrected fixture in five requests (Tab, Tab, Space, Tab, Space), and the saved-action replay completed without another model request. See the [permanent raw result](provenance/meta-run-41721095171/result.json) and [run 41721095171](https://github.com/aizoya/aizoya-meta-keyboard-journeys/actions/runs/41721095171). The repository also preserves both final frames and a manifest tying them to source commit `0c792cfce06ecf520685a1ba2c9c9f251734e6c4` and artifact digest `sha256:4fb3de4980624dcdade8d24e9dce4ec4a5f3020bed4a21e0db5aa8b16ec09731`. This verifies one keyboard-only owned fixture. It does not verify the mouse comparison, other variants, unseen applications, or public AI availability. Live Meta remains disabled in the hosted app.

A stronger precommitted held-out evaluation passed in [run 41749591005](https://github.com/aizoya/aizoya-meta-keyboard-journeys/actions/runs/41749591005). Before inference, the repository froze renamed labels and machine targets, changed choice order, renamed completion and receipt language, and fixed the pass criteria. Muse Spark completed it in five requests using Tab, Space, Tab, Tab, Space. There was no retry, and saved-action replay completed with zero additional model calls. The [raw held-out result](provenance/meta-heldout-v3/result.json), frames, plan, source commit and artifact digest are committed permanently. Two earlier versioned attempts ended before inference with zero reserved requests; both infrastructure failures are also preserved.

## Run locally

Node 22+, with the exact Playwright dependency in package.json:

```
npm install
npx playwright install chromium
npm start
```

Visit http://127.0.0.1:8787. Default mode is **Fixture replay · no AI**, a scripted demonstration rather than autonomous discovery. The server binds loopback by default. Do not expose this development server publicly as-is.

Compare the original, corrected, arrow-key, reordered, Space-key and focus-trap controls. Inspect focused controls, saved actions, screenshots and the practice-kit outcome. Keyboard mode allows only approved key presses; no pointer, direct fill, DOM mutation or scripted focus action exists in its executor. The separate manual iframe records the user's events in the current tab.

Meta mode requires MODEL_API_KEY, PASSAGE_ENABLE_META=1 and a positive PASSAGE_MAX_META_CALLS (at most 100). Do not enable it without billing readiness and an authorized finite request allowance. The server reserves requests before dispatch, without automatic retries. This is a request quota, not an exact dollar guarantee or a provider bill cap. Standard-mode Muse Spark 1.3 is the prepared endpoint. A bounded keyboard-only run succeeded as documented above; public Meta mode remains disabled. Never paste keys into chat, browser fields or source.

Saved runs are in per-session server memory with one-hour expiry, a maximum of six run records and two global active jobs. They do not survive process restart. They are not durable evidence records. No arbitrary URL input, production authentication or container isolation is implemented. The public hackathon deployment is a constrained prototype. Anonymous local sessions are not production identity.

## Result interpretation

A recorded completion predicate is separate from the planner. A failed bounded attempt is **needs review**, not proof that no keyboard route exists. Replaying saved actions can establish repeated observed outcomes, not general accessibility or WCAG compliance. Generated test code is built from a fixed template and validated actions; the server never executes model-generated code. The export requires @playwright/test in the consumer's project and is a draft expected-outcome assertion, not an independent diagnosis.

Next acceptance: keep the hosted judge flow stable and test more varied tasks before claiming generality. On November 3, 2026, the owner verified the core flow in physical iPhone Safari and opened the production URL in a fresh Private Safari session without a sign-in wall; this is owner evidence, not an independent browser audit. Any additional live inference requires a new finite allowance. Repository visibility is verified public and GitHub recognizes the MIT license.

Run the same browser checks after installing dependencies and Chromium: `npm run test:browser`. This also needs the pinned `@playwright/test` development dependency.

## Judge and release preparation

See JUDGE_GUIDE.md, DEMO_SCRIPT.md, SUBMISSION_READINESS.md and HOSTING_HANDOFF.md. The practice iframe now fits its content, and completed results scroll into view with reduced-motion support. Six authored examples are regression cases, not an independent benchmark. Production hosting is verified at https://meta.aizoya.com. On November 3, 2026, the owner verified anonymous access in a fresh Private Safari session and exercised the core mobile judge flow on physical iPhone Safari.

Hosting source preparation now supports an explicit HTTPS `PUBLIC_ORIGIN`, Secure cookies on that host and correctly addressed test exports. Current main source controls report 37 passing tests in GitHub Actions run 41735584947. TLS and the custom domain are verified on the hosted deployment. Durable cross-instance quotas and storage are not implemented; see HOSTING_HANDOFF.md. Public Meta calls remain disabled.

## Recorded examples and standalone preview

Open **Explore 6 recorded browser examples** to inspect genuine captured outcomes from run 41561886365. They are explicitly labelled recorded, scripted and no-AI, with source commit/run, archive checksum and image hashes. Viewing them does not start a new comparison or replay.

A self-contained preview is committed at previews/AIZOYA_Recorded_Browser_Preview.html. Open it directly in a browser; all six examples and images are embedded. It is an evidence gallery, not the full application. Regenerate with `node scripts/export-recorded-preview.mjs --deliverable`.

Source 37b4162cf237d316b823a1babd16256e084a2d13 passed 21 control tests and the full browser workflow in run 41563180587. Browser acceptance checked six gallery selections, download with zero comparison POSTs, and standalone file loading with zero external network requests. Live Meta calls remain paused.

## License and release approval

Original project code is licensed under MIT, Copyright (c) 2026 Franklyn Rosario; see LICENSE. Dependencies retain their own terms in THIRD_PARTY_NOTICES.md. The owner approved licensing, PR #2 integration and public repository release. Earlier proposal documents describe the pre-approval checkpoint. Public visibility is verified through the GitHub repository metadata. This approval does not enable model calls or authorize deployment.
