import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageShell } from "@/components/layout/PageShell";
import { MarkdownRenderer } from "@/components/study/MarkdownRenderer";
import { findStudyPage, studyPages } from "@/lib/study-registry";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return studyPages.map((page) => ({ slug: page.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = findStudyPage(slug);
  return {
    title: page?.title || "Study"
  };
}

export default async function StudyPage({ params }: Props) {
  const { slug } = await params;
  const page = findStudyPage(slug);
  if (!page) notFound();

  const source = await readFile(path.join(process.cwd(), "../../content/study", `${slug}.mdx`), "utf8");

  return (
    <PageShell>
      <div className="mx-auto max-w-3xl rounded-spec border border-line bg-white p-6 shadow-sm sm:p-8">
        <p className="mb-4 text-sm font-semibold uppercase text-primary">
          {page.level} / {page.readingTime}
        </p>
        <MarkdownRenderer source={source} />
      </div>
    </PageShell>
  );
}
