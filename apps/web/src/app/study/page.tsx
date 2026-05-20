"use client";

import { PageShell } from "@/components/layout/PageShell";
import { StudyCard } from "@/components/ui/StudyCard";
import { studyPages } from "@/lib/study-registry";
import { useI18n } from "@/lib/i18n";
import { translateStudyPage } from "@/lib/i18n/study";

export default function StudyIndexPage() {
  const { t } = useI18n();

  return (
    <PageShell>
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase text-primary">{t("study.label")}</p>
        <h1 className="mt-3 text-4xl font-semibold text-ink">{t("study.title")}</h1>
        <p className="mt-4 text-lg leading-8 text-muted">{t("study.description")}</p>
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {studyPages.map((page) => (
          <StudyCard key={page.slug} page={translateStudyPage(page, t)} />
        ))}
      </div>
    </PageShell>
  );
}
