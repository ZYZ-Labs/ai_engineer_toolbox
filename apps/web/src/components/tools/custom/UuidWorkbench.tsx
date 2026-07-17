"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Check, Copy, Play } from "lucide-react";
import { generateUuids } from "@ai-engineer-toolbox/utils";
import type { ToolWorkbenchConfig } from "@/lib/tool-registry";
import { useI18n } from "@/lib/i18n";

type Props = {
  tool: ToolWorkbenchConfig;
};

const panelClass = "rounded-spec border border-line bg-panel p-5 shadow-sm";
const labelClass = "mb-2 block text-xs font-semibold uppercase tracking-wide text-muted";
const fieldClass = "h-11 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/10";

function clampCount(value: number) {
  if (!Number.isFinite(value)) return 1;
  return Math.min(100, Math.max(1, Math.floor(value)));
}

export function UuidWorkbench({ tool }: Props) {
  const { t } = useI18n();
  const [version, setVersion] = useState<"v4" | "v7">("v4");
  const [count, setCount] = useState(5);
  const [uppercase, setUppercase] = useState(false);
  const [hyphens, setHyphens] = useState(true);
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const didGenerate = useRef(false);

  const generate = useCallback(() => {
    const ids = generateUuids({ count: clampCount(count), version, uppercase, hyphens });
    setOutput(ids.join("\n"));
    setCopied(false);
  }, [count, version, uppercase, hyphens]);

  useEffect(() => {
    if (!didGenerate.current) {
      didGenerate.current = true;
      generate();
    }
  }, [generate]);

  async function copyOutput() {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
      <aside className={panelClass}>
        <h2 className="text-sm font-semibold text-ink">{t("workbench.algorithmSettings")}</h2>
        <div className="mt-5 space-y-5">
          <label className="block">
            <span className={labelClass}>{t("tool.uuid.option.version")}</span>
            <select value={version} onChange={(event) => setVersion(event.target.value as "v4" | "v7")} className={fieldClass}>
              <option value="v4">UUID v4</option>
              <option value="v7">UUID v7</option>
            </select>
          </label>

          <label className="block">
            <span className={labelClass}>{t("tool.uuid.option.count")}</span>
            <input
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(event) => setCount(event.target.valueAsNumber)}
              className={fieldClass}
            />
          </label>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" checked={uppercase} onChange={(event) => setUppercase(event.target.checked)} className="h-4 w-4 accent-primary" />
              {t("tool.uuid.option.uppercase")}
            </label>
            <label className="flex items-center gap-2 text-sm text-ink">
              <input type="checkbox" checked={hyphens} onChange={(event) => setHyphens(event.target.checked)} className="h-4 w-4 accent-primary" />
              {t("tool.uuid.option.hyphens")}
            </label>
          </div>

          <button
            type="button"
            onClick={generate}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary/90"
          >
            <Play className="h-4 w-4" aria-hidden="true" />
            {t("op.generate")}
          </button>
        </div>
      </aside>

      <section className={panelClass}>
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-ink">{tool.inputLabel}</h2>
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
        <textarea
          value={output}
          readOnly
          placeholder={tool.placeholder}
          spellCheck={false}
          className="min-h-[18rem] w-full resize-y rounded-xl border border-line bg-canvas p-4 font-mono text-sm leading-6 text-ink outline-none"
        />
      </section>
    </div>
  );
}
