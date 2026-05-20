export type StudyPageMeta = {
  slug: string;
  title: string;
  summary: string;
  level: "Foundation" | "Intermediate" | "Advanced";
  readingTime: string;
};

export const studyPages: StudyPageMeta[] = [
  {
    slug: "transformer-lectures",
    title: "Transformer Lectures",
    summary: "A 30-chapter bilingual course from tensor basics to Transformer internals, diffusion, and source hacking.",
    level: "Foundation",
    readingTime: "30 chapters"
  }
];

export function findStudyPage(slug: string) {
  return studyPages.find((page) => page.slug === slug);
}
