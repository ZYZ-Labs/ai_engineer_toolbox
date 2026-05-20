import CryptoJS from "crypto-js";
import { sm4 } from "sm-crypto";

export type ToolOperation = "encode" | "decode" | "encrypt" | "decrypt" | "format" | "minify" | "diff" | "parse" | "estimate";

export type ToolResult = {
  output: string;
  meta?: Record<string, string | number>;
};

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export function bytesToHex(bytes: ArrayBuffer | Uint8Array) {
  const view = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  return Array.from(view)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

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

export async function hashText(input: string, algorithm: "MD5" | "SHA-1" | "SHA-256" | "SHA-512") {
  if (algorithm === "MD5") {
    return CryptoJS.MD5(input).toString(CryptoJS.enc.Hex);
  }
  const digest = await crypto.subtle.digest(algorithm, encoder.encode(input));
  return bytesToHex(digest);
}

export function hmacText(input: string, secret: string, algorithm: "HMAC-MD5" | "HMAC-SHA256" | "HMAC-SHA512") {
  if (algorithm === "HMAC-MD5") return CryptoJS.HmacMD5(input, secret).toString(CryptoJS.enc.Hex);
  if (algorithm === "HMAC-SHA256") return CryptoJS.HmacSHA256(input, secret).toString(CryptoJS.enc.Hex);
  return CryptoJS.HmacSHA512(input, secret).toString(CryptoJS.enc.Hex);
}

export async function aesEncrypt(input: string, keyText: string, mode: "AES-GCM" | "AES-CBC", ivBase64?: string) {
  const key = await deriveAesKey(keyText, mode);
  const iv = ivBase64 ? base64ToBytes(ivBase64) : crypto.getRandomValues(new Uint8Array(mode === "AES-GCM" ? 12 : 16));
  const encrypted = await crypto.subtle.encrypt({ name: mode, iv }, key, encoder.encode(input));
  return {
    output: bytesToBase64(encrypted),
    meta: {
      iv: bytesToBase64(iv),
      mode
    }
  };
}

export async function aesDecrypt(input: string, keyText: string, mode: "AES-GCM" | "AES-CBC", ivBase64: string) {
  const key = await deriveAesKey(keyText, mode);
  const decrypted = await crypto.subtle.decrypt({ name: mode, iv: base64ToBytes(ivBase64) }, key, base64ToBytes(input));
  return decoder.decode(decrypted);
}

async function deriveAesKey(keyText: string, mode: "AES-GCM" | "AES-CBC") {
  const digest = await crypto.subtle.digest("SHA-256", encoder.encode(keyText));
  return crypto.subtle.importKey("raw", digest, { name: mode }, false, ["encrypt", "decrypt"]);
}

export function desEncrypt(input: string, key: string, mode: "DES-CBC" | "DES-ECB", iv?: string) {
  const keyWords = CryptoJS.enc.Utf8.parse(fixedLength(key, 8));
  const options = {
    mode: mode === "DES-CBC" ? CryptoJS.mode.CBC : CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
    ...(mode === "DES-CBC" ? { iv: CryptoJS.enc.Utf8.parse(fixedLength(iv || "", 8)) } : {})
  };
  return CryptoJS.DES.encrypt(input, keyWords, options).toString();
}

export function desDecrypt(input: string, key: string, mode: "DES-CBC" | "DES-ECB", iv?: string) {
  const keyWords = CryptoJS.enc.Utf8.parse(fixedLength(key, 8));
  const options = {
    mode: mode === "DES-CBC" ? CryptoJS.mode.CBC : CryptoJS.mode.ECB,
    padding: CryptoJS.pad.Pkcs7,
    ...(mode === "DES-CBC" ? { iv: CryptoJS.enc.Utf8.parse(fixedLength(iv || "", 8)) } : {})
  };
  return CryptoJS.DES.decrypt(input, keyWords, options).toString(CryptoJS.enc.Utf8);
}

export function sm4Encrypt(input: string, key: string, mode: "SM4-CBC" | "SM4-ECB", iv?: string) {
  return sm4.encrypt(input, fixedLength(key, 16), {
    mode: mode === "SM4-CBC" ? "cbc" : "ecb",
    iv: mode === "SM4-CBC" ? fixedLength(iv || "", 16) : undefined,
    cipherType: "base64"
  });
}

export function sm4Decrypt(input: string, key: string, mode: "SM4-CBC" | "SM4-ECB", iv?: string) {
  return sm4.decrypt(input, fixedLength(key, 16), {
    mode: mode === "SM4-CBC" ? "cbc" : "ecb",
    iv: mode === "SM4-CBC" ? fixedLength(iv || "", 16) : undefined,
    cipherType: "base64",
    output: "string"
  });
}

function fixedLength(value: string, length: number) {
  const padded = `${value}${"\0".repeat(length)}`;
  return padded.slice(0, length);
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
