import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { StudyCard } from "@/components/ui/StudyCard";
import { studyPages } from "@/lib/study-registry";

export const metadata: Metadata = {
  title: "Study"
};

export default function StudyIndexPage() {
  return (
    <PageShell>
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase text-primary">Study</p>
        <h1 className="mt-3 text-4xl font-semibold text-ink">Roadmaps for practical AI engineering</h1>
        <p className="mt-4 text-lg leading-8 text-muted">
          Study notes focus on design decisions, implementation traps, and production habits rather than generic AI summaries.
        </p>
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        {studyPages.map((page) => (
          <StudyCard key={page.slug} page={page} />
        ))}
      </div>
    </PageShell>
  );
}
