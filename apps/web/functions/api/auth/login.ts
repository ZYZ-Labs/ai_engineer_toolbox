import type { PagesFunction } from "@cloudflare/workers-types";
import type { Env } from "../../types";
import {
  hashPassword,
  generateToken,
  setSessionCookie,
  jsonResponse,
} from "../_utils";

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const body = (await request.json()) as { username?: string; password?: string };
    const { username, password } = body;

    if (!username || !password) {
      return jsonResponse({ error: "Username and password required" }, 400);
    }

    const user = await env.DB.prepare(
      "SELECT id, username, password_hash, salt, is_admin FROM users WHERE username = ?"
    )
      .bind(username)
      .first<{ id: number; username: string; password_hash: string; salt: string; is_admin: number }>();

    if (!user) {
      return jsonResponse({ error: "Invalid credentials" }, 401);
    }

    const hashed = await hashPassword(password, user.salt);
    if (hashed !== user.password_hash) {
      return jsonResponse({ error: "Invalid credentials" }, 401);
    }

    // Create session
    const token = generateToken();
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000;

    await env.DB.prepare(
      "INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)"
    )
      .bind(token, user.id, expiresAt, Date.now())
      .run();

    return jsonResponse(
      {
        user: {
          id: user.id,
          username: user.username,
          is_admin: user.is_admin,
        },
      },
      200,
      {
        "Set-Cookie": setSessionCookie(token, env.COOKIE_DOMAIN),
      }
    );
  } catch {
    return jsonResponse({ error: "Login failed" }, 500);
  }
};
