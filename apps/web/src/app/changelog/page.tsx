import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";

export const metadata: Metadata = {
  title: "Changelog"
};

export default function ChangelogPage() {
  return (
    <PageShell>
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase text-primary">Changelog</p>
        <h1 className="mt-3 text-4xl font-semibold text-ink">Project updates</h1>
      </div>
      <div className="mt-8 rounded-spec border border-line bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold text-ink">2026-05-20 / v0.1.0</p>
        <ul className="mt-4 space-y-2 text-sm leading-7 text-muted">
          <li>Implemented the static Next.js frontend for GitHub Pages and custom domain deployment.</li>
          <li>Added local-first tools for crypto, data, and AI engineering workflows.</li>
          <li>Added MDX study roadmaps and project handoff documentation.</li>
        </ul>
      </div>
    </PageShell>
  );
}
