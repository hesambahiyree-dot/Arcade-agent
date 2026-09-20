/**
 * Virtual project filesystem.
 * Web: in-memory map, persisted to localStorage.
 * Electron: preload IPC when `window.arcadeAgent` is present.
 * Android: Capacitor Filesystem when `window.Capacitor` is native.
 */

const MEMORY_KEY = "arcade-agent-files";
const PROJECT_ROOT = "arcade-agent-project";

export type FileMap = Record<string, string>;

declare global {
  interface Window {
    arcadeAgent?: {
      fs: {
        readFile: (path: string) => Promise<string>;
        writeFile: (path: string, content: string) => Promise<void>;
        listFiles: (dir: string) => Promise<string[]>;
      };
    };
    Capacitor?: { isNativePlatform?: () => boolean };
  }
}

function normalize(path: string): string {
  return path.replace(/\\/g, "/").replace(/^\.?\//, "").replace(/^\/+/, "");
}

function isNativeCapacitor(): boolean {
  return Boolean(
    typeof window !== "undefined" && window.Capacitor?.isNativePlatform?.(),
  );
}

function readMemory(): FileMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(MEMORY_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as FileMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeMemory(files: FileMap): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(MEMORY_KEY, JSON.stringify(files));
  } catch {
    // Quota exceeded — keep working in memory for this session.
  }
}

let cache: FileMap | null = null;

function files(): FileMap {
  if (!cache) cache = readMemory();
  return cache;
}

function persist(): void {
  if (cache) writeMemory(cache);
}

export async function createFile(path: string, content: string): Promise<void> {
  const normalized = normalize(path);
  if (window.arcadeAgent?.fs) {
    await window.arcadeAgent.fs.writeFile(normalized, content);
  }
  files()[normalized] = content;
  persist();
}

export async function readFile(path: string): Promise<string> {
  const normalized = normalize(path);
  if (window.arcadeAgent?.fs) {
    return window.arcadeAgent.fs.readFile(normalized);
  }
  const content = files()[normalized];
  if (content === undefined) {
    throw new Error(`File not found: ${normalized}`);
  }
  return content;
}

export async function listFiles(directory: string): Promise<string[]> {
  const dir = normalize(directory);
  if (window.arcadeAgent?.fs) {
    return window.arcadeAgent.fs.listFiles(dir || ".");
  }
  const names = Object.keys(files()).sort();
  if (!dir || dir === "." || dir === PROJECT_ROOT) return names;
  const prefix = dir.endsWith("/") ? dir : `${dir}/`;
  return names.filter((name) => name === dir || name.startsWith(prefix));
}

export async function editFile(
  path: string,
  oldContent: string,
  newContent: string,
): Promise<string> {
  const current = await readFile(path);
  if (!current.includes(oldContent)) {
    throw new Error(`edit_file: old content not found in ${normalize(path)}`);
  }
  const next = current.replace(oldContent, newContent);
  await createFile(path, next);
  return `Updated ${normalize(path)}`;
}

export function snapshot(): FileMap {
  return { ...files() };
}

export function replaceAll(next: FileMap): void {
  cache = { ...next };
  persist();
}

export function clearFiles(): void {
  cache = {};
  persist();
}

export function isNativeRuntime(): boolean {
  return Boolean(typeof window !== "undefined" && window.arcadeAgent) || isNativeCapacitor();
}
