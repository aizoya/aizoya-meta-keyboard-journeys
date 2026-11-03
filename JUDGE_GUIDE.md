# Judge walkthrough — development draft

## What to try

Use the application URL once a hosted deployment is verified. There is no judge-ready public URL yet.

1. Leave Runner on **Fixture replay · no AI**. Choose **Original control** and select **Compare routes**.
2. The mouse route completes; the recorded keyboard attempt does not. Inspect its focus trail and captured steps. This is a review lead, not an accessibility certification.
3. Choose **Replay saved actions**. The same recorded outcomes should repeat in fresh browser contexts.
4. Select **Try the correction**, then compare again. Both routes should complete. Download the evidence and export the test draft.
5. Try **Arrow-key control** and **Space-key control**. A different keyboard pattern can still complete the task.
6. Try **Focus-trap control**. Color selection works, but the recorded keyboard route cannot reach the add button. Inspect the repeated focus changes.

No real store, payment, account or external URL is involved. Mobile-width checks do not establish physical iPhone or Safari acceptance.

## What is actually implemented

- Separate browser contexts for mouse and keyboard routes.
- Keyboard execution limited to approved key presses; no pointer clicks, scripted focus or direct filling.
- Independent, deterministic task completion from the practice-store receipt.
- Captured action/focus evidence, saved-action replay and fixed-template Playwright test export.
- Scripted fixture planner and a separate prepared Meta transport.

## What is not yet verified

Live Meta planning, success on unseen applications, public hosting, physical-device usability, general accessibility accuracy and customer demand.

The previous authorized Meta transport check returned HTTP 402, reserved one request and made no retry. Billing/credits are on hold. Do not suggest that the successful scripted browser tests were successful Meta runs.
