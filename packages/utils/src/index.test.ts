import { describe, expect, it } from "vitest";
import CryptoJS from "crypto-js";
import {
  base64ToText,
  calcDate,
  convertBase,
  convertCase,
  convertColor,
  convertTimestamp,
  decodeJwt,
  diffJson,
  diffText,
  encodeUrl,
  escapePrompt,
  escapeString,
  formatJson,
  formatMessages,
  generatePasswords,
  generateUuids,
  hashBuffer,
  hmacText,
  jsonToYaml,
  parseCron,
  parseSse,
  parseUrl,
  runRegex,
  textToBase64,
  unescapeString,
  yamlToJson
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

  it("converts timestamps and dates", () => {
    const dateStr = "2026-07-14T00:00:00.000Z";
    const ms = new Date(dateStr).getTime();
    const seconds = Math.floor(ms / 1000);
    expect(convertTimestamp(dateStr, "toTimestamp", "Seconds")).toBe(String(seconds));
    expect(convertTimestamp(String(seconds), "toDate", "Seconds")).toContain("2026-07-14T00:00:00.000Z");
    expect(convertTimestamp(String(ms), "toDate", "Milliseconds")).toContain("2026-07-14T00:00:00.000Z");
    expect(convertTimestamp("", "now", "Auto")).toContain("Seconds:");
  });
});

describe("diffText", () => {
  it("reports identical input", () => {
    expect(diffText("a\nb", "a\nb")).toBe("(no differences)");
  });

  it("reports identical input in Chinese", () => {
    expect(diffText("a\nb", "a\nb", "zh")).toBe("（无差异）");
  });

  it("marks removed and added lines in merged order", () => {
    const output = diffText("a\nb\nc", "a\nx\nc");
    expect(output).toBe("  a\n- b\n+ x\n  c");
  });

  it("handles pure additions", () => {
    expect(diffText("a", "a\nb")).toBe("  a\n+ b");
  });
});

describe("convertCase", () => {
  it("converts camelCase to snake_case", () => {
    expect(convertCase("helloWorld", "snake")).toBe("hello_world");
  });

  it("converts snake_case to camelCase", () => {
    expect(convertCase("hello_world", "camel")).toBe("helloWorld");
  });

  it("converts CONSTANT_CASE to kebab-case", () => {
    expect(convertCase("HELLO_WORLD", "kebab")).toBe("hello-world");
  });

  it("keeps empty lines empty", () => {
    expect(convertCase("foo\n\nbar", "snake")).toBe("foo\n\nbar");
  });
});

describe("string escape helpers", () => {
  it("escapes backslash, quote, newline, tab and carriage return", () => {
    expect(escapeString('a"b\nc\td\\e')).toBe('a\\"b\\nc\\td\\\\e');
  });

  it("round trips and keeps non-ASCII as-is", () => {
    const original = '中文 "quoted"\n\ttab\\back';
    expect(escapeString(original)).toContain("中文");
    expect(unescapeString(escapeString(original))).toBe(original);
  });

  it("supports \\uXXXX escapes", () => {
    expect(unescapeString("\\u4e2d\\u6587")).toBe("中文");
  });

  it("throws on invalid escape sequences", () => {
    expect(() => unescapeString("bad \\x escape")).toThrow(/Invalid escape sequence/);
  });
});

describe("runRegex", () => {
  it("honors leading (?i) inline flag", () => {
    const output = runRegex("(?i)hello", "HeLLo world hello");
    expect(output).toContain('Match 1: [0, 5) "HeLLo"');
    expect(output).toContain('Match 2: [12, 17) "hello"');
  });

  it("lists numbered capture groups", () => {
    const output = runRegex("(\\w+)@(\\w+)", "a@b");
    expect(output).toContain('Match 1: [0, 3) "a@b"');
    expect(output).toContain('group 1: "a"');
    expect(output).toContain('group 2: "b"');
  });

  it("reports no matches", () => {
    expect(runRegex("zzz", "abc")).toBe("No matches.");
  });

  it("reports matches and groups in Chinese", () => {
    const output = runRegex("(\\w+)@(\\w+)", "a@b", "zh");
    expect(output).toContain('匹配 1: [0, 3) "a@b"');
    expect(output).toContain('分组 1: "a"');
    expect(runRegex("zzz", "abc", "zh")).toBe("无匹配。");
  });

  it("throws on invalid pattern", () => {
    expect(() => runRegex("(", "abc")).toThrow(/Invalid regular expression/);
  });

  it("throws on unsupported inline flag", () => {
    expect(() => runRegex("(?x)abc", "abc")).toThrow(/Unsupported inline flag/);
  });
});

