# GitHub Actions workflows

Arena's GitHub App does not have the `workflows` permission, so these
files could not be pushed directly to `.github/workflows/`.

To activate CI (30 seconds, GitHub web UI):
1. Open this repo → **Add file → Create new file**
2. Name it `.github/workflows/ci.yml` and paste the contents of `ci.yml` from this folder
3. (Optional, Render only) repeat for `keep-alive.yml`

`ci.yml` runs on every push to master and every PR: Prisma schema
validation, type-check, lint, production build, and the full end-to-end
workflow smoke test (`scripts/smoke-test.mjs`) against a Postgres service.

It replaces the old "python script" workflow that committed a timestamp
to `updates.txt` every 5 minutes. If that old workflow is still present
in `.github/workflows/main.yml`, delete it in the same visit.

`keep-alive.yml` is optional and does nothing unless you set the repo
variable `RENDER_APP_URL` (Settings → Secrets and variables → Actions →
Variables). Not needed on Vercel.
