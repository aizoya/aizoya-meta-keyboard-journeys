# Three-minute demo — final recording script

Target **2:45–2:55** so the video stays safely under three minutes. Use the hosted application, real recorded evidence and the verified Meta run. Do not imply that the public demo is calling Meta live.

| Time | Screen action | Spoken draft |
| --- | --- | --- |
| 0:00–0:18 | Open https://meta.aizoya.com and show the fictional checkout. | A checkout can look complete with a mouse and still stop a keyboard customer. AIZOYA Keyboard Journeys makes the task inspectable: what the browser did, where focus moved and whether checkout finished. |
| 0:18–0:48 | Run **Check this journey** on Original control. | We run mouse and keyboard attempts in separate browser contexts. The keyboard executor may press only approved keys. It cannot click, fill controls directly or move focus with script. Completion comes from the store receipt, independently of the planner. |
| 0:48–1:12 | Show mouse complete, keyboard stopped, then inspect a captured step. | Here the mouse finishes and the bounded keyboard attempt stops. We show the exact actions and focused controls. This is evidence for review, not a claim that every possible keyboard route fails. |
| 1:12–1:33 | Select **Run the same check again**. | Saved actions replay in fresh browser contexts without another model request. Repeated observed outcomes make the finding reproducible. |
| 1:33–1:58 | Select **Check the corrected checkout** and show both routes complete. | After the control is corrected, both scripted routes finish. The successful keyboard route can be exported as a Playwright regression-test draft. |
| 1:58–2:20 | Open the six recorded examples and switch between Arrow-key and Focus-trap controls. | Keyboard operation is more than pressing Tab. The examples cover arrow-key radios, Space activation, changed tab order and a focus trap. |
| 2:20–2:42 | Show the verified Meta evidence line and GitHub Actions run 41721095171. | Muse Spark also completed the owned corrected keyboard fixture in five requests: Tab, Tab, Space, Tab, Space. The saved-action replay completed with zero additional model calls. Public Meta mode stays disabled to control cost. |
| 2:42–2:55 | Show evidence download and the public repository after release. | The result is an inspectable path from observed behavior to replay and regression evidence. Current scope is one owned practice store; it is not an accessibility certification. |

## Recording checklist

- Start from a fresh browser session.
- Keep the browser at a readable zoom; hide bookmarks and unrelated tabs.
- Confirm recorded examples are already selectable when opened.
- Use the scripted runner for the live screen recording so the result is deterministic and incurs no model request.
- Show the successful Meta evidence as a verified past run, with its exact one-fixture limitation.
- Confirm the final repository is public and the video plays without sign-in.
- Export at 1080p when practical and verify audio, captions, URLs and total duration before submission.
