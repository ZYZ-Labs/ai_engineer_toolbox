import type { StudyPageMeta } from "@/lib/study-registry";
import type { DictKey } from "./dict";

type T = (key: DictKey) => string;

const studyKeyMap: Record<string, { title: DictKey; summary: DictKey }> = {
  "transformer-lectures": {
    title: "study.transformerLectures.title",
    summary: "study.transformerLectures.summary",
  },
  "ng-lectures": {
    title: "study.ngLectures.title",
    summary: "study.ngLectures.summary",
  },
  "git-basics": {
    title: "study.gitBasics.title",
    summary: "study.gitBasics.summary",
  },
  "godot-basics": {
    title: "study.godotBasics.title",
    summary: "study.godotBasics.summary",
  }
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
