"use client";

import { useState } from "react";
import { Check, Copy, Play } from "lucide-react";
import type { ToolWorkbenchConfig } from "@/lib/tool-registry";
import { useI18n } from "@/lib/i18n";

type Props = {
  tool: ToolWorkbenchConfig;
};

const ALGORITHMS = ["RSA-OAEP-2048", "RSA-OAEP-4096", "ECDSA-P-256", "ECDH-P-256"] as const;
type KeygenAlgorithm = (typeof ALGORITHMS)[number];

const panelClass = "rounded-spec border border-line bg-panel p-5 shadow-sm";
const labelClass = "mb-2 block text-xs font-semibold uppercase tracking-wide text-muted";
const fieldClass = "h-11 w-full rounded-xl border border-line bg-white px-3 text-sm text-ink outline-none focus:border-primary focus:ring-4 focus:ring-primary/10";
const copyButtonClass = "inline-flex h-9 items-center gap-2 rounded-xl border border-line px-3 text-sm font-medium text-muted transition hover:border-primary/40 hover:text-primary disabled:cursor-not-allowed disabled:opacity-50";
const outputClass = "min-h-[14rem] w-full resize-y rounded-xl border border-line bg-canvas p-4 font-mono text-xs leading-5 text-ink outline-none";

function generateKeyPair(algorithm: KeygenAlgorithm): Promise<CryptoKeyPair> {
  if (algorithm === "ECDSA-P-256") {
    return crypto.subtle.generateKey({ name: "ECDSA", namedCurve: "P-256" }, true, ["sign", "verify"]);
  }
  if (algorithm === "ECDH-P-256") {
    return crypto.subtle.generateKey({ name: "ECDH", namedCurve: "P-256" }, true, ["deriveKey", "deriveBits"]);
  }
  return crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: algorithm === "RSA-OAEP-4096" ? 4096 : 2048,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256"
    },
    true,
    ["encrypt", "decrypt"]
  );
}

export function KeygenWorkbench({ tool }: Props) {
  const { t } = useI18n();
  const [algorithm, setAlgorithm] = useState<KeygenAlgorithm>("RSA-OAEP-2048");
  const [publicJwk, setPublicJwk] = useState("");
  const [privateJwk, setPrivateJwk] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [copiedKey, setCopiedKey] = useState<"" | "public" | "private">("");

  async function generate() {
    setBusy(true);
    setError("");
    setCopiedKey("");
    try {
      const keyPair = await generateKeyPair(algorithm);
      const publicKey = await crypto.subtle.exportKey("jwk", keyPair.publicKey);
      const privateKey = await crypto.subtle.exportKey("jwk", keyPair.privateKey);
      setPublicJwk(JSON.stringify(publicKey, null, 2));
      setPrivateJwk(JSON.stringify(privateKey, null, 2));
    } catch (cause) {
      setPublicJwk("");
      setPrivateJwk("");
      setError(cause instanceof Error ? cause.message : t("workbench.error.generic"));
    } finally {
      setBusy(false);
    }
  }

  async function copyKey(which: "public" | "private", value: string) {
    if (!value) return;
    await navigator.clipboard.writeText(value);
    setCopiedKey(which);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[20rem_minmax(0,1fr)]">
      <aside className={panelClass}>
        <h2 className="text-sm font-semibold text-ink">{t("workbench.algorithmSettings")}</h2>
        <div className="mt-5 space-y-5">
          <label className="block">
            <span className={labelClass}>{t("tool.keygen.option.algorithm")}</span>
            <select value={algorithm} onChange={(event) => setAlgorithm(event.target.value as KeygenAlgorithm)} className={fieldClass}>
              {ALGORITHMS.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>

          <button
            type="button"
            onClick={() => void generate()}
            disabled={busy}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted/30"
          >
            <Play className="h-4 w-4" aria-hidden="true" />
            {t("op.generate")}
          </button>

          <p className="text-xs leading-5 text-muted">{t("tool.keygen.localNote")}</p>
        </div>
      </aside>

      <section className="grid gap-6">
        <div className={panelClass}>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-ink">{t("tool.keygen.publicKey")}</h2>
            <button type="button" onClick={() => void copyKey("public", publicJwk)} disabled={!publicJwk} className={copyButtonClass}>
              {copiedKey === "public" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copiedKey === "public" ? t("workbench.copied") : t("workbench.copy")}
            </button>
          </div>
          <textarea value={publicJwk} readOnly placeholder={tool.placeholder} spellCheck={false} className={outputClass} />
        </div>

        <div className={panelClass}>
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-ink">{t("tool.keygen.privateKey")}</h2>
            <button type="button" onClick={() => void copyKey("private", privateJwk)} disabled={!privateJwk} className={copyButtonClass}>
              {copiedKey === "private" ? <Check className="h-4 w-4" aria-hidden="true" /> : <Copy className="h-4 w-4" aria-hidden="true" />}
              {copiedKey === "private" ? t("workbench.copied") : t("workbench.copy")}
            </button>
          </div>
          <textarea value={privateJwk} readOnly placeholder={tool.placeholder} spellCheck={false} className={outputClass} />
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">{error}</div>
        ) : null}
      </section>
    </div>
  );
}
