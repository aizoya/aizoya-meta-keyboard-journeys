# Hosting and production checkpoint

Production is deployed at **https://meta.aizoya.com** through Vercel using the Docker runtime and custom DNS. The release process requires a successful Vercel status on the exact merged commit before submission.

## Verified

- Node 22 Docker runtime launches Playwright Chromium.
- HTTPS custom domain and configured `PUBLIC_ORIGIN`.
- Exact host/origin validation and Secure, HttpOnly, SameSite cookie on the external host.
- Six scripted comparison/replay cases and desktop/390px browser acceptance in CI.
- Rejected requests do not allocate limited sessions.
- Failed replay preserves the prior downloadable result.
- Live Meta is disabled in Vercel.

## Current access policy

On November 3, 2026, the owner opened the hosted application in a fresh Private Safari session without a sign-in wall. Recheck anonymous access immediately before submission. This owner verification is not an independent reviewer browser pass.

## Remaining production limits

- Session results remain in process memory for one hour and disappear on restart.
- Limits are per process; they are not durable cross-instance quotas or a provider bill cap.
- No public Meta inference should be enabled until durable global cost controls exist.
- No arbitrary external URLs, accounts or purchases.
- The owner completed a physical iPhone/Safari smoke check on November 3, 2026; broader device coverage remains unverified.
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
