"use client";

import { LogIn, LogOut, User } from "lucide-react";
import { useAuth } from "./AuthProvider";
import Link from "next/link";

export function LoginButton() {
  const { user, isLoading, logout } = useAuth();

  if (isLoading) {
    return (
      <span className="grid h-9 w-9 place-items-center rounded-full border border-line bg-panel text-muted">
        <User className="h-4 w-4 animate-pulse" />
      </span>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        <span className="hidden text-sm text-muted sm:inline">{user.username}</span>
        <button
          type="button"
          onClick={logout}
          className="grid h-9 w-9 place-items-center rounded-full border border-line bg-panel text-muted transition hover:border-primary/40 hover:text-primary"
          aria-label="Logout"
          title="Logout"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <Link
      href="/login"
      className="grid h-9 w-9 place-items-center rounded-full border border-line bg-panel text-muted transition hover:border-primary/40 hover:text-primary"
      aria-label="Login"
      title="Login"
    >
      <LogIn className="h-4 w-4" />
    </Link>
  );
}
