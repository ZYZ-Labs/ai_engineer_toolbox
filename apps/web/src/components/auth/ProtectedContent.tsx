"use client";

import { useAuth } from "./AuthProvider";
import { Lock, LogIn } from "lucide-react";
import Link from "next/link";

interface ProtectedContentProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function ProtectedContent({ children, fallback }: ProtectedContentProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-[20rem] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (user) {
    return <>{children}</>;
  }

  if (fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className="flex min-h-[20rem] flex-col items-center justify-center rounded-spec border border-line bg-white p-10 text-center shadow-sm">
      <span className="grid h-14 w-14 place-items-center rounded-2xl bg-primary-soft text-primary">
        <Lock className="h-6 w-6" />
      </span>
      <h2 className="mt-4 text-xl font-semibold text-ink">Members Only</h2>
      <p className="mt-2 max-w-xs text-sm text-muted">
        This content is available to signed-in users only. Please sign in to continue.
      </p>
      <Link
        href="/login"
        className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary/90"
      >
        <LogIn className="h-4 w-4" />
        Sign In
      </Link>
    </div>
  );
}
