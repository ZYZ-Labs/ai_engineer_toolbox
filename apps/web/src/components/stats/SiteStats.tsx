"use client";

import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { BarChart3, CalendarDays, UsersRound } from "lucide-react";
import { fetchPublicStats, type PublicStats } from "@/lib/stats";
import { useI18n } from "@/lib/i18n";

export function SiteStats() {
  const { t } = useI18n();
  const [stats, setStats] = useState<PublicStats | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetchPublicStats().then((data) => {
      if (!cancelled) setStats(data);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const peak = useMemo(() => {
    return Math.max(...(stats?.daily.map((item) => item.count) || []), 1);
  }, [stats]);

  if (!stats) {
    return null;
  }

  return (
    <section className="py-10">
      <div className="mb-5">
        <h2 className="text-2xl font-semibold text-ink">{t("home.stats.title")}</h2>
        <p className="mt-2 text-sm text-muted">{t("home.stats.description")}</p>
      </div>
      <div className="grid gap-4 lg:grid-cols-[repeat(3,minmax(0,1fr))_minmax(16rem,1.2fr)]">
        <StatItem icon={<BarChart3 className="h-5 w-5" />} label={t("home.stats.total")} value={stats.total} />
        <StatItem icon={<CalendarDays className="h-5 w-5" />} label={t("home.stats.today")} value={stats.today} />
        <StatItem icon={<UsersRound className="h-5 w-5" />} label={t("home.stats.visitors")} value={stats.visitors} />
        <div className="rounded-spec border border-line bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-sm font-semibold text-ink">{t("home.stats.last7")}</h3>
            <span className="text-xs text-muted">{t("home.stats.dailyUnit")}</span>
          </div>
          <div className="mt-4 flex h-20 items-end gap-2">
            {stats.daily.length ? (
              stats.daily.map((item) => (
                <div key={item.visit_date} className="flex min-w-0 flex-1 flex-col items-center gap-2">
                  <div
                    className="w-full rounded-t-md bg-primary/80"
                    style={{ height: `${Math.max(8, (item.count / peak) * 72)}px` }}
                    title={`${item.visit_date}: ${item.count}`}
                  />
                  <span className="max-w-full truncate text-[10px] text-muted">{item.visit_date.slice(5)}</span>
                </div>
              ))
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-muted">{t("home.stats.noData")}</div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function StatItem({ icon, label, value }: { icon: ReactNode; label: string; value: number }) {
  return (
    <div className="rounded-spec border border-line bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-muted">{label}</p>
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-soft text-primary">{icon}</span>
      </div>
      <p className="mt-4 text-3xl font-semibold text-ink">{value.toLocaleString()}</p>
    </div>
  );
}
