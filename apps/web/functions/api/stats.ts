import type { PagesFunction } from "@cloudflare/workers-types";
import type { Env } from "../types";
import { getCurrentUser, jsonResponse } from "./_utils";

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

  const user = await getCurrentUser(env.DB, request);
  if (!user) {
    return jsonResponse({ error: "Unauthorized" }, 401);
  }

  const url = new URL(request.url);
  const days = parseInt(url.searchParams.get("days") || "7", 10);
  const since = Date.now() - days * 24 * 60 * 60 * 1000;

  // Total unique visits
  const totalResult = await env.DB.prepare(
    `SELECT COUNT(*) as count FROM visits WHERE created_at > ?`
  )
    .bind(since)
    .first<{ count: number }>();

  // Daily breakdown
  const dailyResult = await env.DB.prepare(
    `SELECT visit_date, COUNT(*) as count
     FROM visits
     WHERE created_at > ?
     GROUP BY visit_date
     ORDER BY visit_date ASC`
  )
    .bind(since)
    .all<{ visit_date: string; count: number }>();

  // Top pages
  const pagesResult = await env.DB.prepare(
    `SELECT path, COUNT(*) as count
     FROM visits
     WHERE created_at > ?
     GROUP BY path
     ORDER BY count DESC
     LIMIT 20`
  )
    .bind(since)
    .all<{ path: string; count: number }>();

  return jsonResponse({
    total: totalResult?.count || 0,
    daily: dailyResult.results || [],
    pages: pagesResult.results || [],
    days,
  });
};
