"use client";

import { PageShell } from "@/components/layout/PageShell";
import { useI18n } from "@/lib/i18n";

export default function ChangelogPage() {
  const { t } = useI18n();

  return (
    <PageShell>
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase text-primary">{t("changelog.label")}</p>
        <h1 className="mt-3 text-4xl font-semibold text-ink">{t("changelog.title")}</h1>
      </div>
      <div className="mt-8 rounded-spec border border-line bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-ink">{t("changelog.cryptoHistory.date")}</p>
        <ul className="mt-4 space-y-2 text-sm leading-7 text-muted">
          <li>{t("changelog.cryptoHistory.l1")}</li>
          <li>{t("changelog.cryptoHistory.l2")}</li>
        </ul>
      </div>

      <div className="mt-6 rounded-spec border border-line bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-ink">{t("changelog.aiChat.date")}</p>
        <ul className="mt-4 space-y-2 text-sm leading-7 text-muted">
          <li>{t("changelog.aiChat.l1")}</li>
          <li>{t("changelog.aiChat.l2")}</li>
          <li>{t("changelog.aiChat.l3")}</li>
        </ul>
      </div>

      <div className="mt-6 rounded-spec border border-line bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-ink">{t("changelog.ngLectures.date")}</p>
        <ul className="mt-4 space-y-2 text-sm leading-7 text-muted">
          <li>{t("changelog.ngLectures.l1")}</li>
          <li>{t("changelog.ngLectures.l2")}</li>
        </ul>
      </div>

      <div className="mt-6 rounded-spec border border-line bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-ink">{t("changelog.base64image.date")}</p>
        <ul className="mt-4 space-y-2 text-sm leading-7 text-muted">
          <li>{t("changelog.base64image.l1")}</li>
          <li>{t("changelog.base64image.l2")}</li>
        </ul>
      </div>

      <div className="mt-6 rounded-spec border border-line bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-ink">{t("changelog.crypto_v2.date")}</p>
        <ul className="mt-4 space-y-2 text-sm leading-7 text-muted">
          <li>{t("changelog.crypto_v2.l1")}</li>
          <li>{t("changelog.crypto_v2.l2")}</li>
          <li>{t("changelog.crypto_v2.l3")}</li>
          <li>{t("changelog.crypto_v2.l4")}</li>
          <li>{t("changelog.crypto_v2.l5")}</li>
        </ul>
      </div>

      <div className="mt-6 rounded-spec border border-line bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-ink">{t("changelog.crypto.date")}</p>
        <ul className="mt-4 space-y-2 text-sm leading-7 text-muted">
          <li>{t("changelog.crypto.l1")}</li>
          <li>{t("changelog.crypto.l2")}</li>
          <li>{t("changelog.crypto.l3")}</li>
          <li>{t("changelog.crypto.l4")}</li>
        </ul>
      </div>

      <div className="mt-6 rounded-spec border border-line bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-ink">{t("changelog.i18n.date")}</p>
        <ul className="mt-4 space-y-2 text-sm leading-7 text-muted">
          <li>{t("changelog.i18n.l1")}</li>
        </ul>
      </div>

      <div className="mt-6 rounded-spec border border-line bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-ink">{t("changelog.v010.date")}</p>
        <ul className="mt-4 space-y-2 text-sm leading-7 text-muted">
          <li>{t("changelog.v010.l1")}</li>
          <li>{t("changelog.v010.l2")}</li>
          <li>{t("changelog.v010.l3")}</li>
        </ul>
      </div>
    </PageShell>
  );
}
