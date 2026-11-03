# Verified runtime checkpoint — November 2, 2026 Pacific

Source commit: ba1d0d48fddaf0cbcd1c44d52eda5e6e9d6354e8.
Evidence: https://github.com/aizoya/aizoya-meta-keyboard-journeys/actions/runs/41555310325
Browser artifact: https://github.com/aizoya/aizoya-meta-keyboard-journeys/actions/runs/41555310325/artifacts/13193319922
Artifact retention: seven days; durable source and logs identify the run and acceptance conditions.

## Passed

- Ten control and HTTP tests; HTTP tests use an injected runner.
- Actual Chromium mouse route completed on all three owned fixture variants.
- Keyboard route did not complete on the broken fixture, completed on the fixed and arrow-key fixtures. This is an observed bounded attempt, not proof of universal inaccessibility.
- Saved-action replay reproduced each variant's observed outcome in fresh contexts.
- The actual exported fixed-fixture Playwright test executed and passed.
- Through the real app at desktop 1280×900 and mobile width 390×844: compare, result display, test download and saved-action replay completed; no horizontal page overflow.
- Source syntax checks passed.

The first browser acceptance run passed comparisons/replays but failed exported-test discovery because the artifacts directory is gitignored. An explicit narrow test configuration corrected discovery; the full run above passed afterward.

## Limits

Scripted fixture planner; no live Meta inference, unseen-site evaluation, physical iPhone/Safari acceptance, accessibility certification or production deployment. Automated screenshots were generated, but this record does not claim a separate human visual-design review.

## Provenance

Private AIZOYA repository and draft PR #1. Original local history is in provenance/local-history.bundle; GitHub history begins at actual upload time. Earlier local dates are not earlier GitHub activity. Branch protection read was forbidden by the integration, so protection is not verified.
