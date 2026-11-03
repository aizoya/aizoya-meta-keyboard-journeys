# Hosting handoff — preparation only

No deployment or paid resource has been created for this candidate. The development server must not be exposed publicly as-is.

## Runtime requirements

- Node 22 or later; exact dependencies in package.json.
- Installed Playwright Chromium and its system libraries; browser acceptance already verifies this combination on GitHub Ubuntu.
- A runtime that can launch Chromium and keep the Node server alive across comparison requests. Do not assume the existing long-lived server will work unchanged in a short-lived serverless function.
- Limited CPU/memory/concurrency, request timeouts, session expiry, and a cost allowance approved before provisioning.

## Implemented source preparation

- Optional `PUBLIC_ORIGIN` accepts a clean HTTPS origin and adds that exact host to the allowlist. Forwarded host headers do not extend trust.
- Requests for that configured host require the HTTPS Origin and get a Secure, HttpOnly, SameSite session cookie. Local fixture execution still uses loopback.
- Test exports use the validated request origin and actual local port, with destination strings JSON-escaped.
- Four new HTTP/configuration checks pass locally; 18 control tests in total. These simulate proxy headers and do not establish actual TLS termination or hosted operation.

## Remaining hosting work

1. Select and approve the hosting environment and domain, set `PUBLIC_ORIGIN`, and verify real proxy/TLS behavior on that exact URL.
2. Verify HTTPS-aware origin validation and Secure cookies behind the selected proxy. Do not weaken origin checks to make a deployment work.
3. External-runtime browser isolation, process cleanup and network restrictions. The current fixture-origin route filter is not an OS sandbox.
4. Public session/global usage limits appropriate to the selected runtime. The existing limits are in-memory and reset on restart; they are not a durable account quota or provider bill cap.
5. Decide retention and persistence before describing evidence links as durable. Current server records expire after one hour and disappear on restart.
6. A clear unavailable state for exhausted allowance, missing browser or paused Meta access. Never substitute a scripted run under a live-agent label.

## Public acceptance before sharing a judge URL

Open the exact public URL in a fresh session, compare one broken and one corrected case, inspect screenshots, replay, download evidence and execute the exported test against the intended fixture URL. Check physical iPhone/Safari separately. Verify secrets are server-only, no external target entry is exposed, and no live model request occurs in scripted mode.

The server export now uses the validated public origin or actual local listening port. The standalone replaySource helper defaults to localhost:8787 for local reproduction. Hosted exports still require an actual public-URL acceptance check; generating the correct string does not prove external reachability.

Provider choice, price, account allowance, public release and deployment remain owner decisions. Prepared source and passing CI do not establish a free hosting entitlement or deployment authorization.
