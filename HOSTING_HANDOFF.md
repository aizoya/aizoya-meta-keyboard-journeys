# Hosting and production checkpoint

Production is deployed at **https://meta.aizoya.com** through Vercel using the Docker runtime and custom DNS. Vercel confirmed deployment of commit `54bbc122bdefeec0383ff682be7f81d9397af609`.

## Verified

- Node 22 Docker runtime launches Playwright Chromium.
- HTTPS custom domain and configured `PUBLIC_ORIGIN`.
- Exact host/origin validation and Secure, HttpOnly, SameSite cookie on the external host.
- Six scripted comparison/replay cases and desktop/390px browser acceptance in CI.
- Rejected requests do not allocate limited sessions.
- Failed replay preserves the prior downloadable result.
- Live Meta is disabled in Vercel.

## Current access policy

Vercel team authentication still protects the hosted application. That works for AIZOYA members but may block judges in a fresh logged-out session. Judge access must be resolved and verified before submission.

## Remaining production limits

- Session results remain in process memory for one hour and disappear on restart.
- Limits are per process; they are not durable cross-instance quotas or a provider bill cap.
- No public Meta inference should be enabled until durable global cost controls exist.
- No arbitrary external URLs, accounts or purchases.
- Physical iPhone/Safari acceptance remains pending.
- Generated evidence links are not durable records.

## Judge acceptance

In a fresh logged-out session:

1. Open the exact production URL.
2. Confirm no team sign-in wall.
3. Open the recorded examples; the selector should already contain six choices.
4. Run Original control and verify mouse completes while the bounded keyboard attempt stops.
5. Replay saved actions and confirm the result remains visible.
6. Check the corrected checkout and verify both routes complete.
7. Download evidence and export the test draft.
8. Confirm scripted mode makes no Meta request.
9. Repeat the core flow on physical iPhone/Safari.

Do not weaken host/origin validation or enable public AI merely to simplify judge access.
