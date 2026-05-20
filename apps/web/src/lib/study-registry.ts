export type StudyPageMeta = {
  slug: string;
  title: string;
  summary: string;
  level: "Foundation" | "Intermediate" | "Advanced";
  readingTime: string;
};

export const studyPages: StudyPageMeta[] = [
  {
    slug: "transformer-roadmap",
    title: "Transformer Roadmap",
    summary: "Build intuition from embeddings and attention through serving constraints.",
    level: "Foundation",
    readingTime: "14 min"
  },
  {
    slug: "rag-roadmap",
    title: "RAG Roadmap",
    summary: "Design retrieval systems with chunking, evaluation, observability, and failure modes.",
    level: "Intermediate",
    readingTime: "16 min"
  },
  {
    slug: "agent-roadmap",
    title: "Agent Roadmap",
    summary: "A practical path for tool use, state, planning, recovery, and safety boundaries.",
    level: "Advanced",
    readingTime: "15 min"
  },
  {
    slug: "ai-app-engineering",
    title: "AI App Engineering",
    summary: "Engineering practices for building reliable AI features in product systems.",
    level: "Intermediate",
    readingTime: "18 min"
  }
];

export function findStudyPage(slug: string) {
  return studyPages.find((page) => page.slug === slug);
}
