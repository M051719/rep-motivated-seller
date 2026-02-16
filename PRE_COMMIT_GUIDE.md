# Pre-commit Usage Guide

This repo ships a full pre-commit stack that blocks plaintext env files, runs secret scanners (gitleaks + detect-secrets), enforces linting/formatting, and checks commit messages for Conventional Commit style.

## Prerequisites

- Python 3.11+ (for pre-commit and detect-secrets)
- Node.js 20+ with repo dependencies installed (`npm ci`)
- Go 1.22+ (needed to build the gitleaks hook) and `gitleaks` available on PATH
- Deno 1.42+ (for Supabase Edge Functions fmt/lint)
- Optional: working TLS for pip; if pip TLS fails, point `PIP_CERT` at your root CA or run `python -m pip install --upgrade pip --trusted-host pypi.org --trusted-host files.pythonhosted.org pre-commit` from an elevated shell.

## One-time setup

1. Install tooling:

```
python -m pip install --upgrade pip pre-commit detect-secrets
```

2. Install git hooks (includes commit-msg):

```
pre-commit install
pre-commit install --hook-type commit-msg
```

3. Ensure scanners are available:

- Gitleaks: `gitleaks version` (download from https://github.com/gitleaks/gitleaks/releases if missing).
- Deno: `deno --version`.

## Baseline and first run

- If secrets change, refresh the baseline:

```
detect-secrets scan --baseline .secrets.baseline
```

- Run everything once to hydrate caches:

```
pre-commit run --all-files
```

## Day-to-day use

- Hooks run automatically on commit. For a quick check before pushing: `pre-commit run --all-files`.
- Update hook versions periodically: `pre-commit autoupdate` (then rerun all hooks and commit the updated config).
- Do **not** commit plaintext `.env*` files; the env blocker will fail. Use encrypted/vault variants instead.

## CI

GitHub Actions will run the same hooks via `.github/workflows/pre-commit.yml` on pushes and pull requests.

## History scans

For scanning only old git history (without touching current commits), follow [OLD_HISTORY_SECRET_SCAN_GUIDE.md](OLD_HISTORY_SECRET_SCAN_GUIDE.md).
