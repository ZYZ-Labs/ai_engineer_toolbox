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
            <pre key={index}>
              <code>{block.code}</code>
            </pre>
          );
        }
        return null;
      })}
    </article>
  );
}
