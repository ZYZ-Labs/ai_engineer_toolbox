# D1 Database & Auth Setup Guide

## Overview

This project now uses **Cloudflare D1** for:
- **Visit tracking**: Page visits deduplicated by IP hash + date
- **User authentication**: Simple username/password login with session cookies
- **Access control**: Course pages require login

## Prerequisites

- Cloudflare account
- Wrangler CLI installed (`npm install -g wrangler`)
- Cloudflare API Token with `Cloudflare Pages:Edit` and `D1:Edit` permissions

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
2. Copy Functions to the output directory
3. Deploy to Cloudflare Pages

## Local Development

### Build and test with Pages Functions

```bash
cd apps/web
npm run build
cp -r functions out/functions
npx wrangler pages dev out --compatibility-date=2026-05-22
```

The local dev server will be available at `http://localhost:8788`.

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
