import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { MarkdownRenderer } from "@/components/study/MarkdownRenderer";
import {
  findBeginnerChapter,
  getBeginnerChapterStaticParams,
  getBeginnerCourseChapters,
  readBeginnerCourseMarkdown
} from "@/lib/courses/beginner-courses";

type Props = {
  params: Promise<{
    course: string;
    stage: string;
    chapter: string;
  }>;
};

export function generateStaticParams() {
  return getBeginnerChapterStaticParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { course: courseSlug, stage, chapter } = await params;
  const result = findBeginnerChapter(courseSlug, stage, chapter);
  return {
    title: result ? `Chapter ${result.chapter.number}: ${result.chapter.titleEn}` : "Study Chapter"
  };
}

export default async function BeginnerCourseChapterPage({ params }: Props) {
  const { course: courseSlug, stage, chapter } = await params;
  const result = findBeginnerChapter(courseSlug, stage, chapter);
  if (!result) notFound();

  const source = await readBeginnerCourseMarkdown(result.course, result.chapter);
  const chapters = getBeginnerCourseChapters(result.course);
  const currentIndex = chapters.findIndex((item) => item.stage === stage && item.slug === chapter);
  const previous = chapters[currentIndex - 1];
  const next = chapters[currentIndex + 1];

  return (
    <PageShell>
      <div className="mb-6">
        <Link href={`/study/${result.course.slug}`} className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to course
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="min-w-0 rounded-spec border border-line bg-white p-6 shadow-sm sm:p-8">
          <p className="mb-4 text-sm font-semibold uppercase text-primary">
            Stage {result.chapter.stage.replace("stage", "")} / Chapter {result.chapter.number}
          </p>
          <MarkdownRenderer source={source} />
        </div>

        <aside className="space-y-4">
          <div className="rounded-spec border border-line bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-ink">Chapter Navigation</h2>
            <div className="mt-4 grid gap-2 text-sm">
              {previous ? (
                <Link
                  className="rounded-xl border border-line px-3 py-2 text-muted hover:border-primary/40 hover:text-primary"
                  href={`/study/${result.course.slug}/${previous.stage}/${previous.slug}`}
                >
                  Previous: Ch{previous.number}
                </Link>
              ) : null}
              {next ? (
                <Link
                  className="rounded-xl border border-line px-3 py-2 text-muted hover:border-primary/40 hover:text-primary"
                  href={`/study/${result.course.slug}/${next.stage}/${next.slug}`}
                >
                  Next: Ch{next.number}
                </Link>
              ) : null}
            </div>
          </div>
        </aside>
      </div>
    </PageShell>
  );
}
