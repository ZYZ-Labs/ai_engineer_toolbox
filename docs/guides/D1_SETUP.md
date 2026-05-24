# D1 Database & Auth Setup Guide

## Overview

This project now uses **Cloudflare D1** for:
- **Visit tracking**: Page visits deduplicated by IP hash + date
- **User authentication**: Simple username/password login with session cookies
- **Access control**: Course pages require login

## Prerequisites

- Cloudflare account
- Wrangler CLI installed (`npm install -g wrangler`)
- Cloudflare API Token with Workers edit/deploy and `D1:Edit` permissions

## Step 1: Create D1 Database

```bash
wrangler d1 create ai-engineer-toolbox-db
```

Note the `database_id` from the output.

## Step 2: Update wrangler.jsonc

Edit `wrangler.jsonc` and replace `YOUR_DATABASE_ID` with the actual ID:

```jsonc
{
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "ai-engineer-toolbox-db",
      "database_id": "your-actual-database-id"
    }
  ]
}
```

## Step 3: Initialize Database Schema

```bash
wrangler d1 execute ai-engineer-toolbox-db --file=./scripts/init-db.sql
```

## Step 4: Create Admin User

```bash
node scripts/create-admin.mjs admin your-secure-password
```

Run the generated SQL:

```bash
wrangler d1 execute ai-engineer-toolbox-db --command="INSERT OR IGNORE INTO users ..."
```

## Step 5: Set GitHub Secrets

In your GitHub repository settings, add:

- `CLOUDFLARE_API_TOKEN` - Your Cloudflare API Token
- `CLOUDFLARE_ACCOUNT_ID` - Your Cloudflare Account ID

## Step 6: Deploy

Push to `main` or `master` branch. GitHub Actions will:
1. Build the Next.js static site
2. Deploy the Worker with Workers Static Assets
3. Bind D1 through the root `wrangler.jsonc`

If deploying from Cloudflare's own Worker build settings, use:

```txt
Root directory: /
Build command: npm run build
Build output directory: apps/web/out
Deploy command: npm run worker:deploy
```

`npm run pages:deploy` is kept as a compatibility alias for Cloudflare settings that were already changed during the Pages attempt; it now also runs `wrangler deploy`.

The Worker entry is `apps/web/functions/worker.ts`. It routes `/api/*` requests to the existing handlers under `apps/web/functions/api/` and serves all other requests from `apps/web/out` through the `ASSETS` binding.

For direct local CLI deployment:

```bash
npm run build
npm run worker:deploy
```

## Local Development

### Build and test with Workers

```bash
npm run build
npm run worker:dev
```

The local Worker dev server will be available at the URL printed by Wrangler.

### Local D1

Wrangler will automatically create a local D1 database. To initialize it:

```bash
npx wrangler d1 execute ai-engineer-toolbox-db --local --file=../../scripts/init-db.sql
```

## API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/visit` | POST | No | Record a page visit |
| `/api/stats` | GET | Yes | Get visit statistics |
| `/api/auth/login` | POST | No | Login with username/password |
| `/api/auth/logout` | POST | No | Clear session |
| `/api/auth/me` | GET | No | Get current user info |

## Security Notes

- **IP addresses are hashed** before storage (SHA-256)
- **Sessions use httpOnly cookies**
- **Passwords are hashed with salt** using SHA-256
- **CORS is restricted to the same origin**
- The `database_id` in `wrangler.jsonc` is safe to commit — it's just a resource identifier, not a credential

## Limitations

- This is **client-side protection**: Course content is still in the static HTML. A determined user could view the source.
- For stronger content protection, you would need to move content loading to the API layer (SSR or client-side fetch).
- For a personal/site project, this level of protection is usually sufficient.
