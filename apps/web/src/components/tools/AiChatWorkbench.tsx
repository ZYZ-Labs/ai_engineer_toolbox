"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  Bot,
  Send,
  Trash2,
  User,
  RefreshCw,
  ChevronDown,
  KeyRound,
  Globe,
  AlertTriangle,
  Settings,
  X
} from "lucide-react";
import {
  aiProviders,
  fetchModels,
  getProviderById,
  loadAiConfig,
  loadChatHistory,
  saveAiConfig,
  saveChatHistory,
  sendChat,
  type ChatMessage,
  type AiProvider
} from "@/lib/ai-providers";

export function AiChatWorkbench() {
  const [config, setConfig] = useState(loadAiConfig);
  const [messages, setMessages] = useState<ChatMessage[]>(loadChatHistory);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [availableModels, setAvailableModels] = useState<string[]>([]);
  const [isFetchingModels, setIsFetchingModels] = useState(false);
  const [error, setError] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(4096);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef(false);

  const provider = getProviderById(config.providerId);

  // Persist config
  useEffect(() => {
    saveAiConfig(config);
  }, [config]);

  // Persist messages
  useEffect(() => {
    saveChatHistory(messages);
  }, [messages]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingContent]);

  // Fetch models when provider/apiKey changes
  useEffect(() => {
    if (!provider || !config.apiKey) {
      setAvailableModels(provider?.defaultModels || []);
      return;
    }
    setIsFetchingModels(true);
    fetchModels(provider, config.apiKey, config.baseUrl || undefined)
      .then((models) => {
        setAvailableModels(models.length ? models : provider.defaultModels);
        if (!config.model || !models.includes(config.model)) {
          const first = models[0] || provider.defaultModels[0];
          if (first) setConfig((prev) => ({ ...prev, model: first }));
        }
      })
      .catch(() => {
        setAvailableModels(provider.defaultModels);
      })
      .finally(() => setIsFetchingModels(false));
  }, [config.providerId, config.apiKey, config.baseUrl]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading || !provider) return;
    if (!config.apiKey.trim()) {
      setError("Please enter your API key in settings.");
      setShowSettings(true);
      return;
    }
    if (!config.model) {
      setError("Please select a model.");
      return;
    }

    const userMessage: ChatMessage = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput("");
    setIsLoading(true);
    setStreamingContent("");
    setError("");
    abortRef.current = false;

    const conversation: ChatMessage[] = [
      { role: "system", content: "You are a helpful assistant." },
      ...newMessages,
    ];

    await sendChat({
      provider,
      model: config.model,
      apiKey: config.apiKey,
      baseUrl: config.baseUrl || undefined,
      messages: conversation,
      temperature,
      maxTokens,
      onChunk: (chunk) => {
        if (abortRef.current) return;
        setStreamingContent((prev) => prev + chunk);
      },
      onError: (err) => {
        setError(err);
        setIsLoading(false);
      },
      onDone: () => {
        setIsLoading(false);
        setMessages((prev) => {
          const assistantMsg: ChatMessage = {
            role: "assistant",
            content: streamingContentRef.current,
          };
          return [...prev, assistantMsg];
        });
        setStreamingContent("");
      },
    });
  }, [input, isLoading, provider, config, messages, temperature, maxTokens]);

  // We need a ref to read streamingContent inside onDone closure
  const streamingContentRef = useRef(streamingContent);
  useEffect(() => {
    streamingContentRef.current = streamingContent;
  }, [streamingContent]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void handleSend();
    }
  };

  const clearHistory = () => {
    setMessages([]);
    setStreamingContent("");
    setError("");
  };

  const handleProviderChange = (id: string) => {
    const p = getProviderById(id);
    setConfig({
      providerId: id,
      model: p?.defaultModels[0] || "",
      apiKey: "",
      baseUrl: p?.id === "custom" ? "" : p?.baseUrl || "",
    });
    setAvailableModels(p?.defaultModels || []);
  };

  return (
    <div className="flex h-[calc(100vh-12rem)] flex-col gap-4 lg:h-[700px]">
      {/* Header / Settings Bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-spec border border-line bg-white p-3 shadow-sm">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-muted">Provider</label>
          <div className="relative">
            <select
              value={config.providerId}
              onChange={(e) => handleProviderChange(e.target.value)}
              className="h-9 appearance-none rounded-lg border border-line bg-canvas px-3 pr-8 text-sm text-ink focus:border-primary focus:outline-none"
            >
              {aiProviders.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-muted">Model</label>
          <div className="relative">
            <select
              value={config.model}
              onChange={(e) => setConfig((prev) => ({ ...prev, model: e.target.value }))}
              disabled={isFetchingModels}
              className="h-9 appearance-none rounded-lg border border-line bg-canvas px-3 pr-8 text-sm text-ink focus:border-primary focus:outline-none disabled:opacity-50"
            >
              {availableModels.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted" />
            {isFetchingModels && (
              <RefreshCw className="absolute right-6 top-1/2 h-3 w-3 -translate-y-1/2 animate-spin text-primary" />
            )}
          </div>
        </div>

        <button
          onClick={() => setShowSettings((s) => !s)}
          className="ml-auto inline-flex items-center gap-1.5 rounded-lg border border-line bg-canvas px-3 py-1.5 text-xs font-medium text-muted hover:border-primary/40 hover:text-primary"
        >
          <KeyRound className="h-3.5 w-3.5" />
          {showSettings ? "Hide" : "Settings"}
        </button>

        <button
          onClick={clearHistory}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-canvas px-3 py-1.5 text-xs font-medium text-muted hover:border-red-300 hover:text-red-500"
          title="Clear chat history"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Clear
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="rounded-spec border border-line bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-ink">API Settings</h3>
            <button onClick={() => setShowSettings(false)} className="text-muted hover:text-ink">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-muted">
                <KeyRound className="h-3 w-3" /> API Key
              </label>
              <input
                type="password"
                value={config.apiKey}
                onChange={(e) => setConfig((prev) => ({ ...prev, apiKey: e.target.value }))}
                placeholder={`Enter your ${provider?.name || ""} API key`}
                className="mt-1 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-primary focus:outline-none"
              />
              <p className="mt-1 text-xs text-muted">
                Stored locally in your browser. Never sent to our servers.
              </p>
            </div>

            {provider?.id === "custom" && (
              <div>
                <label className="flex items-center gap-1.5 text-xs font-semibold text-muted">
                  <Globe className="h-3 w-3" /> Base URL
                </label>
                <input
                  type="text"
                  value={config.baseUrl}
                  onChange={(e) => setConfig((prev) => ({ ...prev, baseUrl: e.target.value }))}
                  placeholder="https://api.example.com"
                  className="mt-1 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-primary focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-muted">Temperature</label>
              <div className="mt-1 flex items-center gap-2">
                <input
                  type="range"
                  min={0}
                  max={2}
                  step={0.1}
                  value={temperature}
                  onChange={(e) => setTemperature(Number(e.target.value))}
                  className="h-2 flex-1 cursor-pointer appearance-none rounded-lg bg-line accent-primary"
                />
                <span className="w-10 text-right text-sm font-medium text-ink">{temperature}</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-muted">Max Tokens</label>
              <input
                type="number"
                min={1}
                max={8192}
                value={maxTokens}
                onChange={(e) => setMaxTokens(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm text-ink focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {provider?.requiresProxy && (
            <div className="mt-3 flex items-start gap-2 rounded-lg bg-yellow-50 p-3 text-xs text-yellow-700">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <p>
                {provider.name} does not support browser CORS. You may need a proxy server or browser extension to bypass CORS.
                Consider using OpenRouter or SiliconFlow which support direct browser access.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Messages Area */}
      <div className="min-h-0 flex-1 overflow-y-auto rounded-spec border border-line bg-white p-4 shadow-sm">
        {messages.length === 0 && !streamingContent && (
          <div className="flex h-full flex-col items-center justify-center text-muted">
            <Bot className="h-12 w-12 opacity-20" />
            <p className="mt-3 text-sm">Start a conversation with your chosen AI provider.</p>
            {!config.apiKey && (
              <button
                onClick={() => setShowSettings(true)}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
              >
                <Settings className="h-3 w-3" /> Configure API key
              </button>
            )}
          </div>
        )}

        <div className="space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${
                  msg.role === "user" ? "bg-primary text-white" : "bg-canvas text-muted"
                }`}
              >
                {msg.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-6 ${
                  msg.role === "user"
                    ? "bg-primary text-white"
                    : "bg-canvas text-ink"
                }`}
              >
                <pre className="whitespace-pre-wrap font-sans">{msg.content}</pre>
              </div>
            </div>
          ))}

          {(isLoading || streamingContent) && (
            <div className="flex gap-3">
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-canvas text-muted">
                <Bot className="h-4 w-4" />
              </div>
              <div className="max-w-[80%] rounded-2xl bg-canvas px-4 py-2.5 text-sm leading-6 text-ink">
                {streamingContent ? (
                  <pre className="whitespace-pre-wrap font-sans">{streamingContent}</pre>
                ) : (
                  <span className="inline-flex items-center gap-1 text-muted">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    Thinking...
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex gap-2">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message... (Shift+Enter for new line)"
          rows={1}
          className="min-h-[44px] flex-1 resize-none rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink placeholder:text-muted focus:border-primary focus:outline-none"
          style={{ height: "auto" }}
          onInput={(e) => {
            const target = e.target as HTMLTextAreaElement;
            target.style.height = "auto";
            target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
          }}
        />
        <button
          onClick={() => void handleSend()}
          disabled={!input.trim() || isLoading}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary text-white shadow-sm transition hover:bg-primary/90 disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
