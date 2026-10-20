# Deployment and reload notes

The root app now restores the session once in the global App Router layout, so direct page visits and browser refreshes use the same authentication bootstrap. An anonymous visitor's expected `401` from `/api/auth/refresh-token` clears stale in-memory auth state only; it must not call the normal `logout()` action because that action navigates to `/` and causes a reload loop.

## Vercel + Supabase

Follow the current, step-by-step instructions in [`README.md`](./README.md#vercel--supabase-recommended). In short:

- Configure Supabase PostgreSQL connection URLs and Supabase Storage in Vercel environment variables.
- Set independent production values for `JWT_SECRET`, `JWT_REFRESH_SECRET`, and `CERT_SECRET`.
- Apply Prisma schema changes explicitly from a trusted environment; deployment builds do not run `db push` or mutate the database.
- Keep uploaded photos and generated certificates in Supabase Storage because Vercel's filesystem is ephemeral.

## Quick checks

- `GET /` should render for visitors who have no account or refresh cookie.
- Refreshing a public page must not navigate repeatedly or erase a valid session.
- `GET /api/health` checks database connectivity; configure `DATABASE_URL` and `DIRECT_URL` before using it as a deployment health check.
- If authentication or data APIs fail, inspect Vercel function logs and confirm the Supabase connection and JWT environment variables are present.
