"use client";

import { PageShell } from "@/components/layout/PageShell";
import { useI18n } from "@/lib/i18n";

export default function AboutPage() {
  const { t } = useI18n();

  return (
    <PageShell>
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase text-primary">{t("about.label")}</p>
        <h1 className="mt-3 text-4xl font-semibold text-ink">{t("about.title")}</h1>
        <div className="mt-6 space-y-5 text-lg leading-8 text-muted">
          <p>{t("about.p1")}</p>
          <p>{t("about.p2")}</p>
        </div>
      </div>
    </PageShell>
  );
}
