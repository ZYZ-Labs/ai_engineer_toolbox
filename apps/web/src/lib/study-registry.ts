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
  },
  {
    slug: "ng-lectures",
    title: "Andrew Ng Deep Learning",
    summary: "A 28-chapter bilingual course covering ML fundamentals, neural networks, CNN, RNN, and generative AI.",
    level: "Foundation",
    readingTime: "28 chapters"

  },
  {
    slug: "git-basics",
    title: "Git Beginner Course",
    summary: "A detailed beginner course for Git concepts, command-line workflow, branches, remotes, conflicts, and safe collaboration.",
    level: "Foundation",
    readingTime: "10 chapters"
  },
  {
    slug: "godot-basics",
    title: "Godot 4.6.3 Beginner Course",
    summary: "A detailed Godot 4.6.3 course for new game makers, from editor basics to a playable 2D project and export workflow.",
    level: "Foundation",
    readingTime: "12 chapters"
  },
  {
    slug: "unity-basics",
    title: "Unity 6.3 LTS Beginner Course",
    summary: "A detailed Unity 6.3 LTS course for new game makers, from editor basics to a playable 2D project and build workflow.",
    level: "Foundation",
    readingTime: "12 chapters"
  },
  {
    slug: "unreal-basics",
    title: "Unreal Engine 5.7 Beginner Course",
    summary: "A detailed Unreal Engine 5.7 course for new users, from editor basics and Blueprints to a playable 3D prototype.",
    level: "Foundation",
    readingTime: "12 chapters"
  }
];

export function findStudyPage(slug: string) {
  return studyPages.find((page) => page.slug === slug);
}
