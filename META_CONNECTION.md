# Meta connection checkpoint

Verified November 2, 2026 Pacific. No credentials stored here.

| Capability | Status | Evidence / next action |
| --- | --- | --- |
| Meta account and credits | User-reported; not independently verified | User reports key created and credit claimed. Applied balance is unknown here. |
| Local runtime credential | Missing | Boolean configuration check returns false. |
| Meta-specific connected service | Missing | No Meta credential-management operation is exposed. |
| Request transport format | Docs checked; live unverified | Official quickstart and structured-output documentation support the configured model, endpoint and JSON format. |
| Runtime browser workflow | Verified, scripted only | GitHub acceptance run 41555310325. |
| Live agent behavior | Blocked | Requires secure credential configuration and an authorized allowance. |

## One-time owner action

Create repository Actions secret `MODEL_API_KEY` through GitHub's secure secret form. Never send the value in chat, source, an issue or a pull request.

https://github.com/aizoya/aizoya-meta-keyboard-journeys/settings/secrets/actions/new

Adding this secret does not trigger the smoke workflow. The new manual workflow is dormant on the draft branch; activation on the default branch and deliberate invocation remain pending. No automatic model request is added to push or pull-request checks.

## Concrete live check prepared

`node scripts/meta-smoke.mjs --check` inspects configuration without a network request. Actual execution requires the key, `PASSAGE_ENABLE_META=1` and exactly `PASSAGE_MAX_META_CALLS=1`. The script sends one request through the same transport used by the app, validates its action, and reports sanitized model/usage metadata. It makes no retries and uses a synthetic page observation. Passing this check proves transport/action handling only; a full browser agent run is a separate next check.

No spend was performed while preparing this checkpoint. A one-request quota is not an exact dollar cap.

## Primary documentation

- https://dev.meta.ai/docs/quickstart
- https://dev.meta.ai/docs/cookbook/structured-output
- https://dev.meta.ai/docs/structured-output

Public search verified the relevant documentation; account-specific project IDs returned in search were not reused as AIZOYA account evidence.
