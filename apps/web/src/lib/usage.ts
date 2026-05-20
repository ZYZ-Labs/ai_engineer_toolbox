const STORAGE_KEY = "aet-tool-usage";

export type ToolUsage = {
  count: number;
  lastUsed: number;
};

export type UsageMap = Record<string, ToolUsage>;

export function getUsage(): UsageMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as UsageMap) : {};
  } catch {
    return {};
  }
}

export function recordUsage(toolPath: string) {
  if (typeof window === "undefined") return;
  const usage = getUsage();
  const prev = usage[toolPath] || { count: 0, lastUsed: 0 };
  usage[toolPath] = {
    count: prev.count + 1,
    lastUsed: Date.now()
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(usage));
}

export function getTopTools(limit = 4): { path: string; count: number }[] {
  const usage = getUsage();
  return Object.entries(usage)
    .sort((a, b) => {
      // Sort by count desc, then by lastUsed desc as tie-breaker
      if (b[1].count !== a[1].count) return b[1].count - a[1].count;
      return b[1].lastUsed - a[1].lastUsed;
    })
    .slice(0, limit)
    .map(([path, data]) => ({ path, count: data.count }));
}
