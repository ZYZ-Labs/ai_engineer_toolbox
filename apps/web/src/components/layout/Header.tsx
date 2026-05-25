"use client";

import Link from "next/link";
import { Boxes } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n/dict";

const navItems = [
  { href: "/tools", key: "nav.tools" as const },
  { href: "/study", key: "nav.study" as const },
  { href: "/about", key: "nav.about" as const },
  { href: "/changelog", key: "nav.changelog" as const }
];

export function Header() {
  const { t, lang, setLang } = useI18n();

  function toggleLang() {
    const next: Lang = lang === "en" ? "zh" : "en";
    setLang(next);
  }

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 text-sm font-semibold text-ink">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-white">
            <Boxes className="h-5 w-5" aria-hidden="true" />
          </span>
          <span>{t("site.name")}</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-muted transition hover:bg-primary-soft hover:text-primary"
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleLang}
            className="grid h-9 w-9 place-items-center rounded-full border border-line bg-panel text-xs font-semibold text-muted transition hover:border-primary/40 hover:text-primary"
            aria-label="Switch language"
            title={lang === "en" ? t("lang.zh") : t("lang.en")}
          >
            {lang === "en" ? "EN" : "中"}
          </button>

        </div>
      </div>
    </header>
  );
}
