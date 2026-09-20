import type { FileMap } from "./fs";

function lookup(files: FileMap, href: string): string | undefined {
  const cleaned = href.split("?")[0]?.split("#")[0] ?? href;
  const candidates = [
    cleaned,
    cleaned.replace(/^\.\//, ""),
    cleaned.replace(/^\//, ""),
  ];
  for (const candidate of candidates) {
    if (files[candidate] !== undefined) return files[candidate];
  }
  return undefined;
}

/** Inline relative CSS/JS so the iframe srcdoc can run a multi-file project. */
export function buildPreviewHtml(files: FileMap): string {
  const html =
    files["index.html"] ??
    files["index.htm"] ??
    Object.entries(files).find(([path]) => path.endsWith(".html"))?.[1];

  if (!html) {
    return `<!doctype html><html><body style="font-family:system-ui;padding:24px;color:#8b8d93;background:#0b0c0e">No index.html</body></html>`;
  }

  let next = html.replace(
    /<link\b[^>]*href=["']([^"']+)["'][^>]*>/gi,
    (full, href: string) => {
      if (/^https?:|^data:|^\/\//i.test(href)) return full;
      const css = lookup(files, href);
      return css !== undefined ? `<style>\n${css}\n</style>` : full;
    },
  );

  next = next.replace(
    /<script\b([^>]*)\bsrc=["']([^"']+)["']([^>]*)>\s*<\/script>/gi,
    (full, before: string, src: string, after: string) => {
      if (/^https?:|^data:|^\/\//i.test(src)) return full;
      const js = lookup(files, src);
      if (js === undefined) return full;
      const rest = `${before}${after}`.replace(/\s+/g, " ").trim();
      return `<script ${rest}>\n${js}\n<\/script>`;
    },
  );

  return next;
}

export function languageFromPath(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "html":
    case "htm":
      return "html";
    case "css":
      return "css";
    case "js":
    case "mjs":
    case "cjs":
      return "javascript";
    case "ts":
      return "typescript";
    case "json":
      return "json";
    case "md":
      return "markdown";
    case "svg":
      return "xml";
    default:
      return "plaintext";
  }
}
