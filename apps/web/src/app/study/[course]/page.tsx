import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookOpenText } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { findBeginnerCourse, getBeginnerCourseStaticParams } from "@/lib/courses/beginner-courses";

type Props = {
  params: Promise<{
    course: string;
  }>;
};

export function generateStaticParams() {
  return getBeginnerCourseStaticParams();
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { course: courseSlug } = await params;
  const course = findBeginnerCourse(courseSlug);
  return {
    title: course ? course.title : "Study Course"
  };
}

export default async function BeginnerCoursePage({ params }: Props) {
  const { course: courseSlug } = await params;
  const course = findBeginnerCourse(courseSlug);
  if (!course) notFound();

  const totalChapters = course.stages.reduce((sum, stage) => sum + stage.chapters.length, 0);

  return (
    <PageShell>
      <div className="max-w-4xl">
        <p className="text-sm font-semibold uppercase text-primary">Course</p>
        <h1 className="mt-3 text-4xl font-semibold text-ink">{course.title}</h1>
        <p className="mt-4 text-lg leading-8 text-muted">{course.summary}</p>
        <div className="mt-5 flex flex-wrap gap-3 text-sm text-muted">
          <span className="rounded-full border border-line bg-white px-3 py-1.5">{totalChapters} chapters</span>
          {course.badges.map((badge) => (
            <span key={badge} className="rounded-full border border-line bg-white px-3 py-1.5">
              {badge}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-10 space-y-8">
        {course.stages.map((stage) => (
          <section key={stage.slug} className="rounded-spec border border-line bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-primary">
                  Stage {stage.number} / {stage.duration}
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-ink">{stage.title}</h2>
                <p className="mt-1 text-sm text-muted">{stage.titleEn}</p>
              </div>
              <span className="text-sm text-muted">{stage.chapters.length} chapters</span>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {stage.chapters.map((chapter) => (
                <Link
                  key={chapter.slug}
                  href={`/study/${course.slug}/${chapter.stage}/${chapter.slug}`}
                  className="group rounded-xl border border-line bg-canvas p-4 transition hover:border-primary/40 hover:bg-primary-soft"
                >
                  <span className="flex items-start gap-3">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-primary">
                      <BookOpenText className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-ink">
                        Chapter {chapter.number}: {chapter.title}
                      </span>
                      <span className="mt-1 block text-sm leading-6 text-muted">{chapter.titleEn}</span>
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
