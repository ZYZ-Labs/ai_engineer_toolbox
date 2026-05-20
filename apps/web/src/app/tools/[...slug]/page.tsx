import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { ToolWorkbench } from "@/components/tools/ToolWorkbench";
import { findToolByPath, getToolStaticParams } from "@/lib/tool-registry";

type Props = {
  params: Promise<{
    slug: string[];
  }>;
};

export function generateStaticParams() {
  return getToolStaticParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = findToolByPath(`/tools/${slug.join("/")}`);
  return {
    title: tool?.title || "Tool"
  };
}

export default async function ToolPage({ params }: Props) {
  const { slug } = await params;
  const tool = findToolByPath(`/tools/${slug.join("/")}`);

  if (!tool) {
    notFound();
  }

  const { icon: Icon, ...workbenchTool } = tool;

  return (
    <PageShell>
      <div className="mb-8 flex max-w-4xl items-start gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-spec bg-primary text-white">
          <Icon className="h-6 w-6" aria-hidden="true" />
        </span>
        <div>
          <p className="text-sm font-semibold uppercase text-primary">{tool.category}</p>
          <h1 className="mt-2 text-4xl font-semibold text-ink">{tool.title}</h1>
          <p className="mt-3 text-lg leading-8 text-muted">{tool.summary}</p>
        </div>
      </div>

      <ToolWorkbench tool={workbenchTool} />

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-spec border border-line bg-panel p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-ink">Explanation</h2>
          <p className="mt-3 text-sm leading-7 text-muted">{tool.explanation}</p>
        </div>
        <div className="rounded-spec border border-line bg-panel p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-ink">Security Notice</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            {tool.notice ||
              "All processing happens locally in your browser whenever possible. Your data is not uploaded unless explicitly stated."}
          </p>
        </div>
      </section>
    </PageShell>
  );
}
