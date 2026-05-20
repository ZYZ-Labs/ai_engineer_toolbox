import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { ToolCard } from "@/components/ui/ToolCard";
import { getToolsByCategory } from "@/lib/tool-registry";

export const metadata: Metadata = {
  title: "Tools"
};

const categories = ["AI Engineering", "Crypto", "Data"] as const;

export default function ToolsPage() {
  return (
    <PageShell>
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase text-primary">Tools</p>
        <h1 className="mt-3 text-4xl font-semibold text-ink">Local browser tools for engineering work</h1>
        <p className="mt-4 text-lg leading-8 text-muted">
          Focused utilities for payload inspection, AI API debugging, compatibility checks, and privacy-preserving data transforms.
        </p>
      </div>

      <div className="mt-10 space-y-12">
        {categories.map((category) => (
          <section key={category}>
            <h2 className="mb-5 text-2xl font-semibold text-ink">{category}</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {getToolsByCategory(category).map((tool) => (
                <ToolCard key={tool.path} tool={tool} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
