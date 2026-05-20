import { describe, expect, it } from "vitest";
import {
  base64ToText,
  diffJson,
  encodeUrl,
  escapePrompt,
  formatJson,
  formatMessages,
  hmacText,
  parseSse,
  textToBase64
} from ".";

describe("browser utility helpers", () => {
  it("round trips UTF-8 base64 text", () => {
    const encoded = textToBase64("hello 工程");
    expect(base64ToText(encoded)).toBe("hello 工程");
  });

  it("formats and diffs JSON", () => {
    expect(formatJson('{"b":1,"a":[true]}')).toContain('"a"');
    expect(diffJson('{"a":1}', '{"a":2,"b":3}')).toContain("+ $.b: 3");
  });

  it("formats OpenAI-style messages", () => {
    const output = formatMessages('[{"role":"system","content":"Be precise."}]');
    expect(output).toContain("SYSTEM");
    expect(output).toContain("Be precise.");
  });

  it("handles common text tools", () => {
    expect(encodeUrl("a b")).toBe("a%20b");
    expect(escapePrompt("`$x`")).toBe("\\`\\$x\\`");
    expect(parseSse("event: ping\ndata: ok\n\n")).toContain('"data": "ok"');
    expect(hmacText("abc", "key", "HMAC-SHA256")).toHaveLength(64);
  });
});
