"use client";

import { useState } from "react";
import type { ToolWorkbenchConfig } from "@/lib/tool-registry";
import { MarkdownRenderer } from "@/components/study/MarkdownRenderer";
import { useI18n } from "@/lib/i18n";

type Props = {
  tool: ToolWorkbenchConfig;
};

const panelClass = "rounded-spec border border-line bg-panel p-5 shadow-sm";

export function MarkdownWorkbench({ tool }: Props) {
  const { t } = useI18n();
  const [input, setInput] = useState(tool.defaultInput);

  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <div className={panelClass}>
        <h2 className="mb-3 text-sm font-semibold text-ink">{tool.inputLabel}</h2>
        <textarea
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={tool.placeholder}
          spellCheck={false}
          className="min-h-[24rem] w-full resize-y rounded-xl border border-line bg-canvas p-4 font-mono text-sm leading-6 text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
        />
      </div>

      <div className={panelClass}>
        <h2 className="mb-3 text-sm font-semibold text-ink">{t("tool.markdownPreview.previewLabel")}</h2>
        <div className="min-h-[24rem] overflow-auto rounded-xl border border-line bg-canvas p-4">
          <MarkdownRenderer source={input} />
        </div>
      </div>
    </div>
  );
}
