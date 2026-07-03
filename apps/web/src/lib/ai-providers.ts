export type AiProvider = {
  id: string;
  name: string;
  baseUrl: string;
  modelsEndpoint: string | null;
  chatEndpoint: string;
  apiKeyHeader: string;
  supportsCors: boolean;
  defaultModels: string[];
  requiresProxy: boolean;
};

export const aiProviders: AiProvider[] = [
  {
    id: "openai",
    name: "OpenAI",
    baseUrl: "https://api.openai.com",
    modelsEndpoint: "/v1/models",
    chatEndpoint: "/v1/chat/completions",
    apiKeyHeader: "Authorization",
    supportsCors: false,
    defaultModels: ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
    requiresProxy: true,
  },
  {
    id: "anthropic",
    name: "Anthropic",
    baseUrl: "https://api.anthropic.com",
    modelsEndpoint: null,
    chatEndpoint: "/v1/messages",
    apiKeyHeader: "x-api-key",
    supportsCors: false,
    defaultModels: ["claude-3-5-sonnet-20241022", "claude-3-opus-20240229", "claude-3-haiku-20240307"],
    requiresProxy: true,
  },
  {
    id: "gemini",
    name: "Google Gemini",
    baseUrl: "https://generativelanguage.googleapis.com",
    modelsEndpoint: "/v1beta/models",
    chatEndpoint: "/v1beta/models/{model}:streamGenerateContent",
    apiKeyHeader: "key",
    supportsCors: true,
    defaultModels: ["gemini-1.5-pro-latest", "gemini-1.5-flash-latest", "gemini-1.0-pro"],
    requiresProxy: false,
  },
  {
    id: "deepseek",
    name: "DeepSeek",
    baseUrl: "https://api.deepseek.com",
    modelsEndpoint: "/models",
    chatEndpoint: "/chat/completions",
    apiKeyHeader: "Authorization",
    supportsCors: false,
    defaultModels: ["deepseek-chat", "deepseek-reasoner"],
    requiresProxy: true,
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    baseUrl: "https://openrouter.ai/api",
    modelsEndpoint: "/v1/models",
    chatEndpoint: "/v1/chat/completions",
    apiKeyHeader: "Authorization",
    supportsCors: true,
    defaultModels: ["openai/gpt-4o", "anthropic/claude-3.5-sonnet", "google/gemini-1.5-pro"],
    requiresProxy: false,
  },
  {
    id: "siliconflow",
    name: "SiliconFlow",
    baseUrl: "https://api.siliconflow.cn",
    modelsEndpoint: "/v1/models",
    chatEndpoint: "/v1/chat/completions",
    apiKeyHeader: "Authorization",
    supportsCors: true,
    defaultModels: ["deepseek-ai/DeepSeek-V3", "deepseek-ai/DeepSeek-R1", "Qwen/Qwen2.5-72B-Instruct"],
    requiresProxy: false,
  },
  {
    id: "custom",
    name: "Custom (OpenAI-compatible)",
    baseUrl: "",
    modelsEndpoint: "/v1/models",
    chatEndpoint: "/v1/chat/completions",
    apiKeyHeader: "Authorization",
    supportsCors: true,
    defaultModels: [],
    requiresProxy: false,
  },
];

export function getProviderById(id: string): AiProvider | undefined {
  return aiProviders.find((p) => p.id === id);
}

export type ChatMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type ChatOptions = {
  provider: AiProvider;
  model: string;
  apiKey: string;
  baseUrl?: string;
  messages: ChatMessage[];
  temperature?: number;
  maxTokens?: number;
  onChunk?: (chunk: string) => void;
  onError?: (error: string) => void;
  onDone?: () => void;
};

function buildUrl(base: string, path: string, apiKey?: string, provider?: AiProvider): string {
  const url = new URL(path, base.replace(/\/$/, ""));
  if (provider?.apiKeyHeader === "key" && apiKey) {
    url.searchParams.set("key", apiKey);
  }
  return url.toString();
}

export async function fetchModels(provider: AiProvider, apiKey: string, customBaseUrl?: string): Promise<string[]> {
  if (!provider.modelsEndpoint) {
    return provider.defaultModels;
  }
  const base = customBaseUrl || provider.baseUrl;
  try {
    const headers: Record<string, string> = {
      Accept: "application/json",
    };
    if (provider.apiKeyHeader === "Authorization") {
      headers.Authorization = `Bearer ${apiKey}`;
    } else if (provider.apiKeyHeader !== "key") {
      headers[provider.apiKeyHeader] = apiKey;
    }

    const res = await fetch(buildUrl(base, provider.modelsEndpoint, apiKey, provider), { headers });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();

    if (Array.isArray(data.data)) {
      return data.data
        .map((m: { id?: string; model?: string }) => m.id || m.model)
        .filter((id: string | undefined): id is string => Boolean(id));
    }
    // Gemini format
    if (Array.isArray(data.models)) {
      return data.models
        .map((m: { name?: string }) => m.name?.replace("models/", "") || m.name)
        .filter((id: string | undefined): id is string => Boolean(id));
    }
    return provider.defaultModels;
  } catch {
    return provider.defaultModels;
  }
}

