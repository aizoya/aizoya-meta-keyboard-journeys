# Meta connection checkpoint

Verified November 3, 2026 Pacific. No credential is stored in source.

| Capability | Status | Evidence |
| --- | --- | --- |
| GitHub Actions credential | Configured; value never read | Manual workflows reached the Meta Model API |
| Transport and structured output | Verified | Run 41719145398 produced one valid allowlisted action |
| Keyboard agent workflow | Verified on one owned fixed fixture | Run 41721095171 |
| Saved-action replay | Verified with no added model call | Run 41721095171 |
| Hosted public Meta mode | Disabled | Vercel uses PASSAGE_ENABLE_META=0 and PASSAGE_MAX_META_CALLS=0 |
| Credits/billing balance | Not independently verified | Do not infer the provider bill from request counts |

## Successful bounded workflow

GitHub Actions run [41721095171](https://github.com/aizoya/aizoya-meta-keyboard-journeys/actions/runs/41721095171) used Muse Spark 1.3 on the owned corrected fixture, keyboard lane only.

- Five requests reserved; no automatic retries.
- Actions: Tab, Tab, Space, Tab, Space.
- Deterministic receipt: Blue organizer added; practice task complete.
- Saved-action replay completed without another model request.
- The artifact contains result JSON plus final keyboard and replay frames.

This verifies one owned corrected keyboard workflow. It does not verify mouse planning, the other variants, arbitrary websites, public judge inference or a global spend cap.

## Secure operation

The key remains only in GitHub Actions secrets and is never placed in source, chat, issues, pull requests, artifacts or browser fields. Both Meta workflows are manual-only and have finite request allowances. Do not invoke them again without a new explicit allowance.

The hosted application intentionally keeps live Meta disabled. Its scripted mode and recorded examples make no model request.