describe("decodeJwt", () => {
  const toBase64Url = (value: string) =>
    textToBase64(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");

  function buildHs256Token(payload: Record<string, unknown>, secret: string) {
    const header = toBase64Url(JSON.stringify({ alg: "HS256", typ: "JWT" }));
    const body = toBase64Url(JSON.stringify(payload));
    const signature = CryptoJS.enc.Base64.stringify(CryptoJS.HmacSHA256(`${header}.${body}`, secret))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
    return `${header}.${body}.${signature}`;
  }

  it("decodes a real HS256 token and verifies the signature", () => {
    const token = buildHs256Token({ sub: "user-1", exp: Math.floor(Date.now() / 1000) + 3600 }, "secret");
    const result = decodeJwt(token, "secret");
    const parsed = JSON.parse(result.output);
    expect(parsed.header.alg).toBe("HS256");
    expect(parsed.payload.sub).toBe("user-1");
    expect(parsed.signature).toBe(token.split(".")[2]);
    expect(result.meta).toEqual({ alg: "HS256", verified: "yes", expired: "no" });
  });

  it("reports verification failure with a wrong secret", () => {
    const token = buildHs256Token({ sub: "user-1" }, "secret");
    expect(decodeJwt(token, "wrong").meta.verified).toBe("no");
  });

  it("skips verification when no secret is given and flags expired tokens", () => {
    const token = buildHs256Token({ exp: 1 }, "secret");
    const result = decodeJwt(token);
    expect(result.meta.verified).toBe("not checked");
    expect(result.meta.expired).toBe("yes");
  });

  it("reports unknown expiry when payload has no exp", () => {
    const token = buildHs256Token({ sub: "user-1" }, "secret");
    expect(decodeJwt(token).meta.expired).toBe("unknown");
  });

  it("reports unsupported algorithms as not verified", () => {
    const header = toBase64Url(JSON.stringify({ alg: "RS256" }));
    const body = toBase64Url(JSON.stringify({ sub: "user-1" }));
    expect(decodeJwt(`${header}.${body}.fakesig`, "secret").meta.verified).toBe("no");
  });

  it("throws on malformed tokens", () => {
    expect(() => decodeJwt("not-a-jwt")).toThrow(/Malformed JWT/);
    expect(() => decodeJwt("!!!.@@@.###")).toThrow(/Malformed JWT/);
  });
});

describe("hashBuffer", () => {
  const data = new TextEncoder().encode("abc").buffer as ArrayBuffer;

  it("hashes with SHA-256 via WebCrypto", async () => {
    await expect(hashBuffer(data, "SHA-256")).resolves.toBe("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad");
  });

  it("hashes with MD5 via CryptoJS", async () => {
    await expect(hashBuffer(data, "MD5")).resolves.toBe("900150983cd24fb0d6963f7d28e17f72");
  });
});

describe("parseUrl", () => {
  it("parses a full URL with query params and hash", () => {
    const output = parseUrl("https://example.com:8080/path/to?q=1&b=two#frag");
    expect(output).toContain("Protocol: https");
    expect(output).toContain("Host: example.com:8080");
    expect(output).toContain("Port: 8080");
    expect(output).toContain("Path: /path/to");
    expect(output).toContain("q = 1");
    expect(output).toContain("b = two");
    expect(output).toContain("Hash: frag");
  });

  it("marks default port and empty query/hash", () => {
    const output = parseUrl("https://example.com/");
    expect(output).toContain("Port: (default)");
    expect(output).toContain("(none)");
    expect(output).toContain("Hash: (none)");
  });

  it("uses Chinese labels when lang is zh", () => {
    const output = parseUrl("https://example.com/path?q=1#frag", "zh");
    expect(output).toContain("协议: https");
    expect(output).toContain("路径: /path");
    expect(output).toContain("查询参数:");
    expect(output).toContain("锚点: frag");
    expect(parseUrl("https://example.com/", "zh")).toContain("（无）");
  });

  it("throws on invalid URLs", () => {
    expect(() => parseUrl("not a url")).toThrow(/Invalid URL/);
  });
});

describe("calcDate", () => {
  it("computes absolute diffs with a total seconds line", () => {
    const output = calcDate("diff", "2026-07-17T00:00:00.000Z", "2026-07-14T12:00:00.000Z");
    expect(output).toBe("2 days, 12 hours, 0 minutes, 0 seconds\nTotal seconds: 216000");
  });

  it("computes diffs with Chinese labels", () => {
    const output = calcDate("diff", "2026-07-17T00:00:00.000Z", "2026-07-14T12:00:00.000Z", { lang: "zh" });
    expect(output).toBe("2 天, 12 小时, 0 分钟, 0 秒\n总秒数: 216000");
  });

  it("adds a signed amount with the selected unit", () => {
    const added = calcDate("add", "2026-01-01T00:00:00.000Z", "9", { unit: "days" });
    expect(added.split("\n")[0]).toBe("ISO: 2026-01-10T00:00:00.000Z");
    const subtracted = calcDate("add", "2026-01-01T00:00:00.000Z", "-3", { unit: "hours" });
    expect(subtracted.split("\n")[0]).toBe("ISO: 2025-12-31T21:00:00.000Z");
    const fractional = calcDate("add", "2026-01-01T00:00:00.000Z", "1.5", { unit: "days" });
    expect(fractional.split("\n")[0]).toBe("ISO: 2026-01-02T12:00:00.000Z");
  });

  it("uses Chinese output labels when lang is zh", () => {
    const output = calcDate("add", "2026-01-01T00:00:00.000Z", "1", { unit: "weeks", lang: "zh" });
    expect(output).toContain("\n本地时间: ");
  });

  it("formats a date in an IANA time zone with a UTC line", () => {
    const output = calcDate("toZone", "2026-07-17T00:00:00.000Z", "", { zone: "Asia/Shanghai" });
    expect(output).toContain("Asia/Shanghai: 2026-07-17 08:00:00 GMT+08:00");
    expect(output).toContain("UTC: 2026-07-17T00:00:00.000Z");
  });

  it("throws on invalid dates, amounts and zones", () => {
    expect(() => calcDate("diff", "nope", "2026-01-01")).toThrow(/Invalid date input/);
    expect(() => calcDate("add", "2026-01-01T00:00:00.000Z", "3x", { unit: "days" })).toThrow(/Invalid amount/);
    expect(() => calcDate("toZone", "2026-01-01T00:00:00.000Z", "", { zone: "Not/AZone" })).toThrow(/Invalid time zone/);
  });
});

describe("parseCron", () => {
  it("describes fields and lists 5 next runs", () => {
    const output = parseCron("*/15 9-18 * * 1-5");
    expect(output).toContain("minute: every 15");
    expect(output).toContain("hour: 9-18");
    expect(output).toContain("day-of-week: 1-5");
    const lines = output.split("\n");
    const runsIndex = lines.indexOf("Next 5 runs:");
    expect(runsIndex).toBeGreaterThan(-1);
    const runs = lines.slice(runsIndex + 1);
    expect(runs).toHaveLength(5);
    runs.forEach((run) => expect(run).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/));
  });

  it("supports English month and weekday names", () => {
    const output = parseCron("0 9 * jan mon");
    expect(output).toContain("month: 1");
    expect(output).toContain("day-of-week: 1");
  });

  it("describes fields in Chinese when lang is zh", () => {
    const output = parseCron("*/15 9-18 * * 1-5", "zh");
    expect(output).toContain("分钟: 每 15");
    expect(output).toContain("小时: 9-18");
    expect(output).toContain("星期: 1-5");
    expect(output).toContain("未来 5 次执行时间:");
  });

  it("throws on out-of-range values and unsupported extensions", () => {
    expect(() => parseCron("61 * * * *")).toThrow(/out of range/);
    expect(() => parseCron("0 0 L * *")).toThrow(/Unsupported cron syntax/);
    expect(() => parseCron("0 0 * *")).toThrow(/Expected 5 cron fields/);
  });
});

