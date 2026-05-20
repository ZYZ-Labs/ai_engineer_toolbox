"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy, Play, RotateCcw, Upload } from "lucide-react";
import type { ToolWorkbenchConfig } from "@/lib/tool-registry";
import { useI18n } from "@/lib/i18n";
import { translateOperation } from "@/lib/i18n/tool";
import type { DictKey } from "@/lib/i18n/dict";
import {
  aesDecrypt,
  aesEncrypt,
  base64ToText,
  decodeBase64Image,
  decodeUrl,
  desDecrypt,
  desEncrypt,
  diffJson,
  encodeUrl,
  escapePrompt,
  estimateTokens,
  formatJson,
  formatMessages,
  hashText,
  hmacText,
  imageToDataUrl,
  minifyJson,
  parseSse,
  sm4Decrypt,
  sm4Encrypt,
  textToBase64
} from "@ai-engineer-toolbox/utils";

type Props = {
  tool: ToolWorkbenchConfig;
};

class I18nError extends Error {
  constructor(public key: DictKey) {
    super(key);
  }
}

export function ToolWorkbench({ tool }: Props) {
  const { t } = useI18n();
  const [operation, setOperation] = useState(tool.defaultOperation);
  const [algorithm, setAlgorithm] = useState(tool.defaultAlgorithm || tool.algorithms?.[0] || "");
  const [padding, setPadding] = useState(tool.defaultPadding || tool.paddings?.[0] || "PKCS7");
  const [keyEncoding, setKeyEncoding] = useState(tool.defaultKeyEncoding || tool.keyEncodings?.[0] || "text");
  const [ivEncoding, setIvEncoding] = useState(tool.defaultIvEncoding || tool.ivEncodings?.[0] || "text");
  const [inputEncoding, setInputEncoding] = useState(tool.defaultInputEncoding || tool.inputEncodings?.[0] || "text");
  const [outputEncoding, setOutputEncoding] = useState(tool.defaultOutputEncoding || tool.outputEncodings?.[0] || "base64");
  const [input, setInput] = useState(tool.defaultInput);
  const [secondaryInput, setSecondaryInput] = useState(tool.defaultSecondaryInput || "");
  const [secret, setSecret] = useState(tool.defaultSecret || "");
  const [iv, setIv] = useState(tool.defaultIv || "");
  const [output, setOutput] = useState("");
  const [meta, setMeta] = useState<Record<string, string | number>>({});
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [fileName, setFileName] = useState("");
  const didRunInitial = useRef(false);

  const needsIv = tool.ivLabel && !algorithm.includes("ECB");

  function handleAlgorithmChange(next: string) {
    setAlgorithm(next);
    setIv(tool.defaultIv || "");
    setOutput("");
    setMeta({});
    setError("");
    setCopied(false);
  }

  const run = useCallback(async () => {
    setError("");
    setCopied(false);
    setMeta({});

    try {
      const result = await executeTool({
        path: tool.path,
        operation,
        algorithm,
        padding,
        keyEncoding,
        ivEncoding,
        inputEncoding,
        outputEncoding,
        input,
        secondaryInput,
        secret,
        iv
      });
      setOutput(result.output);
      setMeta(result.meta || {});
      if (result.meta?.iv && typeof result.meta.iv === "string") {
        setIv(result.meta.iv);
      }
    } catch (cause) {
      setOutput("");
      if (cause instanceof I18nError) {
        setError(t(cause.key));
      } else {
        setError(cause instanceof Error ? cause.message : t("workbench.error.generic"));
      }
    }
  }, [algorithm, padding, keyEncoding, ivEncoding, inputEncoding, outputEncoding, input, iv, operation, secondaryInput, secret, t, tool.path]);

  useEffect(() => {
    if (!didRunInitial.current && !tool.acceptsFile) {
      didRunInitial.current = true;
      void run();
    }
  }, [run, tool.acceptsFile]);

  async function copyOutput() {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
  }

  async function handleFile(file?: File) {
    if (!file) return;
    setFileName(file.name);
    setError("");
    setCopied(false);
    const dataUrl = await imageToDataUrl(file);
    setOutput(dataUrl);
    setMeta({ bytes: file.size, type: file.type || "unknown" });
  }

  function reset() {
    setOperation(tool.defaultOperation);
    setAlgorithm(tool.defaultAlgorithm || tool.algorithms?.[0] || "");
    setPadding(tool.defaultPadding || tool.paddings?.[0] || "PKCS7");
    setKeyEncoding(tool.defaultKeyEncoding || tool.keyEncodings?.[0] || "text");
    setIvEncoding(tool.defaultIvEncoding || tool.ivEncodings?.[0] || "text");
    setInputEncoding(tool.defaultInputEncoding || tool.inputEncodings?.[0] || "text");
    setOutputEncoding(tool.defaultOutputEncoding || tool.outputEncodings?.[0] || "base64");
    setInput(tool.defaultInput);
    setSecondaryInput(tool.defaultSecondaryInput || "");
    setSecret(tool.defaultSecret || "");
    setIv(tool.defaultIv || "");
    setOutput("");
    setMeta({});
    setError("");
    setCopied(false);
    setFileName("");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
      <aside className="rounded-spec border border-line bg-panel p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-ink">{t("workbench.algorithmSettings")}</h2>
        <div className="mt-5 space-y-5">
          <fieldset>
            <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">{t("workbench.mode")}</legend>
            <div className="grid grid-cols-2 gap-2">
              {tool.operations.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setOperation(item)}
                  className={`h-10 rounded-xl border px-3 text-sm font-medium capitalize transition ${
                    operation === item
                      ? "border-primary bg-primary text-white"
                      : "border-line bg-white text-muted hover:border-primary/40 hover:text-primary"
                  }`}
                >
                  {translateOperation(item, t)}
                </button>
              ))}
            </div>
          </fieldset>

          {tool.algorithms ? (
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted">{t("workbench.algorithm")}</span>
              <select
                value={algorithm}
                onChange={(event) => handleAlgorithmChange(event.target.value)}
                className="h-11 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              >
                {tool.algorithms.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {tool.paddings && !algorithm.includes("GCM") ? (
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted">Padding</span>
              <select
                value={padding}
                onChange={(event) => setPadding(event.target.value)}
                className="h-11 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              >
                {tool.paddings.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {tool.keyEncodings ? (
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted">Key Encoding</span>
              <select
                value={keyEncoding}
                onChange={(event) => setKeyEncoding(event.target.value)}
                className="h-11 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              >
                {tool.keyEncodings.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {needsIv && tool.ivEncodings ? (
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted">IV Encoding</span>
              <select
                value={ivEncoding}
                onChange={(event) => setIvEncoding(event.target.value)}
                className="h-11 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              >
                {tool.ivEncodings.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {tool.inputEncodings ? (
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted">Input Encoding</span>
              <select
                value={inputEncoding}
                onChange={(event) => setInputEncoding(event.target.value)}
                className="h-11 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              >
                {tool.inputEncodings.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {tool.outputEncodings && operation === "encrypt" ? (
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted">Output Encoding</span>
              <select
                value={outputEncoding}
                onChange={(event) => setOutputEncoding(event.target.value)}
                className="h-11 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              >
                {tool.outputEncodings.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          {tool.secretLabel ? (
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted">{tool.secretLabel}</span>
              <input
                value={secret}
                onChange={(event) => setSecret(event.target.value)}
                className="h-11 w-full rounded-xl border border-line bg-white px-3 font-mono text-sm text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </label>
          ) : null}

          {needsIv ? (
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-wide text-muted">{tool.ivLabel}</span>
              <input
                value={iv}
                onChange={(event) => setIv(event.target.value)}
                className="h-11 w-full rounded-xl border border-line bg-white px-3 font-mono text-sm text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </label>
          ) : null}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={run}
              disabled={tool.acceptsFile && operation === "encode"}
              className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted/30"
            >
              <Play className="h-4 w-4" aria-hidden="true" />
              {t("workbench.run")}
            </button>
            <button
              type="button"
              onClick={reset}
              className="grid h-10 w-10 place-items-center rounded-xl border border-line bg-white text-muted transition hover:border-primary/40 hover:text-primary"
              aria-label={t("workbench.reset")}
            >
              <RotateCcw className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </aside>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-spec border border-line bg-panel p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-ink">{tool.inputLabel}</h2>
            {tool.acceptsFile && operation === "encode" ? (
              <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-xl border border-line px-3 text-sm font-medium text-muted transition hover:border-primary/40 hover:text-primary">
                <Upload className="h-4 w-4" aria-hidden="true" />
                {t("workbench.select")}
                <input className="sr-only" type="file" accept="image/*" onChange={(event) => void handleFile(event.target.files?.[0])} />
              </label>
            ) : null}
          </div>

          {tool.acceptsFile && operation === "encode" ? (
            <div className="grid min-h-[18rem] place-items-center rounded-xl border border-dashed border-line bg-canvas p-6 text-center text-sm text-muted">
              <span>{fileName || tool.placeholder}</span>
            </div>
          ) : (
            <textarea
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder={tool.placeholder}
              spellCheck={false}
              className="min-h-[18rem] w-full resize-y rounded-xl border border-line bg-canvas p-4 font-mono text-sm leading-6 text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
          )}

          {tool.secondaryInputLabel ? (
            <div className="mt-5">
              <label className="mb-3 block text-sm font-semibold text-ink">{tool.secondaryInputLabel}</label>
              <textarea
                value={secondaryInput}
                onChange={(event) => setSecondaryInput(event.target.value)}
                placeholder={tool.secondaryPlaceholder}
                spellCheck={false}
                className="min-h-[12rem] w-full resize-y rounded-xl border border-line bg-canvas p-4 font-mono text-sm leading-6 text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
              />
            </div>
          ) : null}
        </div>

        <div className="rounded-spec border border-line bg-panel p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-ink">{t("workbench.output")}</h2>
            <button
              type="button"
              onClick={copyOutput}
              disabled={!output}
              className="inline-flex h-9 items-center gap-2 rounded-xl border border-line px-3 text-sm font-medium text-muted transition hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              {copied ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copied ? t("workbench.copied") : t("workbench.copy")}
            </button>
          </div>
          {error ? (
            <div className="min-h-[18rem] rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">{error}</div>
          ) : tool.path === "/tools/base64/image" && operation === "decode" ? (
            output ? (
              <div className="grid min-h-[18rem] place-items-center rounded-xl border border-line bg-canvas p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={output} alt="Decoded" className="max-h-96 max-w-full rounded-lg object-contain" />
              </div>
            ) : (
              <div className="grid min-h-[18rem] place-items-center rounded-xl border border-dashed border-line bg-canvas p-6 text-center text-sm text-muted">
                <span>Paste Base64 to decode</span>
              </div>
            )
          ) : (
            <textarea
              value={output}
              readOnly
              spellCheck={false}
              className="min-h-[18rem] w-full resize-y rounded-xl border border-line bg-canvas p-4 font-mono text-sm leading-6 text-ink outline-none"
            />
          )}

          {Object.keys(meta).length ? (
            <dl className="mt-4 grid gap-2 text-sm">
              {Object.entries(meta).map(([key, value]) => (
                <div key={key} className="flex min-w-0 items-center justify-between gap-3 rounded-xl bg-primary-soft px-3 py-2">
                  <dt className="shrink-0 font-medium text-primary">{key}</dt>
                  <dd className="min-w-0 truncate font-mono text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      </section>
    </div>
  );
}

async function executeTool({
  path,
  operation,
  algorithm,
  padding,
  keyEncoding,
  ivEncoding,
  inputEncoding,
  outputEncoding,
  input,
  secondaryInput,
  secret,
  iv
}: {
  path: string;
  operation: string;
  algorithm: string;
  padding: string;
  keyEncoding: string;
  ivEncoding: string;
  inputEncoding: string;
  outputEncoding: string;
  input: string;
  secondaryInput: string;
  secret: string;
  iv: string;
}): Promise<{ output: string; meta?: Record<string, string | number> }> {
  const cryptoOptions = {
    keyEncoding,
    ivEncoding,
    inputEncoding,
    outputEncoding
  };

  if (path === "/tools/crypto/aes") {
    if (!secret) throw new I18nError("error.aes.secretRequired");
    if (operation === "decrypt" && algorithm.includes("CBC") && !iv) throw new I18nError("error.aes.ivRequired");
    if (operation === "encrypt") return aesEncrypt(input, secret, algorithm as "AES-GCM" | "AES-CBC" | "AES-ECB", iv || "", padding, cryptoOptions);
    return { output: await aesDecrypt(input, secret, algorithm as "AES-GCM" | "AES-CBC" | "AES-ECB", iv, padding, cryptoOptions) };
  }

  if (path === "/tools/crypto/des") {
    if (!secret) throw new I18nError("error.des.secretRequired");
    if (operation === "encrypt") return { output: desEncrypt(input, secret, algorithm as "DES-CBC" | "DES-ECB" | "DES-CFB" | "DES-OFB" | "DES-CTR", iv, padding, cryptoOptions) };
    return { output: desDecrypt(input, secret, algorithm as "DES-CBC" | "DES-ECB" | "DES-CFB" | "DES-OFB" | "DES-CTR", iv, padding, cryptoOptions) };
  }

  if (path === "/tools/crypto/sm4") {
    if (!secret) throw new I18nError("error.sm4.secretRequired");
    if (algorithm.includes("CBC") && !iv) throw new I18nError("error.sm4.ivRequired");
    if (operation === "encrypt") return { output: sm4Encrypt(input, secret, algorithm as "SM4-CBC" | "SM4-ECB", iv, padding, cryptoOptions) };
    return { output: sm4Decrypt(input, secret, algorithm as "SM4-CBC" | "SM4-ECB", iv, padding, cryptoOptions) };
  }

  if (path === "/tools/crypto/hash") {
    return { output: await hashText(input, algorithm as "MD5" | "SHA-1" | "SHA-256" | "SHA-512", inputEncoding as "text" | "base64" | "hex") };
  }

  if (path === "/tools/crypto/hmac") {
    if (!secret) throw new I18nError("error.hmac.secretRequired");
    return { output: hmacText(input, secret, algorithm as "HMAC-MD5" | "HMAC-SHA256" | "HMAC-SHA512", { inputEncoding, keyEncoding }) };
  }

  if (path === "/tools/json/formatter") {
    return { output: operation === "minify" ? minifyJson(input) : formatJson(input) };
  }

  if (path === "/tools/json/diff") {
    return { output: diffJson(input, secondaryInput) };
  }

  if (path === "/tools/base64/text") {
    return { output: operation === "decode" ? base64ToText(input) : textToBase64(input) };
  }

  if (path === "/tools/base64/image") {
    if (operation === "encode") return { output: "" };
    const result = decodeBase64Image(input);
    return { output: result.dataUrl, meta: { mimeType: result.mimeType } };
  }

  if (path === "/tools/url/encode") {
    return { output: operation === "decode" ? decodeUrl(input) : encodeUrl(input) };
  }

  if (path === "/tools/ai/messages-formatter") {
    return { output: formatMessages(input) };
  }

  if (path === "/tools/ai/prompt-escape") {
    return { output: escapePrompt(input) };
  }

  if (path === "/tools/ai/sse-parser") {
    return { output: parseSse(input) };
  }

  if (path === "/tools/ai/token-estimator") {
    return estimateTokens(input);
  }

  throw new I18nError("error.unsupportedTool");
}
