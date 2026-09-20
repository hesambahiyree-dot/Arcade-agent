import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { languageFromPath } from "@/core/preview";
import { Button } from "@/components/ui/button";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";

type MonacoEditor = typeof import("@monaco-editor/react").default;

export function EditorPanel() {
  const { t } = useTranslation();
  const files = useStore((s) => s.files);
  const activeFile = useStore((s) => s.activeFile);
  const setActiveFile = useStore((s) => s.setActiveFile);
  const updateFileContent = useStore((s) => s.updateFileContent);
  const loadSample = useStore((s) => s.loadSample);
  const addMessage = useStore((s) => s.addMessage);
  const theme = useStore((s) => s.theme);
  const paths = Object.keys(files).sort();
  const [Editor, setEditor] = useState<MonacoEditor | null>(null);
  const [dark, setDark] = useState(true);

  useEffect(() => {
    let cancelled = false;
    void import("@monaco-editor/react").then((mod) => {
      if (!cancelled) setEditor(() => mod.default);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const sync = () => {
      setDark(theme === "dark" || (theme === "system" && media.matches));
    };
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, [theme]);

  const content = activeFile ? (files[activeFile] ?? "") : "";

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col bg-background" dir="ltr">
      <header className="flex h-12 items-center gap-2 overflow-x-auto border-b border-border px-2">
        {paths.length === 0 ? (
          <span className="px-2 text-sm text-muted-foreground">{t("editor.title")}</span>
        ) : (
          paths.map((path) => (
            <button
              key={path}
              type="button"
              onClick={() => setActiveFile(path)}
              className={cn(
                "h-8 shrink-0 rounded-md px-2.5 font-mono text-xs transition-colors duration-150",
                path === activeFile
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              {path}
            </button>
          ))
        )}
      </header>

      <div className="min-h-0 flex-1">
        {paths.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center">
            <p className="text-sm font-medium">{t("editor.empty")}</p>
            <p className="max-w-sm text-sm text-muted-foreground">{t("editor.emptyHint")}</p>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                loadSample();
                addMessage({ role: "status", content: t("sample.loaded") });
              }}
            >
              {t("editor.loadSample")}
            </Button>
          </div>
        ) : Editor ? (
          <Editor
            theme={dark ? "vs-dark" : "vs"}
            language={languageFromPath(activeFile ?? "")}
            value={content}
            path={activeFile ?? "untitled"}
            onChange={(value) => {
              if (activeFile) updateFileContent(activeFile, value ?? "");
            }}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: "IBM Plex Mono, ui-monospace, monospace",
              scrollBeyondLastLine: false,
              automaticLayout: true,
              wordWrap: "on",
              padding: { top: 12 },
              tabSize: 2,
            }}
          />
        ) : (
          <textarea
            className="h-full w-full resize-none bg-background p-4 font-mono text-sm text-foreground outline-none"
            value={content}
            onChange={(event) => {
              if (activeFile) updateFileContent(activeFile, event.target.value);
            }}
          />
        )}
      </div>
    </div>
  );
}
