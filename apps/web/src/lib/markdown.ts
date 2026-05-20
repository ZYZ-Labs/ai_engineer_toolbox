export type MarkdownBlock =
  | { type: "h1" | "h2" | "h3"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "blockquote"; text: string }
  | { type: "code"; code: string; lang: string };

export function parseMarkdown(source: string): MarkdownBlock[] {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: MarkdownBlock[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const code: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].startsWith("```")) {
        code.push(lines[index]);
        index += 1;
      }
      blocks.push({ type: "code", code: code.join("\n"), lang });
      index += 1;
      continue;
    }

    if (line.startsWith("### ")) {
      blocks.push({ type: "h3", text: line.slice(4) });
      index += 1;
      continue;
    }

    if (line.startsWith("## ")) {
      blocks.push({ type: "h2", text: line.slice(3) });
      index += 1;
      continue;
    }

    if (line.startsWith("# ")) {
      blocks.push({ type: "h1", text: line.slice(2) });
      index += 1;
      continue;
    }

    if (line.startsWith("> ")) {
      const quote: string[] = [];
      while (index < lines.length && lines[index].startsWith("> ")) {
        quote.push(lines[index].slice(2));
        index += 1;
      }
      blocks.push({ type: "blockquote", text: quote.join(" ") });
      continue;
    }

    if (/^- /.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^- /.test(lines[index])) {
        items.push(lines[index].slice(2));
        index += 1;
      }
      blocks.push({ type: "ul", items });
      continue;
    }

    if (/^\d+\. /.test(line)) {
      const items: string[] = [];
      while (index < lines.length && /^\d+\. /.test(lines[index])) {
        items.push(lines[index].replace(/^\d+\. /, ""));
        index += 1;
      }
      blocks.push({ type: "ol", items });
      continue;
    }

    const paragraph: string[] = [];
    while (
      index < lines.length &&
      lines[index].trim() &&
      !/^(#|```|> |- |\d+\. )/.test(lines[index])
    ) {
      paragraph.push(lines[index]);
      index += 1;
    }
    blocks.push({ type: "p", text: paragraph.join(" ") });
  }

  return blocks;
}
