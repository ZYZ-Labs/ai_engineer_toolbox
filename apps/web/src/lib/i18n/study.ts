import type { StudyPageMeta } from "@/lib/study-registry";
import type { DictKey } from "./dict";

type T = (key: DictKey) => string;

const studyKeyMap: Record<string, { title: DictKey; summary: DictKey }> = {
  "transformer-roadmap": {
    title: "study.transformerRoadmap.title",
    summary: "study.transformerRoadmap.summary",
  },
  "rag-roadmap": {
    title: "study.ragRoadmap.title",
    summary: "study.ragRoadmap.summary",
  },
  "agent-roadmap": {
    title: "study.agentRoadmap.title",
    summary: "study.agentRoadmap.summary",
  },
  "ai-app-engineering": {
    title: "study.aiAppEngineering.title",
    summary: "study.aiAppEngineering.summary",
  },
};

export function translateStudyPage(page: StudyPageMeta, t: T): StudyPageMeta {
  const keys = studyKeyMap[page.slug];
  if (!keys) return page;

  return {
    ...page,
    title: t(keys.title),
    summary: t(keys.summary),
    level: translateLevel(page.level, t) as StudyPageMeta["level"],
  };
}

export function translateLevel(level: string, t: T): string {
  const key = `level.${level}` as DictKey;
  const translated = t(key);
  return translated === key ? level : translated;
}
