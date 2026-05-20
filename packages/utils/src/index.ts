import CryptoJS from "crypto-js";
import { sm4 } from "sm-crypto";

export type ToolOperation = "encode" | "decode" | "encrypt" | "decrypt" | "format" | "minify" | "diff" | "parse" | "estimate";

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
