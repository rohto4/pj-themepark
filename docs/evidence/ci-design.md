# CI design evidence

Recorded: 2026-08-01 JST  
Scope: local workflow design and structural validation only. No GitHub workflow run, deployment, secret, or API write was performed.

## Implemented workflow contract

- `.github/workflows/ci.yml` runs on pushes to `main` and pull requests targeting `main`.
- The only declared `GITHUB_TOKEN` scope is `contents: read`; GitHub documents that unspecified scopes become `none`.
- The concurrency group combines the workflow name and ref, with `cancel-in-progress: true`, so a newer run for the same workflow/ref replaces an earlier in-progress run.
- `actions/setup-node@v7` receives the fixed `node-version: '24'`, the repository's declared Node major, and uses npm cache data keyed by `package-lock.json`.
- The job performs `npm ci`, installs only Playwright Chromium plus its Linux dependencies, then runs the repository's complete `npm run check` command. That command already includes format, lint, typecheck, Vitest, production build, and Playwright E2E checks.
- `actions/upload-artifact@v7` runs only after the `npm run check` step fails. The current official action supports multiple paths and `if-no-files-found: ignore`, so missing Playwright output cannot mask the original failure. The generated artifact name is unique per run attempt and expires after seven days.
- The workflow contains no deployment step, token input, secret reference, registry configuration, or authenticated external service integration.

## Official primary sources accessed 2026-08-01 JST

- [actions/checkout v7.0.1 latest release](https://github.com/actions/checkout/releases/tag/v7.0.1)
- [actions/setup-node v7.0.0 latest release](https://github.com/actions/setup-node/releases/tag/v7.0.0) and its [official README](https://github.com/actions/setup-node)
- [actions/upload-artifact v7.0.1 latest release](https://github.com/actions/upload-artifact/releases/tag/v7.0.1) and its [official README](https://github.com/actions/upload-artifact)
- [GitHub Actions permissions syntax](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax)
- [GitHub Actions concurrency control](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-workflow-concurrency)
- [GitHub Actions status-check expressions](https://docs.github.com/en/actions/reference/workflows-and-actions/expressions)
- [Playwright CI guidance](https://playwright.dev/docs/ci) and [browser installation guidance](https://playwright.dev/docs/browsers)

The action READMEs use the maintained `@v7` major references. At the recorded access time, the corresponding latest releases were checkout `v7.0.1`, setup-node `v7.0.0`, and upload-artifact `v7.0.1`.

## Local validation

- Passed: the repository's existing Prettier 3.9.6 parsed and format-checked `.github/workflows/ci.yml` and this evidence file with `./node_modules/.bin/prettier.cmd --check .github/workflows/ci.yml docs/evidence/ci-design.md`.
- Passed: a read-only local structural assertion confirmed the workflow's trigger, permission, action references, Node version, cache inputs, commands, concurrency fields, failure condition, artifact paths, and retention field.
- Not locally runnable: a GitHub-hosted Ubuntu runner is required to observe Node/tool-cache resolution, npm-cache restore/save, Linux dependency provisioning for Playwright, the complete CI environment, cancellation behavior, and artifact upload. These remain unverified until a push or pull request starts the workflow.

## First hosted observation

- Run: [CI #30647701455](https://github.com/rohto4/pj-themepark/actions/runs/30647701455)
- Commit: `85247a1488cf51c0eb5ba39366965b5f46d1ba30`
- Observed: `completed` / `success`, 2026-08-01 01:34–01:36 JST.
- No rerun, workflow mutation, or failure diagnosis was needed.
