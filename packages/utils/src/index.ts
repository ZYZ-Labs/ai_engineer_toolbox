import CryptoJS from "crypto-js";
import { load as loadYaml, dump as dumpYaml } from "js-yaml";
import { sm4 } from "sm-crypto";

export type ToolOperation = "encode" | "decode" | "encrypt" | "decrypt" | "format" | "minify" | "diff" | "parse" | "estimate";

export type Lang = "en" | "zh";

export type ToolResult = {
  output: string;
  meta?: Record<string, string | number>;
};

const encoder = new TextEncoder();
const decoder = new TextDecoder();

// ---------- Hex helpers ----------

export function bytesToHex(bytes: ArrayBuffer | Uint8Array) {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  return Array.from(view, (b) => b.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(hex: string): Uint8Array {
  const clean = hex.replace(/\s/g, "");
  if (clean.length % 2 !== 0) throw new Error("Invalid hex string length.");
  return Uint8Array.from(clean.match(/.{2}/g)!.map((byte) => parseInt(byte, 16)));
}

// ---------- Base64 helpers ----------

export function textToBase64(value: string) {
  return bytesToBase64(encoder.encode(value));
}

export function base64ToText(value: string) {
  return decoder.decode(base64ToBytes(value));
}

export function bytesToBase64(bytes: ArrayBuffer | Uint8Array) {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let binary = "";
  view.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

export function base64ToBytes(value: string) {
  const binary = atob(value.trim());
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

// ---------- Encoding helpers ----------

function decodeToBytes(value: string, encoding: "text" | "base64" | "hex"): Uint8Array {
  if (encoding === "base64") return base64ToBytes(value);
  if (encoding === "hex") return hexToBytes(value);
  return encoder.encode(value);
}

function encodeFromBytes(bytes: Uint8Array, encoding: "base64" | "hex"): string {
  if (encoding === "hex") return bytesToHex(bytes);
  return bytesToBase64(bytes);
}

function decodeToString(value: string, encoding: "text" | "base64" | "hex"): string {
  if (encoding === "base64") return base64ToText(value);
  if (encoding === "hex") return decoder.decode(hexToBytes(value));
  return value;
}

function encodeString(value: string, encoding: "text" | "base64" | "hex"): string {
  if (encoding === "base64") return textToBase64(value);
  if (encoding === "hex") return bytesToHex(encoder.encode(value));
  return value;
}

// ---------- CryptoJS helpers ----------

function parseWordArray(value: string, encoding: "text" | "base64" | "hex") {
  if (encoding === "base64") return CryptoJS.enc.Base64.parse(value);
  if (encoding === "hex") return CryptoJS.enc.Hex.parse(value);
  return CryptoJS.enc.Utf8.parse(value);
}

function wordArrayToString(words: CryptoJS.lib.WordArray, encoding: "text" | "base64" | "hex"): string {
  if (encoding === "base64") return CryptoJS.enc.Base64.stringify(words);
  if (encoding === "hex") return words.toString(CryptoJS.enc.Hex);
  return words.toString(CryptoJS.enc.Utf8);
}

function getCryptoJSMode(mode: string) {
  switch (mode) {
    case "ECB": return CryptoJS.mode.ECB;
    case "CFB": return CryptoJS.mode.CFB;
    case "OFB": return CryptoJS.mode.OFB;
    case "CTR": return CryptoJS.mode.CTR;
    default: return CryptoJS.mode.CBC;
  }
}

function getCryptoJSPadding(name: string) {
  switch (name) {
    case "NoPadding": return CryptoJS.pad.NoPadding;
    case "ZeroPadding": return CryptoJS.pad.ZeroPadding;
    case "Iso97971": return CryptoJS.pad.Iso97971;
    case "AnsiX923": return CryptoJS.pad.AnsiX923;
    case "Iso10126": return CryptoJS.pad.Iso10126;
    default: return CryptoJS.pad.Pkcs7;
  }
}

function cipherParamsFromString(value: string, encoding: "base64" | "hex") {
  if (encoding === "hex") {
    return CryptoJS.lib.CipherParams.create({ ciphertext: CryptoJS.enc.Hex.parse(value) });
  }
  return value;
}

// ---------- SM4 helpers ----------

function sm4KeyHex(value: string, encoding: "text" | "base64" | "hex"): string {
  const bytes = decodeToBytes(value, encoding);
  const padded = new Uint8Array(16);
  padded.set(bytes.slice(0, 16));
  return Array.from(padded, (b) => b.toString(16).padStart(2, "0")).join("");
}

// ---------- AES ----------

export async function aesEncrypt(
  input: string,
  keyText: string,
  mode: "AES-GCM" | "AES-CBC" | "AES-ECB",
  ivText?: string,
  paddingName = "PKCS7",
  options: { keyEncoding?: string; ivEncoding?: string; inputEncoding?: string; outputEncoding?: string } = {}
): Promise<ToolResult> {
  const keyEncoding = (options.keyEncoding || "text") as "text" | "base64" | "hex";
  const ivEncoding = (options.ivEncoding || "text") as "text" | "base64" | "hex";
  const inputEncoding = (options.inputEncoding || "text") as "text" | "base64" | "hex";
  const outputEncoding = (options.outputEncoding || "base64") as "base64" | "hex";

  if (mode === "AES-GCM") {
    const key = await deriveAesKeyFromBytes(decodeToBytes(keyText, keyEncoding) as BufferSource, mode);
    const iv = ivText ? decodeToBytes(ivText, ivEncoding) as BufferSource : crypto.getRandomValues(new Uint8Array(12));
    const plaintext = decodeToBytes(input, inputEncoding) as BufferSource;
    const encrypted = await crypto.subtle.encrypt({ name: mode, iv }, key, plaintext);
    return {
      output: encodeFromBytes(new Uint8Array(encrypted), outputEncoding),
      meta: { iv: encodeFromBytes(iv instanceof ArrayBuffer ? new Uint8Array(iv) : iv as Uint8Array, outputEncoding) }
    };
  }

  const padding = getCryptoJSPadding(paddingName);
  const keyWords = parseWordArray(keyText, keyEncoding);
  const cfg: Record<string, unknown> = {
    mode: getCryptoJSMode(mode.replace("AES-", "")),
    padding,
    ...(mode === "AES-CBC" ? { iv: parseWordArray(ivText || "", ivEncoding) } : {})
  };

  const plaintext = parseWordArray(input, inputEncoding);
  const encrypted = CryptoJS.AES.encrypt(plaintext, keyWords, cfg);

  return {
    output: outputEncoding === "hex"
      ? encrypted.ciphertext.toString(CryptoJS.enc.Hex)
      : encrypted.toString(),
    meta: mode === "AES-CBC" ? { iv: ivText || "" } : undefined
  };
}

export async function aesDecrypt(
  input: string,
  keyText: string,
  mode: "AES-GCM" | "AES-CBC" | "AES-ECB",
  ivText: string,
  paddingName = "PKCS7",
  options: { keyEncoding?: string; ivEncoding?: string; inputEncoding?: string; outputEncoding?: string } = {}
): Promise<string> {
  const keyEncoding = (options.keyEncoding || "text") as "text" | "base64" | "hex";
  const ivEncoding = (options.ivEncoding || "text") as "text" | "base64" | "hex";
  const inputEncoding = (options.inputEncoding || "base64") as "base64" | "hex";
  const outputEncoding = (options.outputEncoding || "text") as "text" | "base64" | "hex";

  if (mode === "AES-GCM") {
    const key = await deriveAesKeyFromBytes(decodeToBytes(keyText, keyEncoding) as BufferSource, mode);
    const iv = decodeToBytes(ivText, ivEncoding) as BufferSource;
    const ciphertext = decodeToBytes(input, inputEncoding) as BufferSource;
    const decrypted = await crypto.subtle.decrypt({ name: mode, iv }, key, ciphertext);
    const result = new Uint8Array(decrypted);
    if (outputEncoding === "text") return decoder.decode(result);
    return encodeFromBytes(result, outputEncoding);
  }

  const padding = getCryptoJSPadding(paddingName);
  const keyWords = parseWordArray(keyText, keyEncoding);
  const cfg: Record<string, unknown> = {
    mode: getCryptoJSMode(mode.replace("AES-", "")),
    padding,
    ...(mode === "AES-CBC" ? { iv: parseWordArray(ivText, ivEncoding) } : {})
  };

  const cipherParams = cipherParamsFromString(input, inputEncoding);
  const decrypted = CryptoJS.AES.decrypt(cipherParams, keyWords, cfg);
  return wordArrayToString(decrypted, outputEncoding);
}

async function deriveAesKeyFromBytes(keyBytes: BufferSource, mode: string) {
  const digest = await crypto.subtle.digest("SHA-256", keyBytes);
  return crypto.subtle.importKey("raw", digest, { name: mode }, false, ["encrypt", "decrypt"]);
}

// ---------- DES ----------

export function desEncrypt(
  input: string,
  key: string,
  mode: "DES-CBC" | "DES-ECB" | "DES-CFB" | "DES-OFB" | "DES-CTR",
  iv: string,
  paddingName = "PKCS7",
  options: { keyEncoding?: string; ivEncoding?: string; inputEncoding?: string; outputEncoding?: string } = {}
): string {
  if (!key.trim()) throw new Error("DES key is required.");
  const keyEncoding = (options.keyEncoding || "text") as "text" | "base64" | "hex";
  const ivEncoding = (options.ivEncoding || "text") as "text" | "base64" | "hex";
  const inputEncoding = (options.inputEncoding || "text") as "text" | "base64" | "hex";
  const outputEncoding = (options.outputEncoding || "base64") as "base64" | "hex";

  const keyWords = parseWordArray(key, keyEncoding);
  const padding = getCryptoJSPadding(paddingName);
  const cfg: Record<string, unknown> = {
    mode: getCryptoJSMode(mode.replace("DES-", "")),
    padding,
    ...(mode !== "DES-ECB" ? { iv: parseWordArray(iv || "", ivEncoding) } : {})
  };

  const plaintext = parseWordArray(input, inputEncoding);
  const encrypted = CryptoJS.DES.encrypt(plaintext, keyWords, cfg);

  return outputEncoding === "hex"
    ? encrypted.ciphertext.toString(CryptoJS.enc.Hex)
    : encrypted.toString();
}

export function desDecrypt(
  input: string,
  key: string,
  mode: "DES-CBC" | "DES-ECB" | "DES-CFB" | "DES-OFB" | "DES-CTR",
  iv: string,
  paddingName = "PKCS7",
  options: { keyEncoding?: string; ivEncoding?: string; inputEncoding?: string; outputEncoding?: string } = {}
): string {
  if (!key.trim()) throw new Error("DES key is required.");
  const keyEncoding = (options.keyEncoding || "text") as "text" | "base64" | "hex";
  const ivEncoding = (options.ivEncoding || "text") as "text" | "base64" | "hex";
  const inputEncoding = (options.inputEncoding || "base64") as "base64" | "hex";
  const outputEncoding = (options.outputEncoding || "text") as "text" | "base64" | "hex";

  const keyWords = parseWordArray(key, keyEncoding);
  const padding = getCryptoJSPadding(paddingName);
  const cfg: Record<string, unknown> = {
    mode: getCryptoJSMode(mode.replace("DES-", "")),
    padding,
    ...(mode !== "DES-ECB" ? { iv: parseWordArray(iv, ivEncoding) } : {})
  };

  const cipherParams = cipherParamsFromString(input, inputEncoding);
  const decrypted = CryptoJS.DES.decrypt(cipherParams, keyWords, cfg);
  return wordArrayToString(decrypted, outputEncoding);
}

// ---------- SM4 ----------

export function sm4Encrypt(
  input: string,
  key: string,
  mode: "SM4-CBC" | "SM4-ECB",
  iv: string,
  paddingName = "PKCS7",
  options: { keyEncoding?: string; ivEncoding?: string; inputEncoding?: string; outputEncoding?: string } = {}
): string {
  if (!key.trim()) throw new Error("SM4 key is required.");
  if (mode === "SM4-CBC" && !iv?.trim()) throw new Error("SM4 IV is required for CBC mode.");

  const keyEncoding = (options.keyEncoding || "text") as "text" | "base64" | "hex";
  const ivEncoding = (options.ivEncoding || "text") as "text" | "base64" | "hex";
  const inputEncoding = (options.inputEncoding || "text") as "text" | "base64" | "hex";
  const outputEncoding = (options.outputEncoding || "base64") as "base64" | "hex";

  const keyHex = sm4KeyHex(key, keyEncoding);
  const ivHex = mode === "SM4-CBC" ? sm4KeyHex(iv, ivEncoding) : undefined;

  // sm-crypto encrypt expects UTF-8 input, outputs hex
  const plaintext = decodeToString(input, inputEncoding);
  const padding = paddingName.toLowerCase().includes("pkcs") ? "pkcs#7" : "pkcs#7";
  const hexResult = sm4.encrypt(plaintext, keyHex, {
    mode: mode === "SM4-CBC" ? "cbc" : "ecb",
    iv: ivHex,
    padding: padding as "pkcs#7" | "pkcs#5"
  });

  // sm4.encrypt outputs hex. Convert to desired output encoding.
  if (outputEncoding === "hex") return hexResult;
  const bytes = hexToBytes(hexResult);
  return bytesToBase64(bytes);
}

export function sm4Decrypt(
  input: string,
  key: string,
  mode: "SM4-CBC" | "SM4-ECB",
  iv: string,
  paddingName = "PKCS7",
  options: { keyEncoding?: string; ivEncoding?: string; inputEncoding?: string; outputEncoding?: string } = {}
): string {
  if (!key.trim()) throw new Error("SM4 key is required.");
  if (mode === "SM4-CBC" && !iv?.trim()) throw new Error("SM4 IV is required for CBC mode.");

  const keyEncoding = (options.keyEncoding || "text") as "text" | "base64" | "hex";
  const ivEncoding = (options.ivEncoding || "text") as "text" | "base64" | "hex";
  const inputEncoding = (options.inputEncoding || "base64") as "base64" | "hex";
  const outputEncoding = (options.outputEncoding || "text") as "text" | "base64" | "hex";

  const keyHex = sm4KeyHex(key, keyEncoding);
  const ivHex = mode === "SM4-CBC" ? sm4KeyHex(iv, ivEncoding) : undefined;

  // sm-crypto decrypt expects hex input, outputs UTF-8
  const hexInput = inputEncoding === "hex" ? input : bytesToHex(base64ToBytes(input));
  const padding = paddingName.toLowerCase().includes("pkcs") ? "pkcs#7" : "pkcs#7";
  const result = sm4.decrypt(hexInput, keyHex, {
    mode: mode === "SM4-CBC" ? "cbc" : "ecb",
    iv: ivHex,
    output: "string",
    padding: padding as "pkcs#7" | "pkcs#5"
  });

  return encodeString(result, outputEncoding);
}

// ---------- Hash ----------

export async function hashText(
  input: string,
  algorithm: "MD5" | "SHA-1" | "SHA-256" | "SHA-512",
  inputEncoding: "text" | "base64" | "hex" = "text"
) {
  const data = decodeToBytes(input, inputEncoding);
  if (algorithm === "MD5") {
    return CryptoJS.MD5(CryptoJS.lib.WordArray.create(data as any)).toString(CryptoJS.enc.Hex);
  }
  const digest = await crypto.subtle.digest(algorithm, data as BufferSource);
  return bytesToHex(digest);
}

// ---------- HMAC ----------

export function hmacText(
  input: string,
  secret: string,
  algorithm: "HMAC-MD5" | "HMAC-SHA256" | "HMAC-SHA512",
  options: { inputEncoding?: string; keyEncoding?: string } = {}
) {
  const inputEncoding = (options.inputEncoding || "text") as "text" | "base64" | "hex";
  const keyEncoding = (options.keyEncoding || "text") as "text" | "base64" | "hex";

  const message = decodeToString(input, inputEncoding);
  const key = decodeToString(secret, keyEncoding);

  if (algorithm === "HMAC-MD5") return CryptoJS.HmacMD5(message, key).toString(CryptoJS.enc.Hex);
  if (algorithm === "HMAC-SHA256") return CryptoJS.HmacSHA256(message, key).toString(CryptoJS.enc.Hex);
  return CryptoJS.HmacSHA512(message, key).toString(CryptoJS.enc.Hex);
}

// ---------- Other tools ----------

export function formatJson(input: string, indent = 2) {
  return JSON.stringify(JSON.parse(input), null, indent);
}

export function minifyJson(input: string) {
  return JSON.stringify(JSON.parse(input));
}

export function diffJson(leftRaw: string, rightRaw: string) {
  const left = JSON.parse(leftRaw);
  const right = JSON.parse(rightRaw);
  const changes: string[] = [];
  walkDiff(left, right, "$", changes);
  return changes.length ? changes.join("\n") : "No differences found.";
}

function walkDiff(left: unknown, right: unknown, path: string, changes: string[]) {
  if (Object.is(left, right)) {
    return;
  }

  if (Array.isArray(left) || Array.isArray(right)) {
    if (!Array.isArray(left) || !Array.isArray(right)) {
      changes.push(`~ ${path}: ${describe(left)} -> ${describe(right)}`);
      return;
    }
    const length = Math.max(left.length, right.length);
    for (let index = 0; index < length; index += 1) {
      if (!(index in left)) changes.push(`+ ${path}[${index}]: ${describe(right[index])}`);
      else if (!(index in right)) changes.push(`- ${path}[${index}]: ${describe(left[index])}`);
      else walkDiff(left[index], right[index], `${path}[${index}]`, changes);
    }
    return;
  }

  if (isPlainObject(left) && isPlainObject(right)) {
    const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
    [...keys].sort().forEach((key) => {
      if (!(key in left)) changes.push(`+ ${path}.${key}: ${describe(right[key])}`);
      else if (!(key in right)) changes.push(`- ${path}.${key}: ${describe(left[key])}`);
      else walkDiff(left[key], right[key], `${path}.${key}`, changes);
    });
    return;
  }

  changes.push(`~ ${path}: ${describe(left)} -> ${describe(right)}`);
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function describe(value: unknown) {
  return JSON.stringify(value);
}

export function encodeUrl(input: string) {
  return encodeURIComponent(input);
}

export function decodeUrl(input: string) {
  return decodeURIComponent(input);
}

export function escapePrompt(input: string) {
  return input
    .replace(/\\/g, "\\\\")
    .replace(/`/g, "\\`")
    .replace(/\$/g, "\\$")
    .replace(/\{/g, "\\{")
    .replace(/\}/g, "\\}")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function parseSse(input: string) {
  return input
    .split(/\n\n+/)
    .map((block) => {
      const event: Record<string, string> = {};
      block.split(/\n/).forEach((line) => {
        const index = line.indexOf(":");
        if (index > -1) {
          const key = line.slice(0, index).trim();
          const value = line.slice(index + 1).trimStart();
          event[key] = event[key] ? `${event[key]}\n${value}` : value;
        }
      });
      return event;
    })
    .filter((event) => Object.keys(event).length > 0)
    .map((event, index) => `#${index + 1}\n${JSON.stringify(event, null, 2)}`)
    .join("\n\n");
}

export function estimateTokens(input: string) {
  const cjk = (input.match(/[\u3400-\u9fff]/g) || []).length;
  const asciiWords = (input.replace(/[\u3400-\u9fff]/g, " ").match(/[A-Za-z0-9_]+|[^\sA-Za-z0-9_]/g) || []).length;
  const estimated = Math.max(1, Math.ceil(cjk * 1.1 + asciiWords * 0.75));
  return {
    output: `${estimated}`,
    meta: {
      characters: input.length,
      cjkCharacters: cjk,
      roughTokens: estimated
    }
  };
}

export function formatMessages(input: string) {
  const parsed = JSON.parse(input);
  const messages = Array.isArray(parsed) ? parsed : parsed.messages;
  if (!Array.isArray(messages)) {
    throw new Error("Input must be an array of messages or an object with a messages array.");
  }
  return messages
    .map((message, index) => {
      const role = String(message.role ?? "unknown").toUpperCase();
      const content = typeof message.content === "string" ? message.content : JSON.stringify(message.content, null, 2);
      return `## ${index + 1}. ${role}\n\n${content}`;
    })
    .join("\n\n---\n\n");
}

export function imageToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export function decodeBase64Image(input: string): { dataUrl: string; mimeType: string } {
  let clean = input.trim();

  // Already a data URL
  if (clean.startsWith("data:image/")) {
    const mimeMatch = clean.match(/^data:image\/([^;]+)/);
    const mimeType = mimeMatch ? `image/${mimeMatch[1]}` : "image/png";
    return { dataUrl: clean, mimeType };
  }

  // Remove any non-base64 characters (like whitespace)
  clean = clean.replace(/[^A-Za-z0-9+/=]/g, "");

  // Detect format from base64 header bytes
  const header = atob(clean.slice(0, 24));
  const bytes = new Uint8Array(header.length);
  for (let i = 0; i < header.length; i++) bytes[i] = header.charCodeAt(i);

  let mimeType = "image/png";
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    mimeType = "image/png";
  } else if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    mimeType = "image/jpeg";
  } else if (bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46) {
    mimeType = "image/gif";
  } else if (bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46) {
    mimeType = "image/webp";
  } else if (bytes[0] === 0x42 && bytes[1] === 0x4d) {
    mimeType = "image/bmp";
  } else if (bytes[0] === 0x3c && bytes[1] === 0x3f && bytes[2] === 0x78) {
    mimeType = "image/svg+xml";
  }

  const dataUrl = `data:${mimeType};base64,${clean}`;
  return { dataUrl, mimeType };
}

// ---------- Timestamp converter ----------

export type TimestampUnit = "Auto" | "Seconds" | "Milliseconds" | "Microseconds";
export type TimestampOperation = "now" | "toDate" | "toTimestamp";

function parseTimestampToMs(value: string, unit: TimestampUnit): number {
  const trimmed = value.trim();
  if (!trimmed) throw new Error("Input is empty.");
  const num = Number(trimmed);
  if (Number.isNaN(num)) throw new Error("Input is not a valid number.");
  if (unit === "Seconds") return Math.round(num * 1000);
  if (unit === "Milliseconds") return Math.round(num);
  if (unit === "Microseconds") return Math.round(num / 1000);
  const abs = Math.abs(num);
  if (abs < 1e11) return Math.round(num * 1000);
  if (abs < 1e14) return Math.round(num);
  return Math.round(num / 1000);
}

function formatTimestampDate(ms: number): string {
  const date = new Date(ms);
  if (Number.isNaN(date.getTime())) throw new Error("Invalid date.");
  const pad = (n: number) => String(n).padStart(2, "0");
  const local = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${String(date.getMilliseconds()).padStart(3, "0")}`;
  const utc = date.toISOString();
  const weekdayLocal = date.toLocaleDateString("en-US", { weekday: "long" });
  const weekdayUtc = new Date(utc).toLocaleDateString("en-US", { weekday: "long", timeZone: "UTC" });
  return `Local: ${local} (${weekdayLocal})\nUTC:   ${utc} (${weekdayUtc})`;
}

function formatMsToUnit(ms: number, unit: TimestampUnit): string {
  if (unit === "Seconds") return String(Math.floor(ms / 1000));
  if (unit === "Microseconds") return String(ms * 1000);
  return String(ms);
}

export function convertTimestamp(
  input: string,
  operation: TimestampOperation,
  unit: TimestampUnit
) {
  if (operation === "now") {
    const ms = Date.now();
    const seconds = Math.floor(ms / 1000);
    const us = ms * 1000;
    return `Seconds:      ${seconds}\nMilliseconds: ${ms}\nMicroseconds: ${us}\n\n${formatTimestampDate(ms)}`;
  }
  if (operation === "toDate") {
    const ms = parseTimestampToMs(input, unit);
    return formatTimestampDate(ms);
  }
  if (operation === "toTimestamp") {
    const date = new Date(input.trim());
    if (Number.isNaN(date.getTime())) throw new Error("Invalid date.");
    const ms = date.getTime();
    return formatMsToUnit(ms, unit === "Auto" ? "Milliseconds" : unit);
  }
  throw new Error("Unsupported timestamp operation.");
}

// ---------- Text diff ----------

export function diffText(left: string, right: string, lang: Lang = "en"): string {
  if (left === right) return lang === "zh" ? "（无差异）" : "(no differences)";
  const a = left.split(/\r?\n/);
  const b = right.split(/\r?\n/);
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i -= 1) {
    for (let j = n - 1; j >= 0; j -= 1) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const lines: string[] = [];
  let i = 0;
  let j = 0;
  while (i < m && j < n) {
    if (a[i] === b[j]) {
      lines.push(`  ${a[i]}`);
      i += 1;
      j += 1;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      lines.push(`- ${a[i]}`);
      i += 1;
    } else {
      lines.push(`+ ${b[j]}`);
      j += 1;
    }
  }
  while (i < m) {
    lines.push(`- ${a[i]}`);
    i += 1;
  }
  while (j < n) {
    lines.push(`+ ${b[j]}`);
    j += 1;
  }
  return lines.join("\n");
}

// ---------- Case conversion ----------

export type CaseStyle = "camel" | "pascal" | "snake" | "kebab" | "constant" | "lower" | "upper";

function splitCaseWords(line: string): string[] {
  return line
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .split(/[^A-Za-z0-9]+/)
    .filter(Boolean);
}

export function convertCase(input: string, target: CaseStyle): string {
  const capitalize = (word: string) => word.charAt(0).toUpperCase() + word.slice(1);
  return input
    .split(/\r?\n/)
    .map((line) => {
      const words = splitCaseWords(line).map((word) => word.toLowerCase());
      if (words.length === 0) return "";
      switch (target) {
        case "camel": return words[0] + words.slice(1).map(capitalize).join("");
        case "pascal": return words.map(capitalize).join("");
        case "snake": return words.join("_");
        case "kebab": return words.join("-");
        case "constant": return words.join("_").toUpperCase();
        case "upper": return words.join(" ").toUpperCase();
        default: return words.join(" ");
      }
    })
    .join("\n");
}

// ---------- String escape ----------

export function escapeString(input: string): string {
  return input
    .replace(/\\/g, "\\\\")
    .replace(/"/g, "\\\"")
    .replace(/\n/g, "\\n")
    .replace(/\t/g, "\\t")
    .replace(/\r/g, "\\r");
}

export function unescapeString(input: string): string {
  return input.replace(/\\(u[0-9a-fA-F]{4}|.)/g, (_match, seq: string) => {
    if (seq.startsWith("u")) return String.fromCharCode(parseInt(seq.slice(1), 16));
    switch (seq) {
      case "\\": return "\\";
      case "\"": return "\"";
      case "n": return "\n";
      case "t": return "\t";
      case "r": return "\r";
      default: throw new Error(`Invalid escape sequence: \\${seq}`);
    }
  });
}

// ---------- Regex tester ----------

export function runRegex(pattern: string, text: string, lang: Lang = "en"): string {
  let flags = "";
  let source = pattern;
  const inline = source.match(/^\(\?([a-z]*)\)/);
  if (inline) {
    for (const flag of inline[1]) {
      if (!"ims".includes(flag)) throw new Error(`Unsupported inline flag: ${flag} (supported: i, m, s).`);
      flags += flag;
    }
    source = source.slice(inline[0].length);
  }
  let regex: RegExp;
  try {
    regex = new RegExp(source, `${flags}g`);
  } catch (error) {
    throw new Error(`Invalid regular expression: ${error instanceof Error ? error.message : String(error)}`);
  }
  const lines: string[] = [];
  let match: RegExpExecArray | null;
  let count = 0;
  while ((match = regex.exec(text)) !== null) {
    count += 1;
    const start = match.index;
    const end = start + match[0].length;
    lines.push(lang === "zh"
      ? `匹配 ${count}: [${start}, ${end}) ${JSON.stringify(match[0])}`
      : `Match ${count}: [${start}, ${end}) ${JSON.stringify(match[0])}`);
    for (let group = 1; group < match.length; group += 1) {
      const value = match[group];
      lines.push(lang === "zh"
        ? `  分组 ${group}: ${value === undefined ? "（未定义）" : JSON.stringify(value)}`
        : `  group ${group}: ${value === undefined ? "(undefined)" : JSON.stringify(value)}`);
    }
    if (match[0] === "") regex.lastIndex += 1;
  }
  if (lines.length) return lines.join("\n");
  return lang === "zh" ? "无匹配。" : "No matches.";
}

// ---------- JWT ----------

function base64UrlToText(segment: string): string {
  const base64 = segment.replace(/-/g, "+").replace(/_/g, "/").replace(/=+$/, "");
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  return base64ToText(padded);
}

function base64UrlFromWordArray(words: CryptoJS.lib.WordArray): string {
  return CryptoJS.enc.Base64.stringify(words).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function timingSafeEqualStrings(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let index = 0; index < a.length; index += 1) {
    diff |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return diff === 0;
}

export function decodeJwt(token: string, secret?: string): { output: string; meta: Record<string, string | number> } {
  const parts = token.trim().split(".");
  if (parts.length !== 3 || parts.some((part) => part.length === 0)) {
    throw new Error("Malformed JWT: expected 3 non-empty parts separated by dots.");
  }
  let header: unknown;
  let payload: unknown;
  try {
    header = JSON.parse(base64UrlToText(parts[0]));
    payload = JSON.parse(base64UrlToText(parts[1]));
  } catch {
    throw new Error("Malformed JWT: header or payload is not valid base64url-encoded JSON.");
  }
  const signature = parts[2];
  const output = JSON.stringify({ header, payload, signature }, null, 2);

  const alg = header && typeof header === "object" && "alg" in header
    ? String((header as Record<string, unknown>).alg)
    : "unknown";

  let verified: "yes" | "no" | "not checked" = "not checked";
  if (secret) {
    const hmac = alg === "HS256" ? CryptoJS.HmacSHA256
      : alg === "HS384" ? CryptoJS.HmacSHA384
      : alg === "HS512" ? CryptoJS.HmacSHA512
      : null;
    if (!hmac) {
      verified = "no";
    } else {
      const expected = base64UrlFromWordArray(hmac(`${parts[0]}.${parts[1]}`, secret));
      verified = timingSafeEqualStrings(expected, signature) ? "yes" : "no";
    }
  }

  let expired: "yes" | "no" | "unknown" = "unknown";
  if (payload && typeof payload === "object" && typeof (payload as Record<string, unknown>).exp === "number") {
    expired = (payload as { exp: number }).exp < Date.now() / 1000 ? "yes" : "no";
  }

  return { output, meta: { alg, verified, expired } };
}

// ---------- Buffer hash ----------

export async function hashBuffer(
  data: ArrayBuffer,
  algorithm: "MD5" | "SHA-1" | "SHA-256" | "SHA-512"
): Promise<string> {
  if (algorithm === "MD5") {
    return CryptoJS.MD5(CryptoJS.lib.WordArray.create(data as any)).toString(CryptoJS.enc.Hex);
  }
  const digest = await crypto.subtle.digest(algorithm, data);
  return bytesToHex(digest);
}

// ---------- URL parser ----------

export function parseUrl(input: string, lang: Lang = "en"): string {
  let url: URL;
  try {
    url = new URL(input.trim());
  } catch {
    throw new Error(`Invalid URL: ${input}`);
  }
  const zh = lang === "zh";
  const none = zh ? "（无）" : "(none)";
  const lines = [
    `${zh ? "协议" : "Protocol"}: ${url.protocol.replace(/:$/, "")}`,
    `${zh ? "主机" : "Host"}: ${url.host}`,
    `${zh ? "端口" : "Port"}: ${url.port || (zh ? "（默认）" : "(default)")}`,
    `${zh ? "路径" : "Path"}: ${url.pathname}`
  ];
  const params = [...url.searchParams.entries()];
  lines.push(zh ? "查询参数:" : "Query params:");
  if (params.length === 0) {
    lines.push(`  ${none}`);
  } else {
    params.forEach(([key, value]) => lines.push(`  ${key} = ${value}`));
  }
  lines.push(`${zh ? "锚点" : "Hash"}: ${url.hash ? url.hash.slice(1) : none}`);
  return lines.join("\n");
}

// ---------- Date calculator ----------

function formatLocalDateTime(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

function parseDateOrThrow(value: string, label: string): Date {
  const date = new Date(value.trim());
  if (Number.isNaN(date.getTime())) throw new Error(`Invalid ${label}: ${value}`);
  return date;
}

export type DateUnit = "seconds" | "minutes" | "hours" | "days" | "weeks";

export type DateCalcOptions = {
  zone?: string;
  unit?: DateUnit;
  lang?: Lang;
};

const DATE_UNIT_MS: Record<DateUnit, number> = {
  seconds: 1_000,
  minutes: 60_000,
  hours: 3_600_000,
  days: 86_400_000,
  weeks: 604_800_000
};

export function calcDate(operation: "diff" | "add" | "toZone", input: string, secondary: string, options: DateCalcOptions = {}): string {
  const lang = options.lang ?? "en";
  if (operation === "diff") {
    const left = parseDateOrThrow(input, "date input");
    const right = parseDateOrThrow(secondary, "secondary date");
    const totalSeconds = Math.abs(Math.round((left.getTime() - right.getTime()) / 1000));
    let rest = totalSeconds;
    const days = Math.floor(rest / 86_400);
    rest %= 86_400;
    const hours = Math.floor(rest / 3_600);
    rest %= 3_600;
    const minutes = Math.floor(rest / 60);
    const seconds = rest % 60;
    return lang === "zh"
      ? `${days} 天, ${hours} 小时, ${minutes} 分钟, ${seconds} 秒\n总秒数: ${totalSeconds}`
      : `${days} days, ${hours} hours, ${minutes} minutes, ${seconds} seconds\nTotal seconds: ${totalSeconds}`;
  }
  if (operation === "add") {
    const base = parseDateOrThrow(input, "date input");
    const amount = Number(secondary.trim());
    if (!Number.isFinite(amount)) throw new Error(`Invalid amount: ${secondary} (expected a signed number; negative values subtract).`);
    const unit = options.unit ?? "days";
    const result = new Date(base.getTime() + amount * DATE_UNIT_MS[unit]);
    return lang === "zh"
      ? `ISO: ${result.toISOString()}\n本地时间: ${formatLocalDateTime(result)}`
      : `ISO: ${result.toISOString()}\nLocal: ${formatLocalDateTime(result)}`;
  }
  const date = parseDateOrThrow(input, "date input");
  if (!options.zone) throw new Error("Time zone is required for toZone (IANA name like Asia/Shanghai).");
  let formatter: Intl.DateTimeFormat;
  try {
    formatter = new Intl.DateTimeFormat("sv-SE", {
      timeZone: options.zone,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
      timeZoneName: "longOffset"
    });
  } catch {
    throw new Error(`Invalid time zone: ${options.zone}`);
  }
  return `${options.zone}: ${formatter.format(date)}\nUTC: ${date.toISOString()}`;
}

// ---------- Cron parser ----------

const CRON_MONTH_NAMES = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const CRON_WEEKDAY_NAMES = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

function cronTokenValue(token: string, names: string[] | undefined, namesOffset: number): number {
  if (names) {
    const index = names.indexOf(token);
    if (index > -1) return index + namesOffset;
  }
  if (!/^\d+$/.test(token)) return Number.NaN;
  return Number(token);
}

function parseCronField(field: string, min: number, max: number, names?: string[], namesOffset = 0): Set<number> {
  let probe = field.toLowerCase();
  if (names) probe = probe.replace(new RegExp(`\\b(${names.join("|")})\\b`, "g"), "");
  if (/[lw#?]/.test(probe)) {
    throw new Error(`Unsupported cron syntax in "${field}": L, W and # extensions are not supported.`);
  }
  const values = new Set<number>();
  for (const part of field.toLowerCase().split(",")) {
    if (!part) throw new Error(`Invalid cron field: "${field}".`);
    const segments = part.split("/");
    if (segments.length > 2) throw new Error(`Invalid cron field: "${field}".`);
    let step = 1;
    if (segments.length === 2) {
      step = Number(segments[1]);
      if (!Number.isInteger(step) || step < 1) throw new Error(`Invalid step in cron field: "${field}".`);
    }
    const rangePart = segments[0];
    let low: number;
    let high: number;
    if (rangePart === "*") {
      low = min;
      high = max;
    } else if (rangePart.includes("-")) {
      const bounds = rangePart.split("-");
      if (bounds.length !== 2) throw new Error(`Invalid range in cron field: "${field}".`);
      low = cronTokenValue(bounds[0], names, namesOffset);
      high = cronTokenValue(bounds[1], names, namesOffset);
      if (Number.isNaN(low) || Number.isNaN(high)) throw new Error(`Invalid range in cron field: "${field}".`);
    } else {
      low = cronTokenValue(rangePart, names, namesOffset);
      if (Number.isNaN(low)) throw new Error(`Invalid value in cron field: "${field}".`);
      high = segments.length === 2 ? max : low;
    }
    if (low < min || high > max || low > high) {
      throw new Error(`Cron field out of range (${min}-${max}): "${field}".`);
    }
    for (let value = low; value <= high; value += step) values.add(value);
  }
  return values;
}

function describeCronField(name: string, raw: string, values: Set<number>, min: number, max: number, lang: Lang): string {
  if (values.size === max - min + 1) return lang === "zh" ? `${name}: 每` : `${name}: every`;
  const stepMatch = raw.match(/^\*\/(\d+)$/);
  if (stepMatch) return lang === "zh" ? `${name}: 每 ${stepMatch[1]}` : `${name}: every ${stepMatch[1]}`;
  const sorted = [...values].sort((a, b) => a - b);
  const parts: string[] = [];
  let index = 0;
  while (index < sorted.length) {
    let end = index;
    while (end + 1 < sorted.length && sorted[end + 1] === sorted[end] + 1) end += 1;
    parts.push(end > index ? `${sorted[index]}-${sorted[end]}` : `${sorted[index]}`);
    index = end + 1;
  }
  return `${name}: ${parts.join(",")}`;
}

function cronDayMatches(date: Date, dom: Set<number>, dow: Set<number>, domStar: boolean, dowStar: boolean): boolean {
  if (domStar && dowStar) return true;
  if (domStar) return dow.has(date.getDay());
  if (dowStar) return dom.has(date.getDate());
  return dom.has(date.getDate()) || dow.has(date.getDay());
}

export function parseCron(input: string, lang: Lang = "en"): string {
  const fields = input.trim().split(/\s+/);
  if (fields.length !== 5) {
    throw new Error(`Expected 5 cron fields (minute hour day-of-month month day-of-week), got ${fields.length}.`);
  }
  const minutes = parseCronField(fields[0], 0, 59);
  const hours = parseCronField(fields[1], 0, 23);
  const dom = parseCronField(fields[2], 1, 31);
  const months = parseCronField(fields[3], 1, 12, CRON_MONTH_NAMES, 1);
  const dowRaw = parseCronField(fields[4], 0, 7, CRON_WEEKDAY_NAMES, 0);
  const dow = new Set<number>();
  dowRaw.forEach((value) => dow.add(value === 7 ? 0 : value));

  const names = lang === "zh"
    ? ["分钟", "小时", "日", "月", "星期"]
    : ["minute", "hour", "day-of-month", "month", "day-of-week"];
  const lines = [
    describeCronField(names[0], fields[0], minutes, 0, 59, lang),
    describeCronField(names[1], fields[1], hours, 0, 23, lang),
    describeCronField(names[2], fields[2], dom, 1, 31, lang),
    describeCronField(names[3], fields[3], months, 1, 12, lang),
    describeCronField(names[4], fields[4], dow, 0, 6, lang)
  ];

  const domStar = dom.size === 31;
  const dowStar = dow.size === 7;
  const runs: string[] = [];
  const candidate = new Date(Date.now() + 60_000);
  candidate.setSeconds(0, 0);
  const maxSteps = 366 * 24 * 60;
  for (let step = 0; step < maxSteps && runs.length < 5; step += 1) {
    if (
      minutes.has(candidate.getMinutes()) &&
      hours.has(candidate.getHours()) &&
      months.has(candidate.getMonth() + 1) &&
      cronDayMatches(candidate, dom, dow, domStar, dowStar)
    ) {
      runs.push(formatLocalDateTime(candidate).slice(0, 16));
    }
    candidate.setTime(candidate.getTime() + 60_000);
  }
  lines.push(lang === "zh" ? "未来 5 次执行时间:" : "Next 5 runs:");
  if (runs.length === 0) lines.push(lang === "zh" ? "（366 天内无执行时间）" : "(none within 366 days)");
  else lines.push(...runs);
  return lines.join("\n");
}

// ---------- Number base converter ----------

export function convertBase(
  input: string,
  fromBase: "Auto" | "2" | "8" | "10" | "16",
  toBase: "2" | "8" | "10" | "16" = "10",
  lang: Lang = "en"
): string {
  const trimmed = input.trim();
  if (!trimmed) throw new Error("Input is empty.");
  let base: number;
  let digits = trimmed;
  if (fromBase === "Auto") {
    if (/^0[xX]/.test(trimmed)) { base = 16; digits = trimmed.slice(2); }
    else if (/^0[bB]/.test(trimmed)) { base = 2; digits = trimmed.slice(2); }
    else if (/^0[oO]/.test(trimmed)) { base = 8; digits = trimmed.slice(2); }
    else base = 10;
  } else {
    base = Number(fromBase);
    if (base === 16 && /^0[xX]/.test(digits)) digits = digits.slice(2);
    else if (base === 2 && /^0[bB]/.test(digits)) digits = digits.slice(2);
    else if (base === 8 && /^0[oO]/.test(digits)) digits = digits.slice(2);
  }
  if (!digits) throw new Error("No digits provided.");
  const alphabet = "0123456789abcdef".slice(0, base);
  for (const char of digits.toLowerCase()) {
    if (!alphabet.includes(char)) throw new Error(`Invalid digit "${char}" for base ${base}.`);
  }
  const prefix = base === 16 ? "0x" : base === 8 ? "0o" : base === 2 ? "0b" : "";
  const value = BigInt(`${prefix}${digits}`);
  const labels: Record<string, string> = lang === "zh"
    ? { "2": "二进制", "8": "八进制", "10": "十进制", "16": "十六进制" }
    : { "2": "Binary", "8": "Octal", "10": "Decimal", "16": "Hex" };
  return `${labels[toBase]}: ${value.toString(Number(toBase))}`;
}

// ---------- Color converter ----------

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const sn = s / 100;
  const ln = l / 100;
  const chroma = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = chroma * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = ln - chroma / 2;
  let rp = 0;
  let gp = 0;
  let bp = 0;
  if (h < 60) { rp = chroma; gp = x; }
  else if (h < 120) { rp = x; gp = chroma; }
  else if (h < 180) { gp = chroma; bp = x; }
  else if (h < 240) { gp = x; bp = chroma; }
  else if (h < 300) { rp = x; bp = chroma; }
  else { rp = chroma; bp = x; }
  return [Math.round((rp + m) * 255), Math.round((gp + m) * 255), Math.round((bp + m) * 255)];
}

function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const lightness = (max + min) / 2;
  if (max === min) return [0, 0, Math.round(lightness * 100)];
  const delta = max - min;
  const saturation = lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);
  let hue: number;
  if (max === rn) hue = (gn - bn) / delta + (gn < bn ? 6 : 0);
  else if (max === gn) hue = (bn - rn) / delta + 2;
  else hue = (rn - gn) / delta + 4;
  return [Math.round(hue * 60), Math.round(saturation * 100), Math.round(lightness * 100)];
}

export function convertColor(input: string): { output: string; meta: { hex: string } } {
  const trimmed = input.trim();
  let r = 0;
  let g = 0;
  let b = 0;
  const hexMatch = trimmed.match(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/);
  const rgbMatch = trimmed.match(/^rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)$/i);
  const hslMatch = trimmed.match(/^hsl\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)$/i);
  if (hexMatch) {
    const digits = hexMatch[1].length === 3
      ? hexMatch[1].split("").map((char) => char + char).join("")
      : hexMatch[1];
    r = parseInt(digits.slice(0, 2), 16);
    g = parseInt(digits.slice(2, 4), 16);
    b = parseInt(digits.slice(4, 6), 16);
  } else if (rgbMatch) {
    r = Number(rgbMatch[1]);
    g = Number(rgbMatch[2]);
    b = Number(rgbMatch[3]);
    if (r > 255 || g > 255 || b > 255) throw new Error("RGB values must be between 0 and 255.");
  } else if (hslMatch) {
    const h = Number(hslMatch[1]);
    const s = Number(hslMatch[2]);
    const l = Number(hslMatch[3]);
    if (h > 360 || s > 100 || l > 100) throw new Error("HSL values out of range (h<=360, s<=100, l<=100).");
    [r, g, b] = hslToRgb(h === 360 ? 0 : h, s, l);
  } else {
    throw new Error(`Unrecognized color format: ${input}`);
  }
  const hex = `#${[r, g, b].map((value) => value.toString(16).padStart(2, "0")).join("")}`;
  const [h, s, l] = rgbToHsl(r, g, b);
  const output = `HEX: ${hex}\nRGB: rgb(${r}, ${g}, ${b})\nHSL: hsl(${h}, ${s}%, ${l}%)`;
  return { output, meta: { hex } };
}

