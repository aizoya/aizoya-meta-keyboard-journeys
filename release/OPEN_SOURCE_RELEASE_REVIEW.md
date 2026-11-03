# Open-source release review — proposed, not activated

Repository: https://github.com/aizoya/aizoya-meta-keyboard-journeys
Visibility observed: private. Latest proposed work is in PR #2. No visibility change, license grant, merge of PR #2, deployment or model request is performed by this review.

## Concrete proposal for approval

1. Use the OSI-approved MIT license for the original application source, documentation and owned demonstration assets. Proposed copyright notice: **Copyright (c) 2026 Franklyn Rosario**; confirm this holder before creating the root LICENSE file. AIZOYA remains the project brand; incorporation and an IP assignment are not asserted.
2. Keep dependencies under their own licenses and preserve THIRD_PARTY_NOTICES.md and the copied Playwright notices.
3. After approval, create the actual root LICENSE, update the README, integrate reviewed PR #2 and make the exact repository public. Verify the final main SHA, anonymous read/clone access, license recognition and all submitted links.
4. Keep the Meta key in GitHub Actions secrets, never in source. GitHub repository publication does not authorize paid inference or deployment.

MIT permits use, modification and redistribution, including commercial distribution, subject to its notice conditions. This is a meaningful permission grant; the repository has no original-project MIT grant until the owner approves and the license is added. Primary license text: https://opensource.org/license/mit

## Audit evidence

- Targeted scan: 82 unique reachable UTF-8 Git blobs, with no high-confidence credential-pattern findings and no blocked credential filenames. Seven unique binary blobs were not text-scanned. This is a bounded scan, not a guarantee of secret absence.
- All 49 tracked files match current GitHub blob hashes at the audited source head. The remote-only GITHUB_CHECKPOINT.md was read separately and contains provenance text. The remote-only provenance bundle matches local Git blob efa1bba431472b47249c84cd85198e3a566f09b2; its retained commit is an ancestor of the local history.
- No .env credentials are tracked; .env.example contains blank/disabled defaults. The scan excludes GitHub's encrypted secret store and is not a credential-access audit.
- The original local bundle is intentionally preserved. It contains contributor names, email metadata, commit messages and historical development records; public release will expose those normal Git provenance records. Do not claim its local timestamps are earlier GitHub uploads.
- The official @playwright/test 1.62.1 package manifest and installed Playwright 1.62.1 package identify Apache-2.0. Exact installed Playwright notice/license files are included unchanged.
- Prior runtime source 37b4162cf237d316b823a1babd16256e084a2d13 passed 21 controls and full browser acceptance in run 41563180587. This review changes documentation/notices only; it does not establish live Meta behavior.

Machine-readable bounded scan: source-audit.json. The subsequent notice/review files are excluded from that recorded 49-file source count; final publication must recheck the final tree and newly added LICENSE.

## Pending release acceptance

- Owner approval of license, copyright holder and public release.
- Confirm final human contributor/IP disclosures and startup-track eligibility without inventing incorporation.
- Verify required runtime Meta use after billing/credits are resolved and fresh inference is authorized.
- Confirm third-party terms for any packaged browser/container; none is being distributed here.
- Verify the public repo and final links while signed out; retain a publication checkpoint. The current private repository does not satisfy the organizer's mandatory open-source requirement.
