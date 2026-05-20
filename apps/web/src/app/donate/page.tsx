import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";

export const metadata: Metadata = {
  title: "Donate"
};

export default function DonatePage() {
  return (
    <PageShell>
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase text-primary">Donate</p>
        <h1 className="mt-3 text-4xl font-semibold text-ink">Support page reserved</h1>
        <p className="mt-5 text-lg leading-8 text-muted">
          The v1 product keeps donation entry points hidden from navigation until the project has meaningful traffic and a clear
          maintenance need.
        </p>
      </div>
    </PageShell>
  );
}
