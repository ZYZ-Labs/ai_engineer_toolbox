"use client";

import { PageShell } from "@/components/layout/PageShell";
import { ToolWorkbench } from "@/components/tools/ToolWorkbench";
import { useI18n } from "@/lib/i18n";
import { translateTool, translateCategory } from "@/lib/i18n/tool";
import { findToolByPath } from "@/lib/tool-registry";

type Props = {
  toolPath: string;
};

export function ToolPageClient({ toolPath }: Props) {
  const { t } = useI18n();
  const tool = findToolByPath(toolPath);
  if (!tool) return null;

  const localized = translateTool(tool, t);
  const { icon: Icon, ...workbenchTool } = localized;

  return (
    <PageShell>
      <div className="mb-8 flex max-w-4xl items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-spec bg-primary text-white">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-semibold uppercase text-primary">{translateCategory(tool.category, t)}</p>
          <h1 className="mt-2 text-4xl font-semibold text-ink">{localized.title}</h1>
          <p className="mt-3 text-lg leading-8 text-muted">{localized.summary}</p>
        </div>
      </div>

      <ToolWorkbench tool={workbenchTool} />

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-spec border border-line bg-panel p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-ink">{t("tool.explanation")}</h2>
          <p className="mt-3 text-sm leading-7 text-muted">{localized.explanation}</p>
        </div>
        <div className="rounded-spec border border-line bg-panel p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-ink">{t("tool.securityNotice")}</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            {localized.notice || t("tool.defaultNotice")}
          </p>
        </div>
      </section>
    </PageShell>
  );
}
