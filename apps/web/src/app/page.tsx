"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { GlobalSearch } from "@/components/tools/GlobalSearch";
import { StudyCard } from "@/components/ui/StudyCard";
import { ToolCard } from "@/components/ui/ToolCard";
import { featuredTools, getToolsByCategory, tools, findToolByPath } from "@/lib/tool-registry";
import { getTopTools } from "@/lib/usage";
import { studyPages } from "@/lib/study-registry";
import { useI18n } from "@/lib/i18n";
import { translateTool } from "@/lib/i18n/tool";
import { translateStudyPage } from "@/lib/i18n/study";

export default function HomePage() {
  const { t } = useI18n();
  const topUsage = getTopTools();
  const recentlyUsed = topUsage.length
    ? topUsage.map((u) => findToolByPath(u.path)).filter(Boolean)
    : featuredTools.map((path) => tools.find((tool) => tool.path === path)).filter(Boolean);

  return (
    <PageShell>
      <section className="grid min-h-[calc(100vh-12rem)] content-center gap-10 py-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:py-14">
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 text-sm text-muted">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
            {t("home.badge")}
          </div>
          <h1 className="text-4xl font-semibold leading-tight text-ink sm:text-5xl lg:text-6xl">
            {t("home.title")}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
            {t("home.description")}
          </p>
          <div className="mt-8">
            <GlobalSearch />
          </div>
        </div>
        <div className="grid content-end gap-3">
          {recentlyUsed.slice(0, 4).map((tool) => (tool ? <ToolCard key={tool.path} tool={translateTool(tool, t)} /> : null))}
        </div>
      </section>

      <HomeSection title={t("home.section.recentlyUsed")} href="/tools">
        {recentlyUsed.map((tool) => (tool ? <ToolCard key={tool.path} tool={translateTool(tool, t)} /> : null))}
      </HomeSection>

      <HomeSection title={t("home.section.aiTools")} href="/tools">
        {getToolsByCategory("AI Engineering").map((tool) => (
          <ToolCard key={tool.path} tool={translateTool(tool, t)} />
        ))}
      </HomeSection>

      <HomeSection title={t("home.section.cryptoTools")} href="/tools">
        {getToolsByCategory("Crypto").map((tool) => (
          <ToolCard key={tool.path} tool={translateTool(tool, t)} />
        ))}
      </HomeSection>

      <HomeSection title={t("home.section.study")} href="/study">
        {studyPages.map((page) => (
          <StudyCard key={page.slug} page={translateStudyPage(page, t)} />
        ))}
      </HomeSection>

      <section className="py-12">
        <div className="rounded-spec border border-line bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-ink">{t("home.updates.title")}</h2>
          <div className="mt-4 grid gap-3 text-sm text-muted">
            <p>2026-05-20: {t("home.updates.v1")}</p>
            <p>2026-05-20: {t("home.updates.tools")}</p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function HomeSection({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  const { t } = useI18n();

  return (
    <section className="py-10">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-ink">{title}</h2>
        <Link href={href} className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
          {t("home.viewAll")}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
    </section>
  );
}
