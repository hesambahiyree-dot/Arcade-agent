/**
 * Local, obfuscated multi-key store with automatic rotation on 429/403.
 * Obfuscation is not encryption — it only avoids storing the raw key in plain sight.
 */

const STORAGE_KEY = "arcade-agent-keys";
const XOR_KEY = 0x5a;

export type StoredKey = {
  id: string;
  /** Last four characters for the UI. */
  hint: string;
  obfuscated: string;
  usageCount: number;
  disabled: boolean;
  lastUsedAt: number | null;
};

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function obfuscate(value: string): string {
  const xored = Array.from(value, (char) =>
    String.fromCharCode(char.charCodeAt(0) ^ XOR_KEY),
  ).join("");
  return btoa(xored);
}

function deobfuscate(value: string): string {
  const xored = atob(value);
  return Array.from(xored, (char) =>
    String.fromCharCode(char.charCodeAt(0) ^ XOR_KEY),
  ).join("");
}

function readAll(): StoredKey[] {
  if (!canUseStorage()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredKey[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(keys: StoredKey[]): void {
  if (!canUseStorage()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
}

export function listKeys(): StoredKey[] {
  return readAll();
}

export function hasKeys(): boolean {
  return readAll().some((key) => !key.disabled);
}

export function addKey(rawKey: string): StoredKey {
  const trimmed = rawKey.trim();
  const keys = readAll();
  const existing = keys.find((key) => deobfuscate(key.obfuscated) === trimmed);
  if (existing) return existing;

  const record: StoredKey = {
    id: crypto.randomUUID(),
    hint: trimmed.slice(-4),
    obfuscated: obfuscate(trimmed),
    usageCount: 0,
    disabled: false,
    lastUsedAt: null,
  };
  writeAll([...keys, record]);
  return record;
}

export function removeKey(id: string): void {
  writeAll(readAll().filter((key) => key.id !== id));
}

export function revealKey(id: string): string | null {
  const record = readAll().find((key) => key.id === id);
  if (!record) return null;
  return deobfuscate(record.obfuscated);
}

function markUsage(id: string, patch: Partial<StoredKey>): void {
  writeAll(
    readAll().map((key) => (key.id === id ? { ...key, ...patch } : key)),
  );
}

export class KeyRotationError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "KeyRotationError";
    this.status = status;
  }
}

/**
 * Runs `task` with each usable key until one succeeds.
 * 429 and 403 trigger rotation; other errors bubble immediately.
 */
export async function withKeyRotation<T>(
  task: (apiKey: string) => Promise<T>,
): Promise<T> {
  const keys = readAll().filter((key) => !key.disabled);
  if (keys.length === 0) {
    throw new KeyRotationError("No Gemini API key configured.");
  }

  let lastError: unknown = null;
  for (const record of keys) {
    const apiKey = deobfuscate(record.obfuscated);
    try {
      const result = await task(apiKey);
      markUsage(record.id, {
        usageCount: record.usageCount + 1,
        lastUsedAt: Date.now(),
      });
      return result;
    } catch (error) {
      lastError = error;
      const status = extractStatus(error);
      if (status === 429 || status === 403) {
        markUsage(record.id, { disabled: status === 403 });
        continue;
      }
      throw error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new KeyRotationError("All API keys failed.");
}

export function extractStatus(error: unknown): number | undefined {
  if (typeof error === "object" && error !== null && "status" in error) {
    const status = (error as { status?: unknown }).status;
    if (typeof status === "number") return status;
  }
  if (error instanceof Error) {
    const match = error.message.match(/\b(429|403|401|404)\b/);
    if (match) return Number(match[1]);
  }
  return undefined;
}
