import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Group, Panel, Separator as ResizeSeparator } from "react-resizable-panels";
import { KeyRound, Settings2 } from "lucide-react";
import { ChatPanel } from "@/components/ChatPanel";
import { EditorPanel } from "@/components/EditorPanel";
import { PreviewPanel } from "@/components/PreviewPanel";
import { ApiKeyModal } from "@/components/ApiKeyModal";
import { SettingsModal } from "@/components/SettingsModal";
import { Button } from "@/components/ui/button";
import { MODEL_OPTIONS } from "@/core/models";
import { hasKeys } from "@/core/keyManager";
import { useStore, applyTheme } from "@/store/useStore";
import { cn } from "@/lib/utils";

export function Layout() {
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
  const [keyed, setKeyed] = useState(false);

  useEffect(() => {
    setKeyed(hasKeys());
  }, [apiKeyModalOpen]);

  useEffect(() => {
    applyTheme(theme);
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => applyTheme(useStore.getState().theme);
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [theme]);

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-3 lg:px-4">
        <Mark />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight">
            {t("app.name")}
          </p>
          <p className="hidden truncate text-xs text-muted-foreground sm:block">
            {t("app.shortTagline")}
          </p>
        </div>
        <div className="ms-auto flex items-center gap-2">
          <span className="hidden max-w-48 truncate rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground sm:inline">
            {modelLabel ? t(modelLabel.labelKey) : t("model.custom")}
          </span>
          <span
            className={cn(
              "hidden rounded-full px-2.5 py-1 text-[11px] font-medium sm:inline",
              isBuilding
                ? "bg-secondary text-foreground"
                : "text-muted-foreground",
            )}
          >
            {isBuilding ? t("status.building") : t("status.ready")}
          </span>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => setApiKeyModalOpen(true)}
            aria-label={t("apiKey.open")}
          >
            <KeyRound className={cn("size-4", keyed ? "text-foreground" : "text-muted-foreground")} />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            onClick={() => setSettingsOpen(true)}
            aria-label={t("settings.title")}
          >
            <Settings2 className="size-4" />
          </Button>
        </div>
      </header>

      <div className="hidden min-h-0 flex-1 lg:flex">
        <Group orientation="horizontal" className="h-full w-full">
          <Panel defaultSize={300} minSize={240} maxSize={420} className="min-w-0">
            <ChatPanel />
          </Panel>
          <ResizeSeparator className="panel-handle" />
          <Panel minSize={280} className="min-w-0">
            <EditorPanel />
          </Panel>
          <ResizeSeparator className="panel-handle" />
          <Panel minSize={280} className="min-w-0">
            <PreviewPanel />
          </Panel>
        </Group>
      </div>

      <div className="flex min-h-0 flex-1 flex-col lg:hidden">
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
          {mobilePanel === "chat" ? <ChatPanel /> : null}
          {mobilePanel === "editor" ? <EditorPanel /> : null}
          {mobilePanel === "preview" ? <PreviewPanel /> : null}
        </div>
        <nav className="grid grid-cols-3 border-t border-border bg-card pb-[env(safe-area-inset-bottom)]">
          {(["chat", "editor", "preview"] as const).map((panel) => (
            <button
              key={panel}
              type="button"
              onClick={() => setMobilePanel(panel)}
              className={cn(
                "h-12 text-sm font-medium",
                mobilePanel === panel
                  ? "text-foreground"
                  : "text-muted-foreground",
              )}
            >
              {t(`nav.${panel}`)}
            </button>
          ))}
        </nav>
      </div>

      <SettingsModal />
      <ApiKeyModal />
    </div>
  );
}

function Mark() {
  return (
    <svg viewBox="0 0 32 32" className="size-8 shrink-0" aria-hidden="true">
      <rect width="32" height="32" rx="8" className="fill-foreground" />
      <path
        d="M9 23V9h6.4c3.3 0 5.4 1.9 5.4 4.7 0 1.9-1.1 3.4-2.8 4.1L22 23h-3.2l-3.5-5H12V23H9Zm3-8.2h3.1c1.6 0 2.6-.9 2.6-2.2S16.7 10.4 15.1 10.4H12v4.4Z"
        className="fill-background"
      />
    </svg>
  );
}