export async function sendChat(options: ChatOptions): Promise<void> {
  const { provider, model, apiKey, baseUrl, messages, temperature = 0.7, maxTokens = 4096, onChunk, onError, onDone } = options;
  const base = baseUrl || provider.baseUrl;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "text/event-stream",
  };
  if (provider.apiKeyHeader === "Authorization") {
    headers.Authorization = `Bearer ${apiKey}`;
  } else if (provider.apiKeyHeader === "x-api-key") {
    headers["x-api-key"] = apiKey;
    headers["anthropic-version"] = "2023-06-01";
  } else if (provider.apiKeyHeader !== "key") {
    headers[provider.apiKeyHeader] = apiKey;
  }

  try {
    let body: object;
    let url: string;

    if (provider.id === "anthropic") {
      url = buildUrl(base, provider.chatEndpoint, apiKey, provider);
      const systemMsg = messages.find((m) => m.role === "system");
      const conversation = messages.filter((m) => m.role !== "system");
      body = {
        model,
        max_tokens: maxTokens,
        temperature,
        system: systemMsg?.content,
        messages: conversation.map((m) => ({ role: m.role, content: m.content })),
        stream: true,
      };
    } else if (provider.id === "gemini") {
      url = buildUrl(base, provider.chatEndpoint.replace("{model}", model), apiKey, provider);
      const lastUser = [...messages].reverse().find((m) => m.role === "user");
      const history = messages.filter((m) => m !== lastUser).map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.content }],
      }));
      body = {
        contents: [
          ...history,
          { role: "user", parts: [{ text: lastUser?.content || "" }] },
        ],
        generationConfig: { temperature, maxOutputTokens: maxTokens },
      };
    } else {
      // OpenAI-compatible
      url = buildUrl(base, provider.chatEndpoint, apiKey, provider);
      body = {
        model,
        messages,
        temperature,
        max_tokens: maxTokens,
        stream: true,
      };
    }

    const res = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${text.slice(0, 200)}`);
    }

    if (provider.id === "gemini") {
      // Gemini returns NDJSON, not SSE
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");
      const decoder = new TextDecoder();
      let buffer = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const json = JSON.parse(line);
            const text = json.candidates?.[0]?.content?.parts?.[0]?.text || "";
            if (text) onChunk?.(text);
          } catch {
            // ignore parse errors
          }
        }
      }
      onDone?.();
      return;
    }

    const reader = res.body?.getReader();
    if (!reader) throw new Error("No response body");
    const decoder = new TextDecoder();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (!line.startsWith("data: ")) continue;
        const data = line.slice(6);
        if (data === "[DONE]") {
          onDone?.();
          return;
        }
        try {
          const json = JSON.parse(data);
          // Anthropic SSE format
          if (json.type === "content_block_delta" && json.delta?.text) {
            onChunk?.(json.delta.text);
            continue;
          }
          if (json.type === "message_stop") {
            onDone?.();
            return;
          }
          // OpenAI SSE format
          const delta = json.choices?.[0]?.delta;
          if (delta?.content) {
            onChunk?.(delta.content);
          }
        } catch {
          // ignore parse errors
        }
      }
    }
    onDone?.();
  } catch (err) {
    onError?.(err instanceof Error ? err.message : String(err));
  }
}

const STORAGE_KEY_PROVIDER = "aet-ai-provider";
const STORAGE_KEY_MODEL = "aet-ai-model";
const STORAGE_KEY_API_KEY = "aet-ai-api-key";
const STORAGE_KEY_BASE_URL = "aet-ai-base-url";
const STORAGE_KEY_HISTORY = "aet-ai-history";

export function loadAiConfig(): { providerId: string; model: string; apiKey: string; baseUrl: string } {
  if (typeof window === "undefined") {
    return { providerId: "openrouter", model: "", apiKey: "", baseUrl: "" };
  }
  return {
    providerId: localStorage.getItem(STORAGE_KEY_PROVIDER) || "openrouter",
    model: localStorage.getItem(STORAGE_KEY_MODEL) || "",
    apiKey: localStorage.getItem(STORAGE_KEY_API_KEY) || "",
    baseUrl: localStorage.getItem(STORAGE_KEY_BASE_URL) || "",
  };
}

export function saveAiConfig(config: { providerId: string; model: string; apiKey: string; baseUrl: string }) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_PROVIDER, config.providerId);
  localStorage.setItem(STORAGE_KEY_MODEL, config.model);
  localStorage.setItem(STORAGE_KEY_API_KEY, config.apiKey);
  localStorage.setItem(STORAGE_KEY_BASE_URL, config.baseUrl);
}

export function loadChatHistory(): ChatMessage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY_HISTORY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveChatHistory(messages: ChatMessage[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_HISTORY, JSON.stringify(messages));
}
