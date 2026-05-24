import type { PagesFunction } from "@cloudflare/workers-types";
import type { Env } from "../types";
import { hashIp, jsonResponse } from "./_utils";

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  try {
    const body = (await request.json()) as { path?: string };
    const path = body.path || "/";

    // Get client IP from CF header or fallback
    const ip = request.headers.get("CF-Connecting-IP") || "unknown";
    const ipHash = hashIp(ip);
    const userAgent = request.headers.get("User-Agent") || "";

    const now = Date.now();
    const visitDate = new Date(now).toISOString().slice(0, 10); // YYYY-MM-DD

    // Upsert: ignore duplicate visits from same IP on same day for same path
    await env.DB.prepare(
      `INSERT OR IGNORE INTO visits (path, ip_hash, user_agent, visit_date, created_at)
       VALUES (?, ?, ?, ?, ?)`
    )
      .bind(path, ipHash, userAgent.slice(0, 512), visitDate, now)
      .run();

    return jsonResponse({ success: true });
  } catch {
    return jsonResponse({ success: true }); // fail silently for tracking
  }
};
