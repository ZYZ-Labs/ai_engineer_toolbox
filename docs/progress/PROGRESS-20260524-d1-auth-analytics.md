# PROGRESS-20260524-d1-auth-analytics

## Current Status

- D1 database integration, visit tracking, and auth system have been implemented.
- Deployment target changed from static Pages-style hosting to **Cloudflare Workers** with Workers Static Assets and D1.
- Course pages are public. Login is only kept as a hidden admin entry for detailed statistics.
- Cloudflare deployment failures at `2026-05-24 14:08:29` and `14:23:22` were traced to a target mismatch: the Cloudflare project is a Worker, not Pages.

## Recent Key Conclusions

- Cloudflare D1 binding added to `wrangler.jsonc`.
- Database schema includes `visits`, `users`, and `sessions` tables.
- Six Pages-compatible API handlers created under `apps/web/functions/api/` and reused by the Worker entry:
  - `POST /api/visit` — deduplicated visit tracking (IP hash + date)
  - `GET /api/stats` — admin-only visit statistics
  - `POST /api/auth/login` — username/password login with session cookie
  - `POST /api/auth/logout` — clear session
  - `GET /api/auth/me` — current user info
- Frontend auth entry: hidden login page at `/login`.
- `VisitTracker` component reports page views on every route change via `usePathname`.
- Public aggregate stats endpoint added at `GET /api/stats/public`.
- Homepage now displays total visits, today's visits, unique visitors, and a 7-day daily chart.
- GitHub Actions workflow updated to deploy to Cloudflare Workers using `wrangler deploy`.
- Admin user creation script at `scripts/create-admin.mjs`.
- Setup guide written at `docs/guides/D1_SETUP.md`.
- Root Worker deployment scripts added. `pages:deploy` is retained as a compatibility alias but now runs `wrangler deploy`.
- Worker entry added at `apps/web/functions/worker.ts`; it routes API requests and serves static assets through `env.ASSETS`.
- Login success now returns to the homepage instead of automatically navigating to `/study`.
- Changelog page now includes the 2026-05-24 Worker/D1/auth update.
- Header login button and client-side course protection components were removed; `/login` remains directly accessible for admin use.
- Beginner study courses are now available as public static pages:
  - `/study/git-basics`
  - `/study/godot-basics` (Godot 4.6.3 baseline)
  - `/study/unity-basics` (Unity 6.3 LTS baseline)
  - `/study/unreal-basics` (Unreal Engine 5.7 baseline)
- Beginner study courses passed static build validation on 2026-06-04.

## Next Actions

1. Run `wrangler d1 execute` to apply `scripts/init-db.sql`.
2. Run `scripts/create-admin.mjs` to create an admin user.
3. Add `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` to GitHub repository secrets if using GitHub Actions deployment.
4. In Cloudflare Worker build settings, use path `/`, `npm run build` as the build command, and `npm run worker:deploy` as the deploy command. Leave the non-production deploy command at Cloudflare's locked default if it cannot be changed.
5. Push to `main`/`master` to trigger Cloudflare Workers deployment.
6. Verify login and course access on the deployed site.
7. Verify new beginner study routes after deployment.

## Blockers

- Cloudflare API Token and Account ID not yet added to GitHub secrets.
- Cloudflare dashboard must run the build before `wrangler deploy`; otherwise `apps/web/out` will be missing.

## Unverified Risks

- CORS behavior between static assets and Functions in production needs verification.
- Session cookies over HTTPS with custom domain need real deployment test.
- Client-side protection means course HTML is still in the static bundle; this is acceptable for a personal site but not true content secrecy.
