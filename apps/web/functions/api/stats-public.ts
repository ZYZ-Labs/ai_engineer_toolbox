import type { PagesFunction } from "@cloudflare/workers-types";
import type { Env } from "../types";
import { jsonResponse } from "./_utils";

type CountResult = { count: number };
type DailyResult = { visit_date: string; count: number };

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env } = context;
  const today = new Date().toISOString().slice(0, 10);
  const since = Date.now() - 7 * 24 * 60 * 60 * 1000;

  const [totalResult, todayResult, visitorResult, dailyResult] = await Promise.all([
    env.DB.prepare("SELECT COUNT(*) as count FROM visits").first<CountResult>(),
    env.DB.prepare("SELECT COUNT(*) as count FROM visits WHERE visit_date = ?").bind(today).first<CountResult>(),
    env.DB.prepare("SELECT COUNT(DISTINCT ip_hash) as count FROM visits").first<CountResult>(),
    env.DB.prepare(
      `SELECT visit_date, COUNT(*) as count
       FROM visits
       WHERE created_at > ?
       GROUP BY visit_date
       ORDER BY visit_date ASC`
    )
      .bind(since)
      .all<DailyResult>(),
  ]);

  return jsonResponse({
    total: totalResult?.count || 0,
    today: todayResult?.count || 0,
    visitors: visitorResult?.count || 0,
    daily: dailyResult.results || [],
  });
};
