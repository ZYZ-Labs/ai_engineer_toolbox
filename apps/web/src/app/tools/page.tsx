"use client";

import { PageShell } from "@/components/layout/PageShell";
import { ToolCard } from "@/components/ui/ToolCard";
import { getToolsByCategory } from "@/lib/tool-registry";
import { useI18n } from "@/lib/i18n";
import { translateTool, translateCategory } from "@/lib/i18n/tool";

const categories = ["AI Engineering", "Crypto", "Data"] as const;

export default function ToolsPage() {
  const { t } = useI18n();

  return (
    <PageShell>
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase text-primary">{t("tools.label")}</p>
        <h1 className="mt-3 text-4xl font-semibold text-ink">{t("tools.title")}</h1>
        <p className="mt-4 text-lg leading-8 text-muted">{t("tools.description")}</p>
      </div>

      <div className="mt-10 space-y-12">
        {categories.map((category) => (
          <section key={category}>
            <h2 className="mb-5 text-2xl font-semibold text-ink">{translateCategory(category, t)}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {getToolsByCategory(category).map((tool) => (
                <ToolCard key={tool.path} tool={translateTool(tool, t)} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
