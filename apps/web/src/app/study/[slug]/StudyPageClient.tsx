"use client";

import { PageShell } from "@/components/layout/PageShell";
import { MarkdownRenderer } from "@/components/study/MarkdownRenderer";
import { useI18n } from "@/lib/i18n";
import { translateStudyPage } from "@/lib/i18n/study";
import type { StudyPageMeta } from "@/lib/study-registry";

type Props = {
  page: StudyPageMeta;
  source: string;
};

export function StudyPageClient({ page, source }: Props) {
  const { t } = useI18n();
  const localized = translateStudyPage(page, t);

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl rounded-spec border border-line bg-white p-6 shadow-sm sm:p-8">
        <p className="mb-4 text-sm font-semibold uppercase text-primary">
          {localized.level} / {localized.readingTime}
        </p>
        <MarkdownRenderer source={source} />
      </div>
    </PageShell>
  );
}
