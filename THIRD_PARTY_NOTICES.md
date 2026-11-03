# Third-party notices and distribution boundary

Original project code is licensed under MIT. This document does not relicense dependencies.

| Component | Version / use | License evidence |
| --- | --- | --- |
| playwright | 1.62.1; browser automation | Installed package metadata identifies Apache-2.0. Exact installed LICENSE, NOTICE and ThirdPartyNotices.txt copied unchanged to third-party/playwright-1.62.1/. |
| @playwright/test | 1.62.1; exported-test execution and development verification | Official tagged source package manifest identifies Apache-2.0: https://github.com/microsoft/playwright/blob/v1.62.1/packages/playwright-test/package.json |
| playwright-core | Transitive dependency of Playwright; npm resolves the exact dependency graph at installation | Preserve the notices shipped with the actual installed package. No dependency code is vendored here. |
| Chromium and FFmpeg | Installed separately by Playwright for browser verification | Browser binaries are not included in this source repository or the standalone gallery. Preserve their actual distribution licenses/notices when packaging a runtime; the application license does not replace them. |
| Node.js | Runtime, not bundled | Preserve the selected runtime's own license/notices if distributing a runtime image. |
| Meta Model API | Hosted Muse Spark integration; no model weights bundled | Separate service terms. One bounded manual workflow completed one owned keyboard-only fixture in run 41721095171. Public live Meta remains disabled. |

The Common Goods store, CSS organizer illustration and recorded image assets are authored project materials/captures of the owned synthetic fixtures. No customer uploads or third-party listing photos are included. Captured images retain their source run and content hashes.

Playwright NOTICE states that it contains code derived from Puppeteer under Apache 2.0. Its original notice is preserved, rather than attributed to AIZOYA.

The copied notices describe the verified installed Playwright package. They do not establish a complete license inventory for a future container, operating system or newly resolved dependencies. Review the exact installed distribution before publishing such a package.
