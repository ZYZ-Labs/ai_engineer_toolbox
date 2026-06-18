import { parseMarkdown } from "@/lib/markdown";

function InlineText({ text }: { text: string }) {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);

  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code key={index} className="rounded-md bg-primary-soft px-1.5 py-0.5 font-mono text-sm text-primary">
              {part.slice(1, -1)}
            </code>
          );
        }
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={index} className="font-semibold text-ink">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={index}>{part}</span>;
      })}
    </>
  );
}

function codeBlockLabel(lang: string) {
  const normalized = lang.toLowerCase();
  if (normalized === "terminal" || normalized === "console") return "PowerShell / cmd / Git Bash";
  if (normalized === "bash" || normalized === "sh" || normalized === "shell") return "Git Bash / macOS / Linux";
  if (normalized === "powershell" || normalized === "ps1") return "PowerShell";
  if (normalized === "bat" || normalized === "cmd") return "cmd";
  if (normalized === "txt" || normalized === "text") return "Text";
  if (normalized === "gitignore") return ".gitignore";
  if (normalized === "gitattributes") return ".gitattributes";
  if (normalized === "gdscript") return "GDScript";
  return lang;
}

export function MarkdownRenderer({ source }: { source: string }) {
  const blocks = parseMarkdown(source);

  return (
    <article className="prose-like">
      {blocks.map((block, index) => {
        if (block.type === "h1") return <h1 key={index}>{block.text}</h1>;
        if (block.type === "h2") return <h2 key={index}>{block.text}</h2>;
        if (block.type === "h3") return <h3 key={index}>{block.text}</h3>;
        if (block.type === "p") {
          return (
            <p key={index}>
              <InlineText text={block.text} />
            </p>
          );
        }
        if (block.type === "blockquote") {
          return (
            <blockquote key={index}>
              <InlineText text={block.text} />
            </blockquote>
          );
        }
        if (block.type === "image") {
          return (
            <figure key={index} className="my-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={block.src} alt={block.alt} className="h-auto w-full" loading="lazy" />
              {block.alt ? <figcaption className="border-t border-slate-100 px-4 py-2 text-sm text-slate-600">{block.alt}</figcaption> : null}
            </figure>
          );
        }
        if (block.type === "ul") {
          return (
            <ul key={index}>
              {block.items.map((item) => (
                <li key={item}>
                  <InlineText text={item} />
                </li>
              ))}
            </ul>
          );
        }
        if (block.type === "ol") {
          return (
            <ol key={index}>
              {block.items.map((item) => (
                <li key={item}>
                  <InlineText text={item} />
                </li>
              ))}
            </ol>
          );
        }
        if (block.type === "table") {
          return (
            <div key={index} className="my-5 overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    {block.headers.map((header) => (
                      <th key={header}>
                        <InlineText text={header} />
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((cell, cellIndex) => (
                        <td key={`${rowIndex}-${cellIndex}`}>
                          <InlineText text={cell} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }
        if (block.type === "code") {
          return (
            <div key={index} className="my-5 overflow-hidden rounded-lg border border-slate-200 bg-slate-950">
              {block.lang ? (
                <div className="border-b border-white/10 bg-slate-900 px-4 py-2 font-mono text-xs font-semibold text-slate-300">
                  {codeBlockLabel(block.lang)}
                </div>
              ) : null}
              <pre className="m-0 rounded-none border-0">
                <code>{block.code}</code>
              </pre>
            </div>
          );
        }
        return null;
      })}
    </article>
  );
}
