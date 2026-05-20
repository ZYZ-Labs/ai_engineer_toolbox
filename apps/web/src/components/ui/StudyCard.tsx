import Link from "next/link";
import { BookOpenText } from "lucide-react";
import type { StudyPageMeta } from "@/lib/study-registry";

export function StudyCard({ page }: { page: StudyPageMeta }) {
  return (
    <Link
      href={`/study/${page.slug}`}
      className="group block rounded-spec border border-line bg-panel p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/35 hover:shadow-soft"
    >
      <div className="flex items-start gap-4">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
          <BookOpenText className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-ink">{page.title}</span>
          <span className="mt-1 block text-sm leading-6 text-muted">{page.summary}</span>
          <span className="mt-3 flex gap-2 text-xs text-muted">
            <span>{page.level}</span>
            <span aria-hidden="true">/</span>
            <span>{page.readingTime}</span>
          </span>
        </span>
      </div>
    </Link>
  );
}
