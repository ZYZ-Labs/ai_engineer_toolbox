"use client";

import { useI18n } from "@/lib/i18n";

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-line bg-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-sm text-muted sm:px-6 lg:px-8">
        <p>{t("footer.line1")}</p>
        <p>{t("footer.line2")}</p>
      </div>
    </footer>
  );
}
