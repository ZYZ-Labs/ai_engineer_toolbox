import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { GlobalSearch } from "@/components/tools/GlobalSearch";
import { StudyCard } from "@/components/ui/StudyCard";
import { ToolCard } from "@/components/ui/ToolCard";
import { featuredTools, getToolsByCategory, tools } from "@/lib/tool-registry";
import { studyPages } from "@/lib/study-registry";

export default function HomePage() {
  const featured = featuredTools.map((path) => tools.find((tool) => tool.path === path)).filter(Boolean);

  return (
    <PageShell>
      <section className="grid min-h-[calc(100vh-12rem)] content-center gap-10 py-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:py-14">
        <div className="max-w-3xl">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1.5 text-sm text-muted">
            <Sparkles className="h-4 w-4 text-primary" aria-hidden="true" />
            Local-first engineering workstation
          </div>
          <h1 className="text-4xl font-semibold leading-tight text-ink sm:text-5xl lg:text-6xl">
            AI Engineer Toolbox
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
            A focused collection of browser-side tools and study pages for AI application engineers who work with prompts,
            payloads, streaming APIs, retrieval systems, and integration security.
          </p>
          <div className="mt-8">
            <GlobalSearch />
          </div>
        </div>
        <div className="grid content-end gap-3">
          {featured.map((tool) => (tool ? <ToolCard key={tool.path} tool={tool} /> : null))}
        </div>
      </section>

      <HomeSection title="Featured Tools" href="/tools">
        {featured.map((tool) => (tool ? <ToolCard key={tool.path} tool={tool} /> : null))}
      </HomeSection>

      <HomeSection title="AI Tools" href="/tools">
        {getToolsByCategory("AI Engineering").map((tool) => (
          <ToolCard key={tool.path} tool={tool} />
        ))}
      </HomeSection>

      <HomeSection title="Crypto Tools" href="/tools">
        {getToolsByCategory("Crypto").map((tool) => (
          <ToolCard key={tool.path} tool={tool} />
        ))}
      </HomeSection>

      <HomeSection title="Study" href="/study">
        {studyPages.map((page) => (
          <StudyCard key={page.slug} page={page} />
        ))}
      </HomeSection>

      <section className="py-12">
        <div className="rounded-spec border border-line bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-ink">Recent Updates</h2>
          <div className="mt-4 grid gap-3 text-sm text-muted">
            <p>2026-05-20: v1 implementation with static export, GitHub Pages workflow, and custom domain support.</p>
            <p>2026-05-20: Added local browser tools for crypto, JSON, Base64, URL, SSE, messages, prompts, and token estimation.</p>
          </div>
        </div>
      </section>
    </PageShell>
  );
}

function HomeSection({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return (
    <section className="py-10">
      <div className="mb-5 flex items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-ink">{title}</h2>
        <Link href={href} className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
          View all
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
    </section>
  );
}