// ---------- YAML / JSON ----------

export function yamlToJson(input: string): string {
  try {
    return JSON.stringify(loadYaml(input) ?? null, null, 2);
  } catch (error) {
    throw new Error(`Invalid YAML: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export function jsonToYaml(input: string): string {
  try {
    return dumpYaml(JSON.parse(input));
  } catch (error) {
    throw new Error(`Invalid JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// ---------- Generators ----------

export type UuidOptions = { count: number; version: "v4" | "v7"; uppercase: boolean; hyphens: boolean };

function uuidV7(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  const now = Date.now();
  bytes[0] = Math.floor(now / 2 ** 40) & 0xff;
  bytes[1] = Math.floor(now / 2 ** 32) & 0xff;
  bytes[2] = Math.floor(now / 2 ** 24) & 0xff;
  bytes[3] = Math.floor(now / 2 ** 16) & 0xff;
  bytes[4] = Math.floor(now / 2 ** 8) & 0xff;
  bytes[5] = now & 0xff;
  bytes[6] = (bytes[6] & 0x0f) | 0x70;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

export function generateUuids(options: UuidOptions): string[] {
  if (!Number.isInteger(options.count) || options.count < 1) throw new Error("Count must be at least 1.");
  const list: string[] = [];
  for (let index = 0; index < options.count; index += 1) {
    let uuid = options.version === "v4" ? crypto.randomUUID() : uuidV7();
    if (!options.hyphens) uuid = uuid.replace(/-/g, "");
    if (options.uppercase) uuid = uuid.toUpperCase();
    list.push(uuid);
  }
  return list;
}

export type PasswordOptions = {
  count: number;
  length: number;
  lowercase: boolean;
  uppercase: boolean;
  digits: boolean;
  symbols: boolean;
  excludeAmbiguous: boolean;
};

const PASSWORD_SYMBOLS = "!@#$%^&*()-_=+[]{};:,.<>?/";
const PASSWORD_AMBIGUOUS = new Set([..."l1IO0o"]);

export function generatePasswords(options: PasswordOptions): string[] {
  let charset = "";
  if (options.lowercase) charset += "abcdefghijklmnopqrstuvwxyz";
  if (options.uppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (options.digits) charset += "0123456789";
  if (options.symbols) charset += PASSWORD_SYMBOLS;
  if (options.excludeAmbiguous) {
    charset = [...charset].filter((char) => !PASSWORD_AMBIGUOUS.has(char)).join("");
  }
  if (!charset) throw new Error("At least one character set must be selected.");
  if (!Number.isInteger(options.length) || options.length < 1) throw new Error("Length must be at least 1.");
  if (!Number.isInteger(options.count) || options.count < 1) throw new Error("Count must be at least 1.");

  const maxValid = Math.floor(256 / charset.length) * charset.length;
  const passwords: string[] = [];
  for (let index = 0; index < options.count; index += 1) {
    let password = "";
    while (password.length < options.length) {
      const bytes = crypto.getRandomValues(new Uint8Array(options.length));
      for (const byte of bytes) {
        if (byte >= maxValid) continue;
        password += charset[byte % charset.length];
        if (password.length === options.length) break;
      }
    }
    passwords.push(password);
  }
  return passwords;
}