describe("convertBase", () => {
  it("auto-detects 0x hex prefixes and converts to the target base", () => {
    expect(convertBase("0xff", "Auto", "2")).toBe("Binary: 11111111");
    expect(convertBase("0xff", "Auto", "16")).toBe("Hex: ff");
    expect(convertBase("0xff", "Auto")).toBe("Decimal: 255");
  });

  it("supports arbitrarily large integers", () => {
    expect(convertBase("123456789012345678901234567890", "10", "10")).toBe("Decimal: 123456789012345678901234567890");
  });

  it("uses Chinese labels when lang is zh", () => {
    expect(convertBase("255", "10", "16", "zh")).toBe("十六进制: ff");
  });

  it("throws on digits invalid for the base", () => {
    expect(() => convertBase("102", "2", "10")).toThrow(/Invalid digit "2" for base 2/);
  });
});

describe("convertColor", () => {
  it("expands #rgb shorthand", () => {
    const result = convertColor("#fff");
    expect(result.meta.hex).toBe("#ffffff");
    expect(result.output).toContain("HEX: #ffffff");
    expect(result.output).toContain("RGB: rgb(255, 255, 255)");
  });

  it("converts hsl to hex", () => {
    expect(convertColor("hsl(0,100%,50%)").meta.hex).toBe("#ff0000");
    expect(convertColor("hsl(0, 100%, 50%)").output).toContain("HSL: hsl(0, 100%, 50%)");
  });

  it("parses rgb() input", () => {
    expect(convertColor("rgb(255, 0, 0)").meta.hex).toBe("#ff0000");
  });

  it("throws on unrecognized input", () => {
    expect(() => convertColor("banana")).toThrow(/Unrecognized color format/);
  });
});

