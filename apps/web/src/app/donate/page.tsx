"use client";

import { PageShell } from "@/components/layout/PageShell";
import { useI18n } from "@/lib/i18n";

export default function DonatePage() {
  const { t } = useI18n();

  return (
    <PageShell>
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase text-primary">{t("donate.label")}</p>
        <h1 className="mt-3 text-4xl font-semibold text-ink">{t("donate.title")}</h1>
        <p className="mt-5 text-lg leading-8 text-muted">{t("donate.description")}</p>
      </div>
    </PageShell>
  );
}
