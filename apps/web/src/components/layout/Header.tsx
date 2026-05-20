import Link from "next/link";
import { Boxes, Github } from "lucide-react";

const navItems = [
  { href: "/tools", label: "Tools" },
  { href: "/study", label: "Study" },
  { href: "/about", label: "About" },
  { href: "/changelog", label: "Changelog" }
];

export function Header() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3 text-sm font-semibold text-ink">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-white">
            <Boxes className="h-5 w-5" aria-hidden="true" />
          </span>
          <span>AI Engineer Toolbox</span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-medium text-muted transition hover:bg-primary-soft hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <a
          href="https://github.com/ZYZ-Labs/ai_engineer_toolbox"
          className="grid h-9 w-9 place-items-center rounded-full border border-line bg-panel text-muted transition hover:border-primary/40 hover:text-primary"
          aria-label="GitHub repository"
        >
          <Github className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
    </header>
  );
}
