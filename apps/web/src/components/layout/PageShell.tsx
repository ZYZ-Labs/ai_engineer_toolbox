import type { ReactNode } from "react";

export function PageShell({ children }: { children: ReactNode }) {
  return <main className="mx-auto min-h-[calc(100vh-10rem)] max-w-7xl px-4 py-10 sm:px-6 lg:px-8">{children}</main>;
}