describe("yaml/json converters", () => {
  it("converts YAML to formatted JSON", () => {
    expect(JSON.parse(yamlToJson("a: 1\nb:\n  - x\n"))).toEqual({ a: 1, b: ["x"] });
  });

  it("round trips JSON through YAML", () => {
    const value = { a: 1, b: ["x", "y"], c: { d: true } };
    expect(JSON.parse(yamlToJson(jsonToYaml(JSON.stringify(value))))).toEqual(value);
  });

  it("throws on invalid YAML and invalid JSON", () => {
    expect(() => yamlToJson("a: [1,")).toThrow(/Invalid YAML/);
    expect(() => jsonToYaml("{oops")).toThrow(/Invalid JSON/);
  });
});

describe("generateUuids", () => {
  it("generates v4 UUIDs in canonical format", () => {
    const [uuid] = generateUuids({ count: 1, version: "v4", uppercase: false, hyphens: true });
    expect(uuid).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  });

  it("generates sortable v7 UUIDs", async () => {
    const [first] = generateUuids({ count: 1, version: "v7", uppercase: false, hyphens: true });
    await new Promise((resolve) => setTimeout(resolve, 5));
    const [second] = generateUuids({ count: 1, version: "v7", uppercase: false, hyphens: true });
    expect(first).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(second >= first).toBe(true);
  });

  it("honors count, uppercase and hyphens options", () => {
    const list = generateUuids({ count: 3, version: "v4", uppercase: true, hyphens: false });
    expect(list).toHaveLength(3);
    list.forEach((uuid) => expect(uuid).toMatch(/^[0-9A-F]{32}$/));
  });

  it("throws when count is below 1", () => {
    expect(() => generateUuids({ count: 0, version: "v4", uppercase: false, hyphens: true })).toThrow(/Count/);
  });
});

describe("generatePasswords", () => {
  const baseOptions = {
    count: 2,
    length: 24,
    lowercase: true,
    uppercase: true,
    digits: true,
    symbols: true,
    excludeAmbiguous: false
  };

  it("builds passwords only from the selected charsets", () => {
    const passwords = generatePasswords({ ...baseOptions, count: 5, length: 16, lowercase: true, uppercase: false, digits: false, symbols: false });
    expect(passwords).toHaveLength(5);
    passwords.forEach((password) => expect(password).toMatch(/^[a-z]{16}$/));
  });

  it("excludes ambiguous characters when requested", () => {
    const passwords = generatePasswords({ ...baseOptions, count: 50, length: 32, excludeAmbiguous: true });
    passwords.forEach((password) => expect(password).not.toMatch(/[l1IO0o]/));
  });

  it("throws when no charset is selected or length is invalid", () => {
    expect(() => generatePasswords({ ...baseOptions, lowercase: false, uppercase: false, digits: false, symbols: false })).toThrow(/character set/);
    expect(() => generatePasswords({ ...baseOptions, length: 0 })).toThrow(/Length/);
  });
});
