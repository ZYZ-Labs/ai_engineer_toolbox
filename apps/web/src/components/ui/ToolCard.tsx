import Link from "next/link";
import type { ToolConfig } from "@/lib/tool-registry";

export function ToolCard({ tool }: { tool: ToolConfig }) {
  const Icon = tool.icon;

  return (
    <Link
      href={tool.path}
      className="group block rounded-spec border border-line bg-panel p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-soft"
    >
      <div className="flex items-start gap-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-ink">{tool.title}</span>
          <span className="mt-1 block text-sm leading-6 text-muted">{tool.summary}</span>
        </span>
      </div>
    </Link>
  );
}
