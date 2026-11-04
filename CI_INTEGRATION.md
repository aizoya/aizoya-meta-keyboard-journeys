# Reusable local-target CI integration

The hackathon product now includes a bounded integration contract for a team's own application. It does not accept public arbitrary URLs. The customer starts their application inside CI on loopback, marks the relevant controls and deterministic outcome, and runs the constrained keyboard planner against that local target.

## Page contract

Add stable attributes to the owned test page:

```html
<button data-journey-target="blue">Blue</button>
<button data-journey-target="finish">Add to cart</button>
<p data-journey-selected>Blue selected</p>
<p data-journey-complete="false" data-journey-outcome>Cart is empty</p>
```

When the task succeeds, application code changes `data-journey-complete` to `true`. That deterministic application state—not Muse Spark—decides completion.

Copy `examples/journey.config.json` into the customer repository and update its loopback URL and task. `node scripts/ci-target.mjs --config=journey.config.json --check` validates configuration without launching a browser or making a model request. The full command allows up to eight Meta requests and performs no automatic retry.

The runner permits only the keyboard keys defined in `policy.mjs`, blocks every network request outside the target's loopback origin, rejects credentials and non-local URLs, closes popups, dismisses dialogs, and exports an evidence JSON artifact. A bounded noncompletion returns `needs_review`; it is not a WCAG or accessibility certification.

See `examples/github-actions-keyboard-journey.yml` for a reproducible reference workflow in this repository. The current prototype is not published as a package: another repository must vendor `scripts/ci-target.mjs`, `target-contract.mjs`, `policy.mjs`, `meta.mjs` and the pinned Playwright dependency, then replace the reference startup command and URL with its owned test application.
