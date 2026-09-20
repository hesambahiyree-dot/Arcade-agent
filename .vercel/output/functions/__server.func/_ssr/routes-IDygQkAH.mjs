import { i as __toESM } from "../_runtime.mjs";
import { u as require_react } from "../_libs/@floating-ui/react-dom+[...].mjs";
import { o as require_jsx_runtime, r as Slot } from "../_libs/@radix-ui/react-collection+[...].mjs";
import { a as Settings2, c as ChevronDown, i as Square, l as Check, o as Play, r as Trash2, s as KeyRound, t as X, u as ArrowUp } from "../_libs/lucide-react.mjs";
import { t as instance } from "../_libs/i18next.mjs";
import { n as useTranslation, r as initReactI18next, t as I18nextProvider } from "../_libs/react-i18next.mjs";
import { n as nn, r as qt, t as Qt } from "../_libs/react-resizable-panels.mjs";
import { n as GoogleGenerativeAIFetchError, r as SchemaType, t as GoogleGenerativeAI } from "../_libs/google__generative-ai.mjs";
import { n as clsx, t as cva } from "../_libs/class-variance-authority+clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
import { a as DialogOverlay$1, i as DialogDescription$1, n as DialogClose, o as DialogPortal$1, r as DialogContent$1, s as DialogTitle$1, t as Dialog$1 } from "../_libs/@radix-ui/react-dialog+[...].mjs";
import { i as Viewport, n as Scrollbar, r as Thumb, t as Root } from "../_libs/radix-ui__react-scroll-area.mjs";
import { n as create, t as persist } from "../_libs/zustand.mjs";
import { a as SelectItem$1, c as SelectLabel$1, d as SelectValue$1, f as SelectViewport, i as SelectIcon, l as SelectPortal, n as SelectContent$1, o as SelectItemIndicator, r as SelectGroup$1, s as SelectItemText, t as Select$1, u as SelectTrigger$1 } from "../_libs/@radix-ui/react-select+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-IDygQkAH.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
/**
* Virtual project filesystem.
* Web: in-memory map, persisted to localStorage.
* Electron: preload IPC when `window.arcadeAgent` is present.
* Android: Capacitor Filesystem when `window.Capacitor` is native.
*/
var MEMORY_KEY = "arcade-agent-files";
var PROJECT_ROOT = "arcade-agent-project";
function normalize(path) {
	return path.replace(/\\/g, "/").replace(/^\.?\//, "").replace(/^\/+/, "");
}
function readMemory() {
	if (typeof window === "undefined") return {};
	try {
		const raw = window.localStorage.getItem(MEMORY_KEY);
		if (!raw) return {};
		const parsed = JSON.parse(raw);
		return parsed && typeof parsed === "object" ? parsed : {};
	} catch {
		return {};
	}
}
function writeMemory(files) {
	if (typeof window === "undefined") return;
	try {
		window.localStorage.setItem(MEMORY_KEY, JSON.stringify(files));
	} catch {}
}
var cache = null;
function files() {
	if (!cache) cache = readMemory();
	return cache;
}
function persist$1() {
	if (cache) writeMemory(cache);
}
async function createFile(path, content) {
	const normalized = normalize(path);
	if (window.arcadeAgent?.fs) await window.arcadeAgent.fs.writeFile(normalized, content);
	files()[normalized] = content;
	persist$1();
}
async function readFile(path) {
	const normalized = normalize(path);
	if (window.arcadeAgent?.fs) return window.arcadeAgent.fs.readFile(normalized);
	const content = files()[normalized];
	if (content === void 0) throw new Error(`File not found: ${normalized}`);
	return content;
}
async function listFiles(directory) {
	const dir = normalize(directory);
	if (window.arcadeAgent?.fs) return window.arcadeAgent.fs.listFiles(dir || ".");
	const names = Object.keys(files()).sort();
	if (!dir || dir === "." || dir === PROJECT_ROOT) return names;
	const prefix = dir.endsWith("/") ? dir : `${dir}/`;
	return names.filter((name) => name === dir || name.startsWith(prefix));
}
async function editFile(path, oldContent, newContent) {
	const current = await readFile(path);
	if (!current.includes(oldContent)) throw new Error(`edit_file: old content not found in ${normalize(path)}`);
	await createFile(path, current.replace(oldContent, newContent));
	return `Updated ${normalize(path)}`;
}
function snapshot() {
	return { ...files() };
}
function replaceAll(next) {
	cache = { ...next };
	persist$1();
}
function clearFiles() {
	cache = {};
	persist$1();
}
/**
* Agent tools: create / read / list / edit files in the virtual project.
*/
var SYSTEM_INSTRUCTION = "You are an expert web developer agent. You build complete web apps using only HTML, CSS, and JavaScript. You have access to tools: create_file, read_file, list_files, edit_file. Always create a working index.html. When done, respond with 'BUILD_COMPLETE'.";
var TOOL_DECLARATIONS = [
	{
		name: "create_file",
		description: "Create or overwrite a file in the project.",
		parameters: {
			type: SchemaType.OBJECT,
			properties: {
				path: {
					type: SchemaType.STRING,
					description: "Project-relative path, e.g. index.html or css/style.css"
				},
				content: {
					type: SchemaType.STRING,
					description: "Full file contents."
				}
			},
			required: ["path", "content"]
		}
	},
	{
		name: "read_file",
		description: "Read a file from the project.",
		parameters: {
			type: SchemaType.OBJECT,
			properties: { path: {
				type: SchemaType.STRING,
				description: "Project-relative path."
			} },
			required: ["path"]
		}
	},
	{
		name: "list_files",
		description: "List files in a directory. Use '.' for the project root.",
		parameters: {
			type: SchemaType.OBJECT,
			properties: { directory: {
				type: SchemaType.STRING,
				description: "Directory to list. '.' or '' for root."
			} },
			required: ["directory"]
		}
	},
	{
		name: "edit_file",
		description: "Replace the first occurrence of oldContent with newContent.",
		parameters: {
			type: SchemaType.OBJECT,
			properties: {
				path: {
					type: SchemaType.STRING,
					description: "Project-relative path."
				},
				oldContent: {
					type: SchemaType.STRING,
					description: "Exact text to find."
				},
				newContent: {
					type: SchemaType.STRING,
					description: "Replacement text."
				}
			},
			required: [
				"path",
				"oldContent",
				"newContent"
			]
		}
	}
];
function asString(value, fallback = "") {
	return typeof value === "string" ? value : fallback;
}
async function executeTool(name, args) {
	try {
		switch (name) {
			case "create_file": {
				const path = asString(args.path);
				await createFile(path, asString(args.content));
				return {
					ok: true,
					name,
					path,
					output: `Created ${path}`
				};
			}
			case "read_file": {
				const path = asString(args.path);
				return {
					ok: true,
					name,
					path,
					output: await readFile(path)
				};
			}
			case "list_files": {
				const listed = await listFiles(asString(args.directory, "."));
				return {
					ok: true,
					name,
					output: listed.length ? listed.join("\n") : "(empty)"
				};
			}
			case "edit_file": {
				const path = asString(args.path);
				return {
					ok: true,
					name,
					path,
					output: await editFile(path, asString(args.oldContent), asString(args.newContent))
				};
			}
			default: return {
				ok: false,
				name,
				output: `Unknown tool: ${name}`
			};
		}
	} catch (error) {
		return {
			ok: false,
			name,
			output: error instanceof Error ? error.message : String(error)
		};
	}
}
/**
* Gemini client. Uses @google/generative-ai for function calling,
* with a REST fallback for thinking-config / newer model ids.
*/
var REST_BASE = "https://generativelanguage.googleapis.com/v1beta/models";
function toTurn(result) {
	const calls = result.response.functionCalls() ?? [];
	let text = "";
	try {
		text = result.response.text() ?? "";
	} catch {
		text = "";
	}
	return {
		text,
		functionCalls: calls
	};
}
async function generateTurn(input) {
	if (input.thinking) return generateTurnRest(input);
	try {
		return await generateTurnSdk(input);
	} catch (error) {
		if (shouldFallbackToRest(error)) return generateTurnRest(input);
		throw error;
	}
}
async function generateTurnSdk(input) {
	return toTurn(await new GoogleGenerativeAI(input.apiKey).getGenerativeModel({
		model: input.model,
		systemInstruction: SYSTEM_INSTRUCTION,
		tools: [{ functionDeclarations: TOOL_DECLARATIONS }]
	}).generateContent({ contents: input.contents }, { signal: input.signal }));
}
function shouldFallbackToRest(error) {
	if (error instanceof GoogleGenerativeAIFetchError) return error.status === 404 || error.status === 400;
	const message = error instanceof Error ? error.message : "";
	return /not found|unknown model|thinking/i.test(message);
}
async function generateTurnRest(input) {
	const url = `${REST_BASE}/${encodeURIComponent(input.model)}:generateContent?key=${encodeURIComponent(input.apiKey)}`;
	const body = {
		systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
		tools: [{ functionDeclarations: TOOL_DECLARATIONS }],
		contents: input.contents,
		generationConfig: input.thinking ? { thinkingConfig: { thinkingBudget: 24576 } } : void 0
	};
	const response = await fetch(url, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
		signal: input.signal
	});
	if (!response.ok) {
		const detail = await response.text().catch(() => "");
		throw new GoogleGenerativeAIFetchError(`Gemini HTTP ${response.status}: ${detail.slice(0, 280)}`, response.status, response.statusText);
	}
	const parts = (await response.json()).candidates?.[0]?.content?.parts ?? [];
	const functionCalls = [];
	const texts = [];
	for (const part of parts) {
		if (part.functionCall?.name) functionCalls.push({
			name: part.functionCall.name,
			args: part.functionCall.args ?? {}
		});
		if (part.text) texts.push(part.text);
	}
	return {
		text: texts.join("\n"),
		functionCalls
	};
}
function modelFunctionParts(calls) {
	return calls.map((call) => ({ functionCall: {
		name: call.name,
		args: call.args
	} }));
}
function toolResponseParts(results) {
	return results.map((result) => ({ functionResponse: {
		name: result.name,
		response: result.response
	} }));
}
/**
* Local, obfuscated multi-key store with automatic rotation on 429/403.
* Obfuscation is not encryption — it only avoids storing the raw key in plain sight.
*/
var STORAGE_KEY = "arcade-agent-keys";
var XOR_KEY = 90;
function canUseStorage() {
	return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}
