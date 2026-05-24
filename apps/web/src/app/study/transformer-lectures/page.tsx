import Link from "next/link";
import type { Metadata } from "next";
import { BookOpenText, Code2 } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { transformerLectureStages } from "@/lib/courses/transformer-lectures";

export const metadata: Metadata = {
  title: "Transformer Lectures"
};

export default function TransformerLecturesPage() {
  const totalChapters = transformerLectureStages.reduce((sum, stage) => sum + stage.chapters.length, 0);

  return (
    <PageShell>
      <div className="max-w-4xl">
        <p className="text-sm font-semibold uppercase text-primary">Course</p>
        <h1 className="mt-3 text-4xl font-semibold text-ink">Transformer Complete Learning Path</h1>
        <p className="mt-4 text-lg leading-8 text-muted">
          A bilingual 30-chapter course from tensor basics to Transformer internals, diffusion, source reading, and model hacking.
        </p>
        <div className="mt-5 flex flex-wrap gap-3 text-sm text-muted">
          <span className="rounded-full border border-line bg-white px-3 py-1.5">{totalChapters} lectures</span>
          <span className="rounded-full border border-line bg-white px-3 py-1.5">30 Python examples</span>
          <span className="rounded-full border border-line bg-white px-3 py-1.5">Chinese + English</span>
        </div>
      </div>

      <div className="mt-10 space-y-8">
        {transformerLectureStages.map((stage) => (
          <section key={stage.slug} className="rounded-spec border border-line bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-primary">Stage {stage.number} / {stage.duration}</p>
                <h2 className="mt-2 text-2xl font-semibold text-ink">{stage.title}</h2>
                <p className="mt-1 text-sm text-muted">{stage.titleEn}</p>
              </div>
              <span className="text-sm text-muted">{stage.chapters.length} chapters</span>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {stage.chapters.map((chapter) => (
                <Link
                  key={chapter.slug}
                  href={`/study/transformer-lectures/${chapter.stage}/${chapter.slug}`}
                  className="group rounded-xl border border-line bg-canvas p-4 transition hover:border-primary/40 hover:bg-primary-soft"
                >
                  <span className="flex items-start gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-primary">
                      <BookOpenText className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-ink">Chapter {chapter.number}: {chapter.title}</span>
                      <span className="mt-1 block text-sm leading-6 text-muted">{chapter.titleEn}</span>
                      {chapter.exampleFile ? (
                        <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-primary">
                          <Code2 className="h-3.5 w-3.5" aria-hidden="true" />
                          Python example included
                        </span>
                      ) : null}
                    </span>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </PageShell>
  );
}
