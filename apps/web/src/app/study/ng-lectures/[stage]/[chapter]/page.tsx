import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, Code2 } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { MarkdownRenderer } from "@/components/study/MarkdownRenderer";
import {
  findLectureChapter,
  getLectureStaticParams,
  readLectureExample,
  readLectureMarkdown,
  ngLectureChapters
} from "@/lib/courses/ng-lectures";

type Props = {
  params: Promise<{
    stage: string;
    chapter: string;
  }>;
};

export function generateStaticParams() {
  return getLectureStaticParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { stage, chapter } = await params;
  const lecture = findLectureChapter(stage, chapter);
  return {
    title: lecture ? `Chapter ${lecture.number}: ${lecture.titleEn}` : "Andrew Ng Lecture"
  };
}

export default async function NgLecturePage({ params }: Props) {
  const { stage, chapter } = await params;
  const lecture = findLectureChapter(stage, chapter);
  if (!lecture) notFound();

  const source = await readLectureMarkdown(lecture);
  const example = await readLectureExample(lecture);
  const currentIndex = ngLectureChapters.findIndex((item) => item.stage === stage && item.slug === chapter);
  const previous = ngLectureChapters[currentIndex - 1];
  const next = ngLectureChapters[currentIndex + 1];

  return (
    <PageShell>
      <div className="mb-6">
        <Link href="/study/ng-lectures" className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to course
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 rounded-spec border border-line bg-white p-6 shadow-sm sm:p-8">
          <p className="mb-4 text-sm font-semibold uppercase text-primary">Stage {lecture.stage.replace("stage", "")} / Chapter {lecture.number}</p>
          <MarkdownRenderer source={source} />
        </div>

        <aside className="space-y-4">
          <div className="rounded-spec border border-line bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-ink">Lecture Navigation</h2>
            <div className="mt-4 grid gap-2 text-sm">
              {previous ? (
                <Link className="rounded-xl border border-line px-3 py-2 text-muted hover:border-primary/40 hover:text-primary" href={`/study/ng-lectures/${previous.stage}/${previous.slug}`}>
                  Previous: Ch{previous.number}
                </Link>
              ) : null}
              {next ? (
                <Link className="rounded-xl border border-line px-3 py-2 text-muted hover:border-primary/40 hover:text-primary" href={`/study/ng-lectures/${next.stage}/${next.slug}`}>
                  Next: Ch{next.number}
                </Link>
              ) : null}
            </div>
          </div>

          {example ? (
            <div className="rounded-spec border border-line bg-white p-5 shadow-sm">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
                <Code2 className="h-4 w-4 text-primary" aria-hidden="true" />
                Python Example
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted">Included in the static site for reading. Run locally from the source repository when needed.</p>
              <pre className="mt-4 max-h-[32rem] overflow-auto rounded-xl border border-line bg-canvas p-4 text-xs leading-6 text-ink">
                <code>{example}</code>
              </pre>
            </div>
          ) : null}
        </aside>
      </div>
    </PageShell>
  );
}