function obfuscate(value) {
	const xored = Array.from(value, (char) => String.fromCharCode(char.charCodeAt(0) ^ XOR_KEY)).join("");
	return btoa(xored);
}
function deobfuscate(value) {
	const xored = atob(value);
	return Array.from(xored, (char) => String.fromCharCode(char.charCodeAt(0) ^ XOR_KEY)).join("");
}
function readAll() {
	if (!canUseStorage()) return [];
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY);
		if (!raw) return [];
		const parsed = JSON.parse(raw);
		return Array.isArray(parsed) ? parsed : [];
	} catch {
		return [];
	}
}
function writeAll(keys) {
	if (!canUseStorage()) return;
	window.localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
}
function listKeys() {
	return readAll();
}
function hasKeys() {
	return readAll().some((key) => !key.disabled);
}
function addKey(rawKey) {
	const trimmed = rawKey.trim();
	const keys = readAll();
	const existing = keys.find((key) => deobfuscate(key.obfuscated) === trimmed);
	if (existing) return existing;
	const record = {
		id: crypto.randomUUID(),
		hint: trimmed.slice(-4),
		obfuscated: obfuscate(trimmed),
		usageCount: 0,
		disabled: false,
		lastUsedAt: null
	};
	writeAll([...keys, record]);
	return record;
}
function removeKey(id) {
	writeAll(readAll().filter((key) => key.id !== id));
}
function markUsage(id, patch) {
	writeAll(readAll().map((key) => key.id === id ? {
		...key,
		...patch
	} : key));
}
var KeyRotationError = class extends Error {
	status;
	constructor(message, status) {
		super(message);
		this.name = "KeyRotationError";
		this.status = status;
	}
};
/**
* Runs `task` with each usable key until one succeeds.
* 429 and 403 trigger rotation; other errors bubble immediately.
*/
async function withKeyRotation(task) {
	const keys = readAll().filter((key) => !key.disabled);
	if (keys.length === 0) throw new KeyRotationError("No Gemini API key configured.");
	let lastError = null;
	for (const record of keys) {
		const apiKey = deobfuscate(record.obfuscated);
		try {
			const result = await task(apiKey);
			markUsage(record.id, {
				usageCount: record.usageCount + 1,
				lastUsedAt: Date.now()
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
	throw lastError instanceof Error ? lastError : new KeyRotationError("All API keys failed.");
}
function extractStatus(error) {
	if (typeof error === "object" && error !== null && "status" in error) {
		const status = error.status;
		if (typeof status === "number") return status;
	}
	if (error instanceof Error) {
		const match = error.message.match(/\b(429|403|401|404)\b/);
		if (match) return Number(match[1]);
	}
}
var MODEL_OPTIONS = [
	{
		id: "gemini-3.6-flash",
		apiId: "gemini-3.6-flash",
		labelKey: "model.flash36",
		hintKey: "model.flash36Hint",
		group: "latest"
	},
	{
		id: "gemini-3.5-flash-lite",
		apiId: "gemini-3.5-flash-lite",
		labelKey: "model.flashLite35",
		hintKey: "model.flashLite35Hint",
		group: "latest"
	},
	{
		id: "gemini-3.1-pro",
		apiId: "gemini-3.1-pro-preview",
		labelKey: "model.pro31",
		hintKey: "model.pro31Hint",
		group: "latest"
	},
	{
		id: "extended-thinking",
		apiId: "gemini-3.1-pro-preview",
		labelKey: "model.thinking",
		hintKey: "model.thinkingHint",
		group: "latest",
		thinking: true
	},
	{
		id: "gemini-2.5-flash",
		apiId: "gemini-2.5-flash",
		labelKey: "model.fallbackFlash",
		hintKey: "model.fallback",
		group: "fallback"
	},
	{
		id: "gemini-2.5-pro",
		apiId: "gemini-2.5-pro",
		labelKey: "model.fallbackPro",
		hintKey: "model.fallback",
		group: "fallback"
	},
	{
		id: "custom",
		apiId: "",
		labelKey: "model.custom",
		group: "custom"
	}
];
var DEFAULT_MODEL_ID = "gemini-3.6-flash";
function resolveModel(modelId, customModel) {
	if (modelId === "custom") return {
		apiId: customModel.trim(),
		thinking: false
	};
	const option = MODEL_OPTIONS.find((item) => item.id === modelId);
	return {
		apiId: option?.apiId ?? "gemini-3.6-flash",
		thinking: Boolean(option?.thinking)
	};
}
function stripComplete(text) {
	return text.replace(/\bBUILD_COMPLETE\b/g, "").trim();
}
async function runAgent(input) {
	const resolved = resolveModel(input.modelId, input.customModel);
	if (!resolved.apiId) {
		input.onEvent({
			type: "error",
			message: "Enter a custom model name."
		});
		return;
	}
	const contents = [{
		role: "user",
		parts: [{ text: input.prompt }]
	}];
	try {
		for (let index = 1; index <= 15; index += 1) {
			if (input.signal?.aborted) {
				input.onEvent({
					type: "error",
					message: "Stopped."
				});
				return;
			}
			input.onEvent({
				type: "iteration",
				index
			});
			const turn = await withKeyRotation((apiKey) => generateTurn({
				apiKey,
				model: resolved.apiId,
				contents,
				thinking: resolved.thinking,
				signal: input.signal
			}));
			if (turn.functionCalls.length > 0) {
				contents.push({
					role: "model",
					parts: modelFunctionParts(turn.functionCalls)
				});
				const executed = [];
				for (const call of turn.functionCalls) {
					const args = call.args ?? {};
					const result = await executeTool(call.name, args);
					input.onEvent({
						type: "tool",
						name: result.name,
						path: result.path,
						ok: result.ok,
						output: result.output
					});
					executed.push({
						name: call.name,
						response: {
							ok: result.ok,
							output: result.output
						}
					});
				}
				contents.push({
					role: "user",
					parts: toolResponseParts(executed)
				});
				continue;
			}
			const text = turn.text || "";
			const cleaned = stripComplete(text);
			if (/BUILD_COMPLETE/i.test(text) || cleaned.length > 0 || index === 15) {
				input.onEvent({
					type: "complete",
					text: cleaned || "BUILD_COMPLETE"
				});
				return;
			}
		}
		input.onEvent({
			type: "error",
			message: `Stopped after 15 tool iterations.`
		});
	} catch (error) {
		if (input.signal?.aborted) {
			input.onEvent({
				type: "error",
				message: "Stopped."
			});
			return;
		}
		const message = error instanceof Error ? error.message : String(error);
		input.onEvent({
			type: "error",
			message
		});
	}
}
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
var buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[background-color,color,box-shadow,transform,opacity] duration-150 ease-out disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-ring/50 active:not-disabled:scale-[0.96]", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground hover:bg-primary/90",
			secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
			ghost: "hover:bg-accent hover:text-accent-foreground",
			outline: "border border-border bg-transparent hover:bg-accent",
			destructive: "bg-destructive text-primary-foreground hover:opacity-90"
		},
		size: {
			default: "h-10 px-4",
			sm: "h-8 rounded-md px-3 text-xs",
			lg: "h-11 rounded-md px-5",
			icon: "size-10"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant, size, asChild = false, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(asChild ? Slot : "button", {
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		...props
	});
}
function ScrollArea({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Root, {
		className: cn("relative overflow-hidden", className),
		...props,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Viewport, {
			className: "h-full w-full rounded-[inherit]",
			children
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scrollbar, {
			orientation: "vertical",
			className: "flex w-2 touch-none p-px select-none",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Thumb, { className: "relative flex-1 rounded-full bg-border" })
		})]
	});
}
function Textarea({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
		className: cn("flex min-h-24 w-full resize-none rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-[var(--shadow-border)] transition-[box-shadow,border-color] duration-150 placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50", className),
		...props
	});
}
/** A complete three-file project so editor + preview work without an API key. */
var SAMPLE_FILES = {
	"index.html": `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Pulse Grid</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <main>
      <header>
        <p class="kicker">ArcadeAgent sample</p>
        <h1>Pulse Grid</h1>
        <p class="meta">Clear the board. Each tap flips a cell and its neighbours.</p>
      </header>
      <section class="hud">
        <span>Moves <strong id="moves">0</strong></span>
        <span>Lit <strong id="lit">0</strong></span>
        <button type="button" id="reset">Reset</button>
      </section>
      <div id="board" class="board" role="grid" aria-label="Pulse Grid"></div>
      <p id="status" class="status">Tap a cell to begin.</p>
    </main>
    <script src="game.js"><\/script>
  </body>
</html>
`,
	"styles.css": `:root {
  --bg: #0b0c0e;
  --panel: #141518;
  --ink: #f2f1ee;
  --muted: #8b8d93;
  --line: rgba(242, 241, 238, 0.1);
  --cell: #1c1d22;
  --on: #d8dce4;
}
* { box-sizing: border-box; }
html, body { height: 100%; margin: 0; }
body {
  min-height: 100%;
  display: grid;
  place-items: center;
  background:
    radial-gradient(1200px 500px at 50% -10%, rgba(216, 220, 228, 0.08), transparent 50%),
    var(--bg);
  color: var(--ink);
  font: 15px/1.5 "IBM Plex Sans", "Segoe UI", sans-serif;
}
main {
  width: min(420px, calc(100% - 32px));
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: 24px;
  padding: 24px;
}
.kicker {
  margin: 0 0 8px;
  color: var(--muted);
  font-size: 11px;
  letter-spacing: 0.16em;
  text-transform: uppercase;
}
h1 { margin: 0; font-size: 28px; letter-spacing: -0.04em; font-weight: 600; }
.meta { margin: 8px 0 0; color: var(--muted); }
.hud {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 20px 0 16px;
  color: var(--muted);
  font-size: 13px;
}
.hud strong { color: var(--ink); font-variant-numeric: tabular-nums; }
#reset {
  margin-inline-start: auto;
  height: 36px;
  padding: 0 14px;
  border: 0;
  border-radius: 10px;
  background: var(--ink);
  color: var(--bg);
  font-weight: 600;
  cursor: pointer;
}
.board {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}
.cell {
  aspect-ratio: 1;
  border: 0;
  border-radius: 12px;
  background: var(--cell);
  box-shadow: inset 0 0 0 1px var(--line);
  cursor: pointer;
  transition: background 150ms ease, transform 150ms ease;
}
.cell.on { background: var(--on); }
.cell:active { transform: scale(0.96); }
.status { margin: 16px 0 0; min-height: 1.5em; color: var(--muted); }
`,
	"game.js": `const SIZE = 5;
const boardEl = document.getElementById("board");
const movesEl = document.getElementById("moves");
const litEl = document.getElementById("lit");
const statusEl = document.getElementById("status");
const resetEl = document.getElementById("reset");

let cells = [];
let moves = 0;

function index(x, y) { return y * SIZE + x; }

function neighbors(i) {
  const x = i % SIZE;
  const y = Math.floor(i / SIZE);
  const next = [i];
  if (x > 0) next.push(index(x - 1, y));
  if (x < SIZE - 1) next.push(index(x + 1, y));
  if (y > 0) next.push(index(x, y - 1));
  if (y < SIZE - 1) next.push(index(x, y + 1));
  return next;
}

function render() {
  let lit = 0;
  for (let i = 0; i < cells.length; i += 1) {
    const on = cells[i];
    boardEl.children[i].classList.toggle("on", on);
    if (on) lit += 1;
  }
  movesEl.textContent = String(moves);
  litEl.textContent = String(lit);
  if (lit === 0) {
    statusEl.textContent = "Clear. " + moves + " moves.";
  }
}

function press(i) {
  if (cells.every((cell) => !cell) && moves > 0) return;
  for (const n of neighbors(i)) cells[n] = !cells[n];
  moves += 1;
  render();
}

function scramble() {
  cells = Array.from({ length: SIZE * SIZE }, () => false);
  moves = 0;
  const taps = 8 + Math.floor(Math.random() * 7);
  for (let n = 0; n < taps; n += 1) {
    const i = Math.floor(Math.random() * cells.length);
    for (const nb of neighbors(i)) cells[nb] = !cells[nb];
  }
  statusEl.textContent = "Tap a cell to begin.";
  render();
}

boardEl.innerHTML = "";
for (let i = 0; i < SIZE * SIZE; i += 1) {
  const btn = document.createElement("button");
  btn.className = "cell";
  btn.type = "button";
  btn.setAttribute("aria-label", "Cell " + (i + 1));
  btn.addEventListener("click", () => press(i));
  boardEl.appendChild(btn);
}
resetEl.addEventListener("click", scramble);
scramble();
`
};
var SAMPLE_ACTIVE = "index.html";
var en_default = {
	app: {
		"name": "ArcadeAgent",
		"tagline": "Describe an app. The agent builds it.",
		"shortTagline": "Local-first AI builder"
	},
	nav: {
		"chat": "Chat",
		"editor": "Editor",
		"preview": "Preview"
	},
	chat: {
		"title": "Brief",
		"placeholder": "Describe the app or game you want…",
		"build": "Build",
		"stop": "Stop",
		"emptyTitle": "What should we make?",
		"emptyBody": "Write a brief in plain language. The agent will create HTML, CSS, and JavaScript, then run it in the preview.",
		"you": "You",
		"agent": "Agent",
		"thinking": "Building",
		"toolCall": "Tool",
		"buildComplete": "Build complete",
		"error": "The agent hit an error",
		"needKey": "Add a Gemini API key before building.",
		"iteration": "Step {{current}} of {{max}}"
	},
	examples: {
		"title": "Try a brief",
		"snake": "Build a polished snake game with score, pause, and a dark arcade look.",
		"todo": "Build a bilingual todo app with filters, local save, and keyboard shortcuts.",
		"calculator": "Build a scientific calculator with history and keyboard support.",
		"platformer": "Build a short two-level platformer with coins, a jump pad, and a win screen."
	},
	editor: {
		"title": "Files",
		"empty": "Generated files appear here.",
		"emptyHint": "Run a build, or load the sample project to inspect the editor.",
		"loadSample": "Load sample",
		"untitled": "untitled"
	},
	preview: {
		"title": "Live preview",
		"run": "Run",
		"empty": "Nothing to preview yet.",
		"emptyHint": "Build a project or load the sample, then press Run.",
		"sandbox": "Sandboxed iframe"
	},
	settings: {
		"title": "Settings",
		"language": "Language",
		"languageHint": "Persian uses a right-to-left layout.",
		"persian": "Persian",
		"english": "English",
		"theme": "Theme",
		"themeHint": "System follows the device appearance.",
		"themeLight": "Light",
		"themeDark": "Dark",
		"themeSystem": "System",
		"model": "Model",
		"modelHint": "Latest Gemini models, plus fallbacks.",
		"customModel": "Custom model name",
		"customPlaceholder": "e.g. gemini-3.8-flash",
		"clearProject": "Clear project",
		"clearHint": "Removes files and chat from this device.",
		"close": "Close"
	},
	apiKey: {
		"title": "Gemini API keys",
		"description": "Keys stay on this device, obfuscated in local storage. On 429 or 403 the agent rotates to the next key.",
		"add": "Add key",
		"placeholder": "Paste a Gemini API key",
		"save": "Save",
		"remove": "Remove",
		"empty": "No keys yet.",
		"usage": "{{count}} calls",
		"invalid": "That does not look like a valid key.",
		"active": "Active",
		"open": "API keys",
		"missing": "No key"
	},
	model: {
		"flash36": "3.6 Flash",
		"flash36Hint": "All-around help",
		"flashLite35": "3.5 Flash-Lite",
		"flashLite35Hint": "Fastest answers",
		"pro31": "3.1 Pro",
		"pro31Hint": "Advanced reasoning",
		"thinking": "Extended thinking",
		"thinkingHint": "Complex problem solving",
		"fallbackFlash": "gemini-2.5-flash",
		"fallbackPro": "gemini-2.5-pro",
		"fallback": "API fallback",
		"custom": "Custom model name",
		"latest": "Latest"
	},
	status: {
		"ready": "Ready",
		"building": "Building",
		"error": "Error"
	},
	sample: { "loaded": "Sample project loaded. Press Run to play." }
};
var fa_default = {
	app: {
		"name": "ArcadeAgent",
		"tagline": "اپ را توصیف کن. ایجنت می‌سازدش.",
		"shortTagline": "سازندهٔ هوش مصنوعیِ محلی"
	},
	nav: {
		"chat": "گفتگو",
		"editor": "ویرایشگر",
		"preview": "پیش‌نمایش"
	},
	chat: {
		"title": "بریف",
		"placeholder": "اپ یا بازی‌ای که می‌خواهی بسازی را توصیف کن…",
		"build": "بساز",
		"stop": "توقف",
		"emptyTitle": "چه چیزی بسازیم؟",
		"emptyBody": "با زبان طبیعی توضیح بده. ایجنت فایل‌های HTML، CSS و JavaScript را می‌سازد و در پیش‌نمایش اجرا می‌کند.",
		"you": "شما",
		"agent": "ایجنت",
		"thinking": "در حال ساخت",
		"toolCall": "ابزار",
		"buildComplete": "ساخت تمام شد",
		"error": "ایجنت به خطا خورد",
		"needKey": "قبل از ساخت، یک کلید Gemini اضافه کن.",
		"iteration": "گام {{current}} از {{max}}"
	},
	examples: {
		"title": "یک بریف را امتحان کن",
		"snake": "یک بازی مارِ پرداخت‌شده با امتیاز، مکث و ظاهر آرکید تیره بساز.",
		"todo": "یک فهرست کار دوزبانه با فیلتر، ذخیرهٔ محلی و میانبر کیبورد بساز.",
		"calculator": "یک ماشین‌حساب علمی با تاریخچه و پشتیبانی کیبورد بساز.",
		"platformer": "یک پلتفرمر کوتاه دو مرحله‌ای با سکه، پد پرش و صفحهٔ برد بساز."
	},
	editor: {
		"title": "فایل‌ها",
		"empty": "فایل‌های ساخته‌شده اینجا ظاهر می‌شوند.",
		"emptyHint": "یک ساخت اجرا کن، یا پروژهٔ نمونه را بارگذاری کن.",
		"loadSample": "بارگذاری نمونه",
		"untitled": "بدون‌نام"
	},
	preview: {
		"title": "پیش‌نمایش زنده",
		"run": "اجرا",
		"empty": "هنوز چیزی برای پیش‌نمایش نیست.",
		"emptyHint": "پروژه را بساز یا نمونه را بارگذاری کن، بعد اجرا را بزن.",
		"sandbox": "آی‌فریم ایزوله"
	},
	settings: {
		"title": "تنظیمات",
		"language": "زبان",
		"languageHint": "فارسی چیدمان راست‌به‌چپ دارد.",
		"persian": "فارسی",
		"english": "انگلیسی",
		"theme": "تم",
		"themeHint": "سیستم از ظاهر دستگاه پیروی می‌کند.",
		"themeLight": "روشن",
		"themeDark": "تیره",
		"themeSystem": "سیستم",
		"model": "مدل",
		"modelHint": "جدیدترین مدل‌های Gemini، به‌علاوهٔ نسخه‌های پشتیبان.",
		"customModel": "نام سفارشی مدل",
		"customPlaceholder": "مثلاً gemini-3.8-flash",
		"clearProject": "پاک کردن پروژه",
		"clearHint": "فایل‌ها و گفتگو از این دستگاه حذف می‌شوند.",
		"close": "بستن"
	},
	apiKey: {
		"title": "کلیدهای Gemini",
		"description": "کلیدها روی همین دستگاه می‌مانند و در حافظهٔ محلی مبهم‌سازی می‌شوند. در خطای ۴۲۹ یا ۴۰۳ ایجنت سراغ کلید بعدی می‌رود.",
		"add": "افزودن کلید",
		"placeholder": "کلید Gemini را بچسبان",
		"save": "ذخیره",
		"remove": "حذف",
		"empty": "هنوز کلیدی نیست.",
		"usage": "{{count}} فراخوانی",
		"invalid": "این شبیه یک کلید معتبر نیست.",
		"active": "فعال",
		"open": "کلید API",
		"missing": "بدون کلید"
	},
	model: {
		"flash36": "3.6 Flash",
		"flash36Hint": "کمک همه‌جانبه",
		"flashLite35": "3.5 Flash-Lite",
		"flashLite35Hint": "سریع‌ترین پاسخ",
		"pro31": "3.1 Pro",
		"pro31Hint": "استدلال پیشرفته",
		"thinking": "Extended thinking",
		"thinkingHint": "حل مسئله پیچیده",
		"fallbackFlash": "gemini-2.5-flash",
		"fallbackPro": "gemini-2.5-pro",
		"fallback": "پشتیبان API",
		"custom": "نام سفارشی مدل",
		"latest": "جدید"
	},
	status: {
		"ready": "آماده",
		"building": "در حال ساخت",
		"error": "خطا"
	},
	sample: { "loaded": "پروژهٔ نمونه بارگذاری شد. برای بازی، اجرا را بزن." }
};
var LANG_STORAGE_KEY = "arcade-agent-lang";
function readStoredLanguage() {
	if (typeof window === "undefined") return "fa";
	const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
	return stored === "en" || stored === "fa" ? stored : "fa";
}
function languageDir(lang) {
	return lang === "fa" ? "rtl" : "ltr";
}
instance.use(initReactI18next).init({
	resources: {
		en: { translation: en_default },
		fa: { translation: fa_default }
	},
	lng: readStoredLanguage(),
	fallbackLng: "fa",
	interpolation: { escapeValue: false }
});
var i18n_default = instance;
var THEME_STORAGE_KEY = "arcade-agent-theme";
function applyTheme(theme) {
	if (typeof document === "undefined") return;
	const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
	const dark = theme === "dark" || theme === "system" && prefersDark;
	document.documentElement.classList.toggle("dark", dark);
}
function applyLanguage(language) {
	if (typeof document === "undefined") return;
	document.documentElement.lang = language;
	document.documentElement.dir = languageDir(language);
	i18n_default.changeLanguage(language);
	window.localStorage.setItem(LANG_STORAGE_KEY, language);
}
var useStore = create()(persist((set, get) => ({
	messages: [],
	files: {},
	activeFile: null,
	previewNonce: 0,
	isBuilding: false,
	iteration: 0,
	theme: "system",
	language: "fa",
	modelId: DEFAULT_MODEL_ID,
	customModel: "",
	mobilePanel: "chat",
	settingsOpen: false,
	apiKeyModalOpen: false,
	addMessage: (message) => set((state) => ({ messages: [...state.messages, {
		...message,
		id: crypto.randomUUID(),
		createdAt: Date.now()
	}].slice(-120) })),
	setFiles: (files) => {
		replaceAll(files);
		const paths = Object.keys(files);
		set({
			files: { ...files },
			activeFile: get().activeFile && files[get().activeFile] ? get().activeFile : files["index.html"] !== void 0 ? "index.html" : paths[0] ?? null
		});
	},
	refreshFiles: () => {
		const files = snapshot();
		const paths = Object.keys(files);
		set({
			files,
			activeFile: get().activeFile && files[get().activeFile] ? get().activeFile : files["index.html"] !== void 0 ? "index.html" : paths[0] ?? null
		});
	},
	setActiveFile: (path) => set({ activeFile: path }),
	updateFileContent: (path, content) => {
		const files = {
			...get().files,
			[path]: content
		};
		replaceAll(files);
		set({ files });
	},
	bumpPreview: () => set({ previewNonce: get().previewNonce + 1 }),
	setBuilding: (value) => set({
		isBuilding: value,
		iteration: value ? 1 : 0
	}),
	setIteration: (value) => set({ iteration: value }),
	setTheme: (theme) => {
		window.localStorage.setItem(THEME_STORAGE_KEY, theme);
		applyTheme(theme);
		set({ theme });
	},
	setLanguage: (language) => {
		applyLanguage(language);
		set({ language });
	},
	setModelId: (id) => set({ modelId: id }),
	setCustomModel: (value) => set({ customModel: value }),
	setMobilePanel: (panel) => set({ mobilePanel: panel }),
	setSettingsOpen: (open) => set({ settingsOpen: open }),
	setApiKeyModalOpen: (open) => set({ apiKeyModalOpen: open }),
	loadSample: () => {
		replaceAll(SAMPLE_FILES);
		set((state) => ({
			files: { ...SAMPLE_FILES },
			activeFile: SAMPLE_ACTIVE,
			previewNonce: state.previewNonce + 1,
			mobilePanel: "preview"
		}));
	},
	clearProject: () => {
		clearFiles();
		set({
			messages: [],
			files: {},
			activeFile: null,
			previewNonce: get().previewNonce + 1,
			iteration: 0
		});
	}
}), {
	name: "arcade-agent-state",
	partialize: (state) => ({
		messages: state.messages,
		files: state.files,
		activeFile: state.activeFile,
		theme: state.theme,
		language: state.language,
		modelId: state.modelId,
		customModel: state.customModel
	}),
	onRehydrateStorage: () => (state) => {
		if (!state) return;
		if (state.files) replaceAll(state.files);
		applyTheme(state.theme);
		applyLanguage(state.language);
	}
}));
var EXAMPLE_KEYS = [
	"examples.snake",
	"examples.todo",
	"examples.calculator",
	"examples.platformer"
];
function ChatPanel() {
	const { t } = useTranslation();
	const messages = useStore((s) => s.messages);
	const addMessage = useStore((s) => s.addMessage);
	const isBuilding = useStore((s) => s.isBuilding);
	const setBuilding = useStore((s) => s.setBuilding);
	const setIteration = useStore((s) => s.setIteration);
	const iteration = useStore((s) => s.iteration);
	const refreshFiles = useStore((s) => s.refreshFiles);
	const bumpPreview = useStore((s) => s.bumpPreview);
	const modelId = useStore((s) => s.modelId);
	const customModel = useStore((s) => s.customModel);
	const setApiKeyModalOpen = useStore((s) => s.setApiKeyModalOpen);
	const [prompt, setPrompt] = (0, import_react.useState)("");
	const abortRef = (0, import_react.useRef)(null);
	const endRef = (0, import_react.useRef)(null);
	(0, import_react.useEffect)(() => {
		endRef.current?.scrollIntoView({ block: "end" });
	}, [messages, isBuilding]);
	async function startBuild(text) {
		const trimmed = text.trim();
		if (!trimmed || isBuilding) return;
		if (!hasKeys()) {
			setApiKeyModalOpen(true);
			addMessage({
				role: "status",
				content: t("chat.needKey")
			});
			return;
		}
		setPrompt("");
		addMessage({
			role: "user",
			content: trimmed
		});
		setBuilding(true);
		const controller = new AbortController();
		abortRef.current = controller;
		await runAgent({
			prompt: trimmed,
			modelId,
			customModel,
			signal: controller.signal,
			onEvent: (event) => {
				if (event.type === "iteration") setIteration(event.index);
				if (event.type === "tool") {
					addMessage({
						role: "tool",
						content: event.path || event.output,
						toolName: event.name,
						toolOk: event.ok
					});
					refreshFiles();
				}
				if (event.type === "complete") {
					addMessage({
						role: "assistant",
						content: event.text || t("chat.buildComplete")
					});
					refreshFiles();
					bumpPreview();
				}
				if (event.type === "error") addMessage({
					role: "status",
					content: event.message
				});
			}
		});
		abortRef.current = null;
		setBuilding(false);
	}
	function stop() {
		abortRef.current?.abort();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full min-h-0 flex-col bg-sidebar",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex h-12 items-center justify-between border-b border-border px-4",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
					className: "text-sm font-medium",
					children: t("chat.title")
				}), isBuilding ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
					className: "text-[11px] text-muted-foreground tabular-nums",
					children: t("chat.iteration", {
						current: iteration,
						max: 15
					})
				}) : null]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ScrollArea, {
				className: "min-h-0 flex-1",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "space-y-3 p-4",
					children: [
						messages.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EmptyState, { onPick: (value) => {
							setPrompt(value);
						} }) : messages.map((message) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("article", {
							className: cn("rounded-lg px-3 py-2 text-sm", message.role === "user" && "bg-foreground text-background", message.role === "assistant" && "bg-card border border-border", message.role === "tool" && "border border-border bg-transparent font-mono text-xs text-muted-foreground", message.role === "status" && "text-destructive"),
							children: message.role === "tool" ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-medium text-foreground",
								children: message.toolName
							}), message.content ? ` · ${message.content}` : null] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "whitespace-pre-wrap",
								children: message.content
							})
						}, message.id)),
						isBuilding ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "shimmer text-sm font-medium",
							children: t("chat.thinking")
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", { ref: endRef })
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
				className: "border-t border-border p-3",
				onSubmit: (event) => {
					event.preventDefault();
					startBuild(prompt);
				},
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Textarea, {
					value: prompt,
					onChange: (event) => setPrompt(event.target.value),
					placeholder: t("chat.placeholder"),
					className: "min-h-[88px] bg-background",
					onKeyDown: (event) => {
						if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
							event.preventDefault();
							startBuild(prompt);
						}
					}
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
					className: "mt-2 flex justify-end",
					children: isBuilding ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "button",
						variant: "outline",
						onClick: stop,
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Square, { className: "size-3.5" }), t("chat.stop")]
					}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
						type: "submit",
						disabled: !prompt.trim(),
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowUp, { className: "size-4" }), t("chat.build")]
					})
				})]
			})
		]
	});
}
function EmptyState({ onPick }) {
	const { t } = useTranslation();
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "space-y-4 pt-4",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
			className: "text-lg font-semibold tracking-tight",
			children: t("chat.emptyTitle")
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 text-sm text-muted-foreground",
			children: t("chat.emptyBody")
		})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground",
			children: t("examples.title")
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "space-y-2",
			children: EXAMPLE_KEYS.map((key) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => onPick(t(key)),
				className: "w-full rounded-lg border border-border bg-card px-3 py-2.5 text-start text-sm text-foreground transition-colors duration-150 hover:bg-accent",
				children: t(key)
			}, key))
		})] })]
	});
}
function lookup(files, href) {
	const cleaned = href.split("?")[0]?.split("#")[0] ?? href;
	const candidates = [
		cleaned,
		cleaned.replace(/^\.\//, ""),
		cleaned.replace(/^\//, "")
	];
	for (const candidate of candidates) if (files[candidate] !== void 0) return files[candidate];
}
/** Inline relative CSS/JS so the iframe srcdoc can run a multi-file project. */
function buildPreviewHtml(files) {
	const html = files["index.html"] ?? files["index.htm"] ?? Object.entries(files).find(([path]) => path.endsWith(".html"))?.[1];
	if (!html) return `<!doctype html><html><body style="font-family:system-ui;padding:24px;color:#8b8d93;background:#0b0c0e">No index.html</body></html>`;
	let next = html.replace(/<link\b[^>]*href=["']([^"']+)["'][^>]*>/gi, (full, href) => {
		if (/^https?:|^data:|^\/\//i.test(href)) return full;
		const css = lookup(files, href);
		return css !== void 0 ? `<style>\n${css}\n</style>` : full;
	});
	next = next.replace(/<script\b([^>]*)\bsrc=["']([^"']+)["']([^>]*)>\s*<\/script>/gi, (full, before, src, after) => {
		if (/^https?:|^data:|^\/\//i.test(src)) return full;
		const js = lookup(files, src);
		if (js === void 0) return full;
		return `<script ${`${before}${after}`.replace(/\s+/g, " ").trim()}>\n${js}\n<\/script>`;
	});
	return next;
}
function languageFromPath(path) {
	switch (path.split(".").pop()?.toLowerCase()) {
		case "html":
		case "htm": return "html";
		case "css": return "css";
		case "js":
		case "mjs":
		case "cjs": return "javascript";
		case "ts": return "typescript";
		case "json": return "json";
		case "md": return "markdown";
		case "svg": return "xml";
		default: return "plaintext";
	}
}
function EditorPanel() {
	const { t } = useTranslation();
	const files = useStore((s) => s.files);
	const activeFile = useStore((s) => s.activeFile);
	const setActiveFile = useStore((s) => s.setActiveFile);
	const updateFileContent = useStore((s) => s.updateFileContent);
	const loadSample = useStore((s) => s.loadSample);
	const addMessage = useStore((s) => s.addMessage);
	const theme = useStore((s) => s.theme);
	const paths = Object.keys(files).sort();
	const [Editor, setEditor] = (0, import_react.useState)(null);
	const [dark, setDark] = (0, import_react.useState)(true);
	(0, import_react.useEffect)(() => {
		let cancelled = false;
		import("../_libs/monaco-editor__react.mjs").then((n) => n.t).then((mod) => {
			if (!cancelled) setEditor(() => mod.default);
		});
		return () => {
			cancelled = true;
		};
	}, []);
	(0, import_react.useEffect)(() => {
		const media = window.matchMedia("(prefers-color-scheme: dark)");
		const sync = () => {
			setDark(theme === "dark" || theme === "system" && media.matches);
		};
		sync();
		media.addEventListener("change", sync);
		return () => media.removeEventListener("change", sync);
	}, [theme]);
	const content = activeFile ? files[activeFile] ?? "" : "";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full min-h-0 min-w-0 flex-col bg-background",
		dir: "ltr",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("header", {
			className: "flex h-12 items-center gap-2 overflow-x-auto border-b border-border px-2",
			children: paths.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "px-2 text-sm text-muted-foreground",
				children: t("editor.title")
			}) : paths.map((path) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => setActiveFile(path),
				className: cn("h-8 shrink-0 rounded-md px-2.5 font-mono text-xs transition-colors duration-150", path === activeFile ? "bg-foreground text-background" : "text-muted-foreground hover:bg-accent hover:text-foreground"),
				children: path
			}, path))
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "min-h-0 flex-1",
			children: paths.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex h-full flex-col items-center justify-center gap-3 px-6 text-center",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: t("editor.empty")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "max-w-sm text-sm text-muted-foreground",
						children: t("editor.emptyHint")
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "outline",
						onClick: () => {
							loadSample();
							addMessage({
								role: "status",
								content: t("sample.loaded")
							});
						},
						children: t("editor.loadSample")
					})
				]
			}) : Editor ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Editor, {
				theme: dark ? "vs-dark" : "vs",
				language: languageFromPath(activeFile ?? ""),
				value: content,
				path: activeFile ?? "untitled",
				onChange: (value) => {
					if (activeFile) updateFileContent(activeFile, value ?? "");
				},
				options: {
					minimap: { enabled: false },
					fontSize: 13,
					fontFamily: "IBM Plex Mono, ui-monospace, monospace",
					scrollBeyondLastLine: false,
					automaticLayout: true,
					wordWrap: "on",
					padding: { top: 12 },
					tabSize: 2
				}
			}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("textarea", {
				className: "h-full w-full resize-none bg-background p-4 font-mono text-sm text-foreground outline-none",
				value: content,
				onChange: (event) => {
					if (activeFile) updateFileContent(activeFile, event.target.value);
				}
			})
		})]
	});
}
function PreviewPanel() {
	const { t } = useTranslation();
	const files = useStore((s) => s.files);
	const previewNonce = useStore((s) => s.previewNonce);
	const bumpPreview = useStore((s) => s.bumpPreview);
	const hasHtml = Boolean(files["index.html"] || files["index.htm"]);
	const srcDoc = (0, import_react.useMemo)(() => hasHtml ? buildPreviewHtml(files) : "", [
		files,
		hasHtml,
		previewNonce
	]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-full min-h-0 min-w-0 flex-col bg-background",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
			className: "flex h-12 items-center justify-between border-b border-border px-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
				className: "text-sm font-medium",
				children: t("preview.title")
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Button, {
				type: "button",
				size: "sm",
				variant: "outline",
				onClick: bumpPreview,
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Play, { className: "size-3.5" }), t("preview.run")]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
			className: "min-h-0 flex-1 bg-card",
			children: hasHtml ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("iframe", {
				title: t("preview.title"),
				className: "h-full w-full border-0 bg-background",
				sandbox: "allow-scripts allow-forms allow-modals allow-pointer-lock",
				srcDoc
			}, previewNonce) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex h-full flex-col items-center justify-center gap-2 px-6 text-center",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium",
					children: t("preview.empty")
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "max-w-sm text-sm text-muted-foreground",
					children: t("preview.emptyHint")
				})]
			})
		})]
	});
}
var Dialog = Dialog$1;
var DialogPortal = DialogPortal$1;
function DialogOverlay({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay$1, {
		className: cn("fixed inset-0 z-50 bg-foreground/40 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className),
		...props
	});
}
function DialogContent({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogPortal, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogOverlay, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent$1, {
		className: cn("fixed top-1/2 left-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-5 text-card-foreground shadow-[var(--shadow-border)] outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95", className),
		...props,
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogClose, {
			className: "absolute top-3 end-3 inline-flex size-10 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(X, { className: "size-4" }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "sr-only",
				children: "Close"
			})]
		})]
	})] });
}
function DialogHeader({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: cn("mb-4 space-y-1 pe-8", className),
		...props
	});
}
function DialogTitle({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle$1, {
		className: cn("text-base font-semibold tracking-tight", className),
		...props
	});
}
function DialogDescription({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription$1, {
		className: cn("text-sm text-muted-foreground", className),
		...props
	});
}
function Input({ className, type, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
		type,
		className: cn("flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm text-foreground shadow-[var(--shadow-border)] transition-[box-shadow,border-color] duration-150 placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50", className),
		...props
	});
}
function ApiKeyModal() {
	const { t } = useTranslation();
	const open = useStore((s) => s.apiKeyModalOpen);
	const setOpen = useStore((s) => s.setApiKeyModalOpen);
	const [draft, setDraft] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)(null);
	const [keys, setKeys] = (0, import_react.useState)(() => typeof window === "undefined" ? [] : listKeys());
	const refresh = () => setKeys(listKeys());
	const usable = (0, import_react.useMemo)(() => keys.filter((key) => !key.disabled), [keys]);
	function onSave() {
		const value = draft.trim();
		if (value.length < 20) {
			setError(t("apiKey.invalid"));
			return;
		}
		addKey(value);
		setDraft("");
		setError(null);
		refresh();
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange: setOpen,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogHeader, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: t("apiKey.title") }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogDescription, { children: t("apiKey.description") })] }),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex gap-2",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
					value: draft,
					onChange: (event) => setDraft(event.target.value),
					placeholder: t("apiKey.placeholder"),
					autoComplete: "off",
					spellCheck: false,
					onKeyDown: (event) => {
						if (event.key === "Enter") onSave();
					}
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
					type: "button",
					onClick: onSave,
					children: t("apiKey.save")
				})]
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-2 text-sm text-destructive",
				children: error
			}) : null,
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
				className: "mt-4 space-y-2",
				children: keys.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
					className: "rounded-lg border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground",
					children: t("apiKey.empty")
				}) : keys.map((key, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
					className: "flex items-center gap-3 rounded-lg border border-border bg-secondary/40 px-3 py-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: "size-4 text-muted-foreground" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "min-w-0 flex-1",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "font-mono text-sm tracking-wide",
								children: [
									"••••",
									key.hint,
									index === 0 && !key.disabled ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										className: "ms-2 text-[11px] font-sans tracking-normal text-muted-foreground",
										children: t("apiKey.active")
									}) : null
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "text-xs text-muted-foreground tabular-nums",
								children: t("apiKey.usage", { count: key.usageCount })
							})]
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
							type: "button",
							size: "icon",
							variant: "ghost",
							onClick: () => {
								removeKey(key.id);
								refresh();
							},
							"aria-label": t("apiKey.remove"),
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Trash2, { className: "size-4" })
						})
					]
				}, key.id))
			}),
			usable.length === 0 && keys.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-3 text-sm text-destructive",
				children: t("apiKey.missing")
			}) : null
		] })
	});
}
function Label({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
		className: cn("text-sm font-medium text-foreground", className),
		...props
	});
}
var Select = Select$1;
var SelectValue = SelectValue$1;
var SelectGroup = SelectGroup$1;
function SelectTrigger({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectTrigger$1, {
		className: cn("flex h-10 w-full items-center justify-between gap-2 rounded-md border border-input bg-background px-3 text-sm shadow-[var(--shadow-border)] outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1", className),
		...props,
		children: [children, /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectIcon, {
			asChild: true,
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChevronDown, { className: "size-4 text-muted-foreground" })
		})]
	});
}
function SelectContent({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectPortal, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectContent$1, {
		className: cn("relative z-50 max-h-72 min-w-[var(--radix-select-trigger-width)] overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-[var(--shadow-border)]", className),
		position: "popper",
		sideOffset: 6,
		...props,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectViewport, {
			className: "p-1",
			children
		})
	}) });
}
function SelectLabel({ className, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectLabel$1, {
		className: cn("px-2 py-1.5 text-[11px] font-medium uppercase tracking-wider text-muted-foreground", className),
		...props
	});
}
function SelectItem({ className, children, ...props }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem$1, {
		className: cn("relative flex w-full cursor-pointer items-center rounded-md py-2 ps-8 pe-2 text-sm outline-none select-none focus:bg-accent data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className),
		...props,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "absolute start-2 flex size-4 items-center justify-center",
			children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItemIndicator, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, { className: "size-3.5" }) })
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItemText, { children })]
	});
}
var THEMES = [
	"light",
	"dark",
	"system"
];
function SettingsModal() {
	const { t } = useTranslation();
	const open = useStore((s) => s.settingsOpen);
	const setOpen = useStore((s) => s.setSettingsOpen);
	const theme = useStore((s) => s.theme);
	const setTheme = useStore((s) => s.setTheme);
	const language = useStore((s) => s.language);
	const setLanguage = useStore((s) => s.setLanguage);
	const modelId = useStore((s) => s.modelId);
	const setModelId = useStore((s) => s.setModelId);
	const customModel = useStore((s) => s.customModel);
	const setCustomModel = useStore((s) => s.setCustomModel);
	const clearProject = useStore((s) => s.clearProject);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Dialog, {
		open,
		onOpenChange: setOpen,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(DialogContent, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogHeader, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(DialogTitle, { children: t("settings.title") }) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "space-y-5",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "space-y-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t("settings.language") }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: t("settings.languageHint")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "grid grid-cols-2 gap-2",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setLanguage("fa"),
								className: cn("h-11 rounded-lg border text-sm font-medium transition-colors duration-150", language === "fa" ? "border-foreground bg-foreground text-background" : "border-border bg-background hover:bg-accent"),
								children: t("settings.persian")
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setLanguage("en"),
								className: cn("h-11 rounded-lg border text-sm font-medium transition-colors duration-150", language === "en" ? "border-foreground bg-foreground text-background" : "border-border bg-background hover:bg-accent"),
								children: t("settings.english")
							})]
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "space-y-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t("settings.theme") }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: t("settings.themeHint")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "grid grid-cols-3 gap-2",
							children: THEMES.map((mode) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
								type: "button",
								onClick: () => setTheme(mode),
								className: cn("h-11 rounded-lg border text-sm font-medium transition-colors duration-150", theme === mode ? "border-foreground bg-foreground text-background" : "border-border bg-background hover:bg-accent"),
								children: t(mode === "light" ? "settings.themeLight" : mode === "dark" ? "settings.themeDark" : "settings.themeSystem")
							}, mode))
						})
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "space-y-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Label, { children: t("settings.model") }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "text-xs text-muted-foreground",
							children: t("settings.modelHint")
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Select, {
							value: modelId,
							onValueChange: setModelId,
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectTrigger, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectValue, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectContent, { children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectGroup, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectLabel, { children: t("model.latest") }), MODEL_OPTIONS.filter((m) => m.group === "latest").map((model) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectItem, {
									value: model.id,
									children: [t(model.labelKey), model.hintKey ? ` — ${t(model.hintKey)}` : ""]
								}, model.id))] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(SelectGroup, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectLabel, { children: t("model.fallback") }), MODEL_OPTIONS.filter((m) => m.group === "fallback").map((model) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: model.id,
									children: t(model.labelKey)
								}, model.id))] }),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectGroup, { children: MODEL_OPTIONS.filter((m) => m.group === "custom").map((model) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)(SelectItem, {
									value: model.id,
									children: t(model.labelKey)
								}, model.id)) })
							] })]
						}),
						modelId === "custom" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Input, {
							value: customModel,
							onChange: (event) => setCustomModel(event.target.value),
							placeholder: t("settings.customPlaceholder"),
							className: "font-mono",
							spellCheck: false
						}) : null
					]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-sm font-medium",
						children: t("settings.clearProject")
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "text-xs text-muted-foreground",
						children: t("settings.clearHint")
					})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
						type: "button",
						variant: "outline",
						onClick: () => {
							clearProject();
							setOpen(false);
						},
						children: t("settings.clearProject")
					})]
				})
			]
		})] })
	});
}
function Layout() {
	const { t } = useTranslation();
	const mobilePanel = useStore((s) => s.mobilePanel);
	const setMobilePanel = useStore((s) => s.setMobilePanel);
	const setSettingsOpen = useStore((s) => s.setSettingsOpen);
	const setApiKeyModalOpen = useStore((s) => s.setApiKeyModalOpen);
	const modelId = useStore((s) => s.modelId);
	const isBuilding = useStore((s) => s.isBuilding);
	const theme = useStore((s) => s.theme);
	const modelLabel = MODEL_OPTIONS.find((m) => m.id === modelId);
	const apiKeyModalOpen = useStore((s) => s.apiKeyModalOpen);
	const [keyed, setKeyed] = (0, import_react.useState)(false);
	(0, import_react.useEffect)(() => {
		setKeyed(hasKeys());
	}, [apiKeyModalOpen]);
	(0, import_react.useEffect)(() => {
		applyTheme(theme);
		const media = window.matchMedia("(prefers-color-scheme: dark)");
		const onChange = () => applyTheme(useStore.getState().theme);
		media.addEventListener("change", onChange);
		return () => media.removeEventListener("change", onChange);
	}, [theme]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "flex h-dvh flex-col overflow-hidden bg-background text-foreground",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "flex h-14 shrink-0 items-center gap-3 border-b border-border px-3 lg:px-4",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mark, {}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "min-w-0",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "truncate text-sm font-semibold tracking-tight",
							children: t("app.name")
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "hidden truncate text-xs text-muted-foreground sm:block",
							children: t("app.shortTagline")
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "ms-auto flex items-center gap-2",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "hidden max-w-48 truncate rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground sm:inline",
								children: modelLabel ? t(modelLabel.labelKey) : t("model.custom")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: cn("hidden rounded-full px-2.5 py-1 text-[11px] font-medium sm:inline", isBuilding ? "bg-secondary text-foreground" : "text-muted-foreground"),
								children: isBuilding ? t("status.building") : t("status.ready")
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								size: "icon",
								variant: "ghost",
								onClick: () => setApiKeyModalOpen(true),
								"aria-label": t("apiKey.open"),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(KeyRound, { className: cn("size-4", keyed ? "text-foreground" : "text-muted-foreground") })
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Button, {
								type: "button",
								size: "icon",
								variant: "ghost",
								onClick: () => setSettingsOpen(true),
								"aria-label": t("settings.title"),
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Settings2, { className: "size-4" })
							})
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "hidden min-h-0 flex-1 lg:flex",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(qt, {
					orientation: "horizontal",
					className: "h-full w-full",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Qt, {
							defaultSize: 300,
							minSize: 240,
							maxSize: 420,
							className: "min-w-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatPanel, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(nn, { className: "panel-handle" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Qt, {
							minSize: 280,
							className: "min-w-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditorPanel, {})
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(nn, { className: "panel-handle" }),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Qt, {
							minSize: 280,
							className: "min-w-0",
							children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewPanel, {})
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex min-h-0 flex-1 flex-col lg:hidden",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "min-h-0 flex-1",
					children: [
						mobilePanel === "chat" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ChatPanel, {}) : null,
						mobilePanel === "editor" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(EditorPanel, {}) : null,
						mobilePanel === "preview" ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewPanel, {}) : null
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("nav", {
					className: "grid grid-cols-3 border-t border-border bg-card pb-[env(safe-area-inset-bottom)]",
					children: [
						"chat",
						"editor",
						"preview"
					].map((panel) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
						type: "button",
						onClick: () => setMobilePanel(panel),
						className: cn("h-12 text-sm font-medium", mobilePanel === panel ? "text-foreground" : "text-muted-foreground"),
						children: t(`nav.${panel}`)
					}, panel))
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(SettingsModal, {}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(ApiKeyModal, {})
		]
	});
}
function Mark() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		viewBox: "0 0 32 32",
		className: "size-8 shrink-0",
		"aria-hidden": "true",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
			width: "32",
			height: "32",
			rx: "8",
			className: "fill-foreground"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M9 23V9h6.4c3.3 0 5.4 1.9 5.4 4.7 0 1.9-1.1 3.4-2.8 4.1L22 23h-3.2l-3.5-5H12V23H9Zm3-8.2h3.1c1.6 0 2.6-.9 2.6-2.2S16.7 10.4 15.1 10.4H12v4.4Z",
			className: "fill-background"
		})]
	});
}
function App() {
	(0, import_react.useEffect)(() => {
		const language = useStore.getState().language || readStoredLanguage();
		const theme = useStore.getState().theme;
		applyLanguage(language);
		applyTheme(theme);
	}, []);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(I18nextProvider, {
		i18n: i18n_default,
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Layout, {})
	});
}
function Home() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(App, {});
}
//#endregion
export { Home as component };
