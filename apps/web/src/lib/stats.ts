export interface PublicStats {
  total: number;
  today: number;
  visitors: number;
  daily: Array<{
    visit_date: string;
    count: number;
  }>;
}

const API_BASE =
  typeof window !== "undefined" && window.location.hostname === "localhost"
    ? "http://localhost:8788"
    : "";

export async function fetchPublicStats(): Promise<PublicStats | null> {
  try {
    const res = await fetch(`${API_BASE}/api/stats/public`);
    if (!res.ok) return null;
    return (await res.json()) as PublicStats;
  } catch {
    return null;
  }
}
