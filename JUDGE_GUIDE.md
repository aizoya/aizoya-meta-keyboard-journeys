# Judge walkthrough — current candidate

## Open the hosted application

Use **https://meta.aizoya.com**. The current deployment is protected by Vercel team authentication, so logged-out judge access must be confirmed before submission.

For a zero-request preview, open `previews/AIZOYA_Recorded_Browser_Preview.html`. It contains six recorded scripted examples and makes no model request.

## What to try

1. Select **Check this journey** on the original control.
2. The mouse route completes; the bounded keyboard attempt stops. Inspect the focus trail. This is a review lead, not an accessibility certification.
3. Select **Run the same check again**. Saved actions should reproduce the recorded outcomes in fresh browser contexts.
4. Select **Check the corrected checkout**. Both scripted routes should complete.
5. Open **Explore 6 recorded browser examples** for the corrected, arrow-key, reordered, Space-key and focus-trap cases.
6. Download the evidence or export the fixed-template Playwright test draft.

No real store, payment, account or external URL is involved. Mobile-width checks do not establish physical iPhone or Safari acceptance.

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

- Change the GitHub repository from private to public.
- Confirm the application works in a logged-out judge session or intentionally change the Vercel access policy.
- Perform the physical iPhone/Safari check.
- Record and verify the three-minute demo video.
