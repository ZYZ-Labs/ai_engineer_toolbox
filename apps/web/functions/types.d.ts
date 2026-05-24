/// <reference types="@cloudflare/workers-types" />

export interface Env {
  ASSETS: Fetcher;
  DB: D1Database;
  JWT_SECRET: string;
  COOKIE_DOMAIN?: string;
}

export interface User {
  id: number;
  username: string;
  is_admin: number;
  created_at: number;
}

export interface Session {
  id: string;
  user_id: number;
  expires_at: number;
  created_at: number;
}
