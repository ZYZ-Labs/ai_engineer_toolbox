import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";

export const metadata: Metadata = {
  title: "About"
};

export default function AboutPage() {
  return (
    <PageShell>
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase text-primary">About</p>
        <h1 className="mt-3 text-4xl font-semibold text-ink">A small toolbox for real AI application work</h1>
        <div className="mt-6 space-y-5 text-lg leading-8 text-muted">
          <p>
            AI Engineer Toolbox keeps v1 intentionally simple: browser-side tools, practical study pages, no accounts, no database,
            no ads, and no unnecessary backend.
          </p>
          <p>
            The goal is to help engineers inspect payloads, debug streaming APIs, prepare prompt fixtures, validate signatures, and
            study the systems that matter around modern AI applications.
          </p>
        </div>
      </div>
    </PageShell>
  );
}
