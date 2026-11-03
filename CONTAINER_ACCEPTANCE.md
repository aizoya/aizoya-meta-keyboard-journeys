# Container acceptance — November 3, 2026

> Historical pre-deployment checkpoint. For the current hosted state, see `HOSTING_HANDOFF.md` and `SUBMISSION_READINESS.md`.

Runtime source: da5200006cfd65bded537f808b9c2e392bc6b0e6.

- Container build and actual Chromium comparison, same-instance replay and test export passed: https://github.com/aizoya/aizoya-meta-keyboard-journeys/actions/runs/41687857168
- All 22 control tests and the full six-case/browser/gallery/offline-preview acceptance passed: https://github.com/aizoya/aizoya-meta-keyboard-journeys/actions/runs/41687857335
- Exact platform-provided VERCEL_URL is trusted only when VERCEL=1; unrelated preview hosts remain rejected. Custom PUBLIC_ORIGIN remains HTTPS-only.
- Dockerfile.vercel uses the pinned official Playwright v1.62.1-noble image, copies explicit project source/notices and defaults Meta execution and allowance to zero. No credentials are included in the image build.

## Preview settings

Use the Container preset after integrating this branch. Set PORT=8787 to match the tested container listener. Keep PASSAGE_ENABLE_META=0 and PASSAGE_MAX_META_CALLS=0. Leave PUBLIC_ORIGIN unset for the first platform-hostname preview, which uses VERCEL_URL. Configure the custom origin only when attaching the actual domain.

No Vercel deployment or registry push has been performed by these GitHub tests. Container storage and active compute may use paid Vercel allowance; no zero-cost entitlement is established.

## Remaining acceptance at this checkpoint

Actual Vercel build/launch, protected preview response, screenshots, comparison/replay/export and domain/TLS must be tested before any judge-facing URL is claimed. In-process saved runs and quotas are instance-local; scale-down, restart or another instance can lose them. The container test proves same-instance operation only. Shared state/global quota design remains necessary for reliable multi-instance public operation. Do not label the app production-ready or enable paid inference under these local quotas.

At this checkpoint, Meta inference was paused and the CNAME had not been added. Later hosting evidence records the custom-domain deployment. The root website and email DNS were not changed.
