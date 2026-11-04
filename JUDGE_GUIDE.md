# Judge walkthrough — current candidate

## Open the hosted application

Use **https://meta.aizoya.com**. On November 3, 2026, the owner opened the production URL in a fresh Private Safari session without a sign-in wall and exercised the core mobile flow. This is owner-verified access evidence, not an independent reviewer browser test.

For a zero-request preview, open `previews/AIZOYA_Recorded_Browser_Preview.html`. It contains six recorded scripted examples and makes no model request.

## What to try

1. Select **Check this journey** on the original control.
2. The mouse route completes; the bounded keyboard attempt stops. Inspect the focus trail. This is a review lead, not an accessibility certification.
3. Select **Run the same check again**. Saved actions should reproduce the recorded outcomes in fresh browser contexts.
4. Select **Check the corrected checkout**. Both scripted routes should complete.
5. Open **Explore 6 recorded browser examples** for the corrected, arrow-key, reordered, Space-key and focus-trap cases.
6. Download the evidence or export the fixed-template Playwright test draft.

No real store, payment, account or external URL is involved. Automated mobile-width checks are supplemented by the owner's November 3 physical iPhone/Safari smoke check; neither is an accessibility certification.

## Verified Meta use

GitHub Actions [run 41721095171](https://github.com/aizoya/aizoya-meta-keyboard-journeys/actions/runs/41721095171) used Muse Spark 1.3 on the known corrected fixture. It completed in five requests.

A stronger challenge was frozen in Git before inference: renamed labels and internal targets, changed choice order, renamed completion control and receipt language, plus fixed acceptance criteria. In [held-out run 41749591005](https://github.com/aizoya/aizoya-meta-keyboard-journeys/actions/runs/41749591005), Muse Spark completed in five requests using Tab, Space, Tab, Tab, Space. There was no retry; replay completed with zero additional model calls. The [raw result](provenance/meta-heldout-v3/result.json), final frames, plan, commit and artifact digest are permanent.

A precommitted obstacle fixture was then run once with an eight-request limit and no retry. In [run 41753137334](https://github.com/aizoya/aizoya-meta-keyboard-journeys/actions/runs/41753137334), Muse selected Blue; focus then alternated between Sand and Blue while completion remained false. The [raw result](provenance/meta-obstacle-v2/result.json) is published exactly. Its terminal `meta_incomplete` was classified by the runner as `infrastructure_error`; that reporting limitation remains visible. Treat this as an inspectable bounded obstacle lead, not proof of universal failure.

The verified model evidence covers two completed owned keyboard-only fixtures plus one bounded obstacle fixture, including one precommitted held-out challenge. It does not cover arbitrary applications, real accounts, purchases or the hosted public AI flow. Live Meta is disabled on the hosted application.

An additional adaptive check directly tests changed-state recovery. In [run 41770415998](https://github.com/aizoya/aizoya-meta-keyboard-journeys/actions/runs/41770415998), Muse selected Sand; the fixture then disabled Sand and reported Blue as the remaining available finish. Muse observed the changed state, selected Blue, and completed in six requests with no retry. Deterministic store code decided completion, and replay used zero model requests. See the permanent [result](provenance/meta-adaptive-v1/result.json) and [manifest](provenance/meta-adaptive-v1/manifest.json).

## What is implemented

- Separate browser contexts for mouse and keyboard routes.
- Keyboard execution limited to approved key presses; no pointer clicks, scripted focus or direct filling.
- Independent deterministic completion from the practice-store receipt.
- Captured action/focus evidence, saved-action replay and fixed-template Playwright test export.
- Six scripted owned examples and a bounded Muse Spark planner integration.
- Reusable loopback CI adapter with a three-field configuration, four stable data attributes, same-origin network guard and JSON result artifact.

## Customer integration

Engineering teams can copy `examples/github-actions-keyboard-journey.yml`, run their application locally in CI, and expose the contract documented in `CI_INTEGRATION.md`. The adapter accepts only loopback HTTP targets, rejects embedded credentials and unknown configuration fields, blocks off-origin requests, and uses the same eight-request/no-retry keyboard planner. Configuration and browser-contract checks are automated. It has not been benchmarked on a customer production application.

## Remaining judge-access checks

- Public MIT repository verified; recheck the exact submission URL.
- Recheck anonymous production access immediately before submission.
- Record, upload and verify the three-minute demo video.
