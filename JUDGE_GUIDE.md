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

GitHub Actions [run 41721095171](https://github.com/aizoya/aizoya-meta-keyboard-journeys/actions/runs/41721095171) used Muse Spark 1.3 on the owned corrected fixture. The keyboard route completed in five requests with actions Tab, Tab, Space, Tab, Space. Saved-action replay also completed and made no additional model request.

That result covers one keyboard-only fixture. It does not cover a live mouse comparison, the other five variants, unseen applications or the hosted public flow. Live Meta is disabled on the hosted application.

## What is implemented

- Separate browser contexts for mouse and keyboard routes.
- Keyboard execution limited to approved key presses; no pointer clicks, scripted focus or direct filling.
- Independent deterministic completion from the practice-store receipt.
- Captured action/focus evidence, saved-action replay and fixed-template Playwright test export.
- Six scripted owned examples and a bounded Muse Spark planner integration.

## Remaining judge-access checks

- Public MIT repository verified; recheck the exact submission URL.
- Recheck anonymous production access immediately before submission.
- Record, upload and verify the three-minute demo video.
