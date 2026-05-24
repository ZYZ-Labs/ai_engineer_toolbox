import type { Env, User } from "../types";

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export async function hashPassword(password: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function generateSalt(): string {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  return Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function generateToken(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return btoa(String.fromCharCode(...array));
}

export function getSessionCookie(request: Request): string | null {
  const cookie = request.headers.get("cookie");
  if (!cookie) return null;
  const match = cookie.match(/session=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

export async function getCurrentUser(db: D1Database, request: Request): Promise<User | null> {
  const token = getSessionCookie(request);
  if (!token) return null;

  const now = Date.now();
  const session = await db
    .prepare("SELECT * FROM sessions WHERE id = ? AND expires_at > ?")
    .bind(token, now)
    .first<{ user_id: number }>();

  if (!session) return null;

  const user = await db
    .prepare("SELECT id, username, is_admin, created_at FROM users WHERE id = ?")
    .bind(session.user_id)
    .first<User>();

  return user || null;
}

export function setSessionCookie(token: string, domain?: string): string {
  const expires = new Date(Date.now() + SESSION_DURATION_MS).toUTCString();
  let cookie = `session=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Strict; Expires=${expires}`;
  if (domain) {
    cookie += `; Domain=${domain}`;
  }
  return cookie;
}

export function clearSessionCookie(domain?: string): string {
  let cookie = `session=; Path=/; HttpOnly; Secure; SameSite=Strict; Expires=Thu, 01 Jan 1970 00:00:00 GMT`;
  if (domain) {
    cookie += `; Domain=${domain}`;
  }
  return cookie;
}

export function hashIp(ip: string): string {
  // Simple hash for IP anonymization
  // In production, CF-Connecting-IP header is available
  let hash = 0;
  for (let i = 0; i < ip.length; i++) {
    const char = ip.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return hash.toString(16);
}

export function jsonResponse(
  data: unknown,
  status = 200,
  extraHeaders?: Record<string, string>
): Response {
  const headers = new Headers({ "Content-Type": "application/json" });
  if (extraHeaders) {
    Object.entries(extraHeaders).forEach(([k, v]) => headers.set(k, v));
  }
  return new Response(JSON.stringify(data), { status, headers });
}
