"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy, Upload } from "lucide-react";
import jsQR from "jsqr";
import type { ToolWorkbenchConfig } from "@/lib/tool-registry";
import { useI18n } from "@/lib/i18n";

type Props = {
  tool: ToolWorkbenchConfig;
};

const panelClass = "rounded-spec border border-line bg-panel p-5 shadow-sm";

export function QrDecodeWorkbench({ tool }: Props) {
  const { t } = useI18n();
  const [previewUrl, setPreviewUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const previewUrlRef = useRef("");

  const setPreview = useCallback((url: string) => {
    if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = url;
    setPreviewUrl(url);
  }, []);

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) URL.revokeObjectURL(previewUrlRef.current);
    };
  }, []);

  const processFile = useCallback(
    async (file: File) => {
      setError("");
      setCopied(false);
      if (!file.type.startsWith("image/")) {
        setError(t("tool.qrDecode.error.notImage"));
        return;
      }
      setFileName(file.name || "pasted-image");
      setPreview(URL.createObjectURL(file));
      try {
        const bitmap = await createImageBitmap(file);
        const canvas = document.createElement("canvas");
        canvas.width = bitmap.width;
        canvas.height = bitmap.height;
        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context) throw new Error("Canvas 2D context unavailable.");
        context.drawImage(bitmap, 0, 0);
        bitmap.close();
        const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
        const result = jsQR(imageData.data, imageData.width, imageData.height);
        if (!result) {
          setOutput("");
          setError(t("tool.qrDecode.error.notFound"));
          return;
        }
        setOutput(result.data);
      } catch (cause) {
        setOutput("");
        setError(cause instanceof Error ? cause.message : t("workbench.error.generic"));
      }
    },
    [setPreview, t]
  );

  useEffect(() => {
    function handlePaste(event: ClipboardEvent) {
      const items = event.clipboardData?.items;
      if (!items || items.length === 0) return;
      for (const item of items) {
        if (item.kind === "file" && item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) void processFile(file);
          return;
        }
      }
    }
    window.addEventListener("paste", handlePaste);
    return () => window.removeEventListener("paste", handlePaste);
  }, [processFile]);

  async function copyOutput() {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
      <aside className={panelClass}>
        <h2 className="text-sm font-semibold text-ink">{tool.inputLabel}</h2>
        <div className="mt-5 space-y-5">
          <label className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary/90">
            <Upload className="h-4 w-4" aria-hidden="true" />
            {t("tool.qrDecode.select")}
            <input
              className="sr-only"
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void processFile(file);
                event.target.value = "";
              }}
            />
          </label>
          <p className="text-sm text-muted">{t("tool.qrDecode.pasteHint")}</p>
          {fileName ? <p className="truncate font-mono text-sm text-ink" title={fileName}>{fileName}</p> : null}
        </div>
      </aside>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className={panelClass}>
          <h2 className="mb-3 text-sm font-semibold text-ink">{t("tool.qrDecode.preview")}</h2>
          {previewUrl ? (
            <div className="grid min-h-[18rem] place-items-center rounded-xl border border-line bg-canvas p-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={previewUrl} alt={fileName || "QR preview"} className="max-h-96 max-w-full rounded-lg object-contain" />
            </div>
          ) : (
            <div className="grid min-h-[18rem] place-items-center rounded-xl border border-dashed border-line bg-canvas p-6 text-center text-sm text-muted">
              <span>{t("tool.qrDecode.empty")}</span>
            </div>
          )}
        </div>

        <div className={panelClass}>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-ink">{t("tool.qrDecode.result")}</h2>
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
          ) : (
            <textarea
              value={output}
              readOnly
              spellCheck={false}
              className="min-h-[18rem] w-full resize-y rounded-xl border border-line bg-canvas p-4 font-mono text-sm leading-6 text-ink outline-none"
            />
          )}
        </div>
      </section>
    </div>
  );
}
