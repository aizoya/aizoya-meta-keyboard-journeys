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

## Extended offline acceptance

Source c7878b74198c4174b3e997a9ef31b2fc04d2484a passed run 41560892019:
https://github.com/aizoya/aizoya-meta-keyboard-journeys/actions/runs/41560892019

- Fourteen control/HTTP/Meta-guard tests. The four Meta-guard tests use isolated no-network substitutes and never test a live provider.
- Six comparisons and six saved-action replays: original broken control, corrected buttons, arrow-key radios, reordered buttons, Space activation and a focus trap.
- Keyboard completion observed in corrected, arrow-key, reordered and Space cases; bounded non-completion in broken and trap cases; mouse completion in all six.
- The actual exported fixed-fixture test passed.
- Desktop and 390px-width compare/export/replay passed, including the assertion that the iframe fits its content and the page has no horizontal overflow.
- Visual review of earlier desktop/mobile screenshots found clipped lower controls in the fixed-height iframe. The resize-message change addresses that finding; same-origin/source/variant validation and height bounds remain enforced. Physical iPhone/Safari is still untested.

Prior authorized live transport run 41559772934 returned HTTP 402, reserved one request and did not retry. This extension made no live model calls. Further inference is paused pending billing/credits and fresh authorization.

## Hosting source acceptance

Runtime source ca48b78d4d6f5d5845f6512e3ff4539201544a53 passed GitHub run 41561886365:
https://github.com/aizoya/aizoya-meta-keyboard-journeys/actions/runs/41561886365

Nineteen control tests passed, including exact HTTPS-origin configuration, Secure/HttpOnly cookies on the configured host, rejection of insecure/foreign Origins and spoofed forwarded-host claims, actual-port/local and configured-origin exports, and 60 practice/status visits without exhausting saved-run sessions. Hosting HTTP tests use an injected runner and simulated proxy headers; they do not establish an actual hosted TLS endpoint.

The same source passed all six real Chromium comparisons and replays, actual exported-test execution, and desktop/mobile-width app compare/export/replay and iframe-fit checks. No live Meta request, training, deployment or paid resource was introduced. Public hosting, proxy acceptance, process isolation, durable quotas and physical iPhone/Safari remain pending.

## Recorded gallery and file-only preview

Source 37b4162cf237d316b823a1babd16256e084a2d13 passed run 41563180587:
https://github.com/aizoya/aizoya-meta-keyboard-journeys/actions/runs/41563180587

All 21 control tests passed, including exact image-hash checks against the downloaded CI artifact and read-only/session-free asset serving. The source artifact ZIP hash was verified against GitHub metadata before extraction: c591cd863156f78a2f0cce760a398a0be1f33f4a41021054e5fa3dddd12bd10f. Hashes preserve content identity; they are not an independent signature or accessibility certification.

The full six-case comparison/replay and exported-test workflow passed. At desktop and mobile widths, all six recorded gallery options showed the expected recorded outcomes and image loads; downloading a recording made no comparison POST. The standalone HTML opened from file in Chromium, showed the corrected-case images/outcome and made zero HTTP(S) requests. It uses embedded assets and a connect-src none policy.

Recordings come from earlier run 41561886365 and retain that provenance. No live Meta call, new model inference or training was performed. Physical iPhone/Safari and public deployment remain unverified.


## Live Meta and hosted reliability checkpoint — November 3, 2026

Source 0c792cfce06ecf520685a1ba2c9c9f251734e6c4 passed the bounded live workflow in [run 41721095171](https://github.com/aizoya/aizoya-meta-keyboard-journeys/actions/runs/41721095171). Muse Spark completed the owned corrected keyboard fixture in five reserved requests using Tab, Tab, Space, Tab, Space. The deterministic receipt confirmed completion. Saved-action replay completed without another model request. Scope: one owned keyboard-only fixture; mouse comparison and other variants were not tested.

Reliability source 4891d4bb74cd42c4c9ea7bfba019131512db04ef is deployed at https://meta.aizoya.com. Nineteen server/control tests and desktop/mobile-width browser acceptance passed in GitHub Actions. The hosted page loads under Vercel team authentication. Live Meta is disabled there. Logged-out judge access, physical iPhone/Safari use, durable cross-instance storage and global spend enforcement remain unverified.
