"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Download } from "lucide-react";
import qrcode from "qrcode-generator";
import type { ToolWorkbenchConfig } from "@/lib/tool-registry";
import { useI18n } from "@/lib/i18n";

type Props = {
  tool: ToolWorkbenchConfig;
};

const SIZES = [128, 256, 512];
const LEVELS = ["L", "M", "Q", "H"] as const;
type ErrorCorrectionLevel = (typeof LEVELS)[number];

const panelClass = "rounded-spec border border-line bg-panel p-5 shadow-sm";
const labelClass = "mb-2 block text-xs font-semibold uppercase tracking-wide text-muted";
const fieldClass = "h-11 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/10";

// qrcode-generator's default stringToBytes truncates char codes to one byte,
// so encode to UTF-8 first and map each byte back to a char.
function toUtf8ByteString(value: string): string {
  const bytes = new TextEncoder().encode(value);
  let result = "";
  for (const byte of bytes) {
    result += String.fromCharCode(byte);
  }
  return result;
}

export function QrWorkbench({ tool }: Props) {
  const { t } = useI18n();
  const [text, setText] = useState(tool.defaultInput);
  const [size, setSize] = useState(256);
  const [level, setLevel] = useState<ErrorCorrectionLevel>("M");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const matrix = useMemo(() => {
    try {
      const qr = qrcode(0, level);
      qr.addData(toUtf8ByteString(text));
      qr.make();
      const moduleCount = qr.getModuleCount();
      const modules: boolean[] = [];
      for (let row = 0; row < moduleCount; row += 1) {
        for (let col = 0; col < moduleCount; col += 1) {
          modules.push(qr.isDark(row, col));
        }
      }
      return { moduleCount, modules, error: "" };
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : typeof cause === "string" ? cause : t("workbench.error.generic");
      return { moduleCount: 0, modules: [] as boolean[], error: message };
    }
  }, [text, level, t]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (!canvas || !context || matrix.error) return;
    const quietZone = 4;
    const cellSize = Math.max(1, Math.floor(size / (matrix.moduleCount + quietZone * 2)));
    const canvasSize = cellSize * (matrix.moduleCount + quietZone * 2);
    canvas.width = canvasSize;
    canvas.height = canvasSize;
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvasSize, canvasSize);
    context.fillStyle = "#000000";
    for (let row = 0; row < matrix.moduleCount; row += 1) {
      for (let col = 0; col < matrix.moduleCount; col += 1) {
        if (matrix.modules[row * matrix.moduleCount + col]) {
          context.fillRect((col + quietZone) * cellSize, (row + quietZone) * cellSize, cellSize, cellSize);
        }
      }
    }
  }, [matrix, size]);

  function downloadPng() {
    const canvas = canvasRef.current;
    if (!canvas || matrix.error) return;
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "qrcode.png";
    link.click();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
      <aside className={panelClass}>
        <h2 className="text-sm font-semibold text-ink">{t("workbench.algorithmSettings")}</h2>
        <div className="mt-5 space-y-5">
          <label className="block">
            <span className={labelClass}>{t("tool.qr.option.size")}</span>
            <select value={size} onChange={(event) => setSize(Number(event.target.value))} className={fieldClass}>
              {SIZES.map((item) => (
                <option key={item} value={item}>
                  {item} × {item}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className={labelClass}>{t("tool.qr.option.errorCorrection")}</span>
            <select value={level} onChange={(event) => setLevel(event.target.value as ErrorCorrectionLevel)} className={fieldClass}>
              {LEVELS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={downloadPng}
            disabled={Boolean(matrix.error)}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted/30"
          >
            <Download className="h-4 w-4" aria-hidden="true" />
            {t("tool.qr.download")}
          </button>
        </div>
      </aside>

      <section className={panelClass}>
        <h2 className="mb-3 text-sm font-semibold text-ink">{tool.inputLabel}</h2>
        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={tool.placeholder}
          spellCheck={false}
          className="min-h-[6rem] w-full resize-y rounded-xl border border-line bg-canvas p-4 font-mono text-sm leading-6 text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
        />
        {matrix.error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">{matrix.error}</div>
        ) : null}
        <div className="mt-4 grid place-items-center rounded-xl border border-line bg-canvas p-6">
          <canvas ref={canvasRef} className="max-w-full rounded-xl border border-line" aria-label="QR code" />
        </div>
      </section>
    </div>
  );
}
