"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { tools } from "@/lib/tool-registry";
import { studyPages } from "@/lib/study-registry";

const entries = [
  ...tools.map((tool) => ({ title: tool.title, summary: tool.summary, href: tool.path, type: tool.category })),
  ...studyPages.map((page) => ({ title: page.title, summary: page.summary, href: `/study/${page.slug}`, type: "Study" }))
];

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const results = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return entries.slice(0, 6);
    return entries
      .filter((entry) => `${entry.title} ${entry.summary} ${entry.type}`.toLowerCase().includes(normalized))
      .slice(0, 8);
  }, [query]);

  return (
    <div className="relative w-full max-w-2xl">
      <Search className="pointer-events-none absolute left-4 top-3.5 h-5 w-5 text-muted" aria-hidden="true" />
      <input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="h-12 w-full rounded-spec border border-line bg-white pl-12 pr-4 text-sm text-ink shadow-sm outline-none transition placeholder:text-muted/70 focus:border-primary focus:ring-4 focus:ring-primary/10"
        placeholder="Search AES, JSON, SSE, RAG..."
        aria-label="Global search"
      />
      <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-spec border border-line bg-white shadow-soft">
        {results.map((entry) => (
          <Link
            key={entry.href}
            href={entry.href}
            className="block border-b border-line px-4 py-3 last:border-b-0 hover:bg-primary-soft"
          >
            <span className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-ink">{entry.title}</span>
              <span className="shrink-0 rounded-full bg-canvas px-2.5 py-1 text-xs text-muted">{entry.type}</span>
            </span>
            <span className="mt-1 block text-sm text-muted">{entry.summary}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
