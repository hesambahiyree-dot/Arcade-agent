import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Group, Panel, Separator as ResizeSeparator } from "react-resizable-panels";
import { KeyRound, Plus, Settings2 } from "lucide-react";
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
  const clearProject = useStore((s) => s.clearProject);
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

  function newProject() {
    if (isBuilding) return;
    clearProject();
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background text-foreground">
      <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border px-3 lg:px-4">
        <img
          src="/favicon.svg"
          alt="ArcadeAgent"
          className="size-8 shrink-0 rounded-[9px]"
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold tracking-tight">
            {t("app.name")}
          </p>
          <p className="hidden truncate text-xs text-muted-foreground sm:block">
            {t("app.shortTagline")}
          </p>
        </div>
        <div className="ms-auto flex items-center gap-1.5">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={newProject}
            disabled={isBuilding}
            className="gap-1.5"
            aria-label={t("project.new", "New project")}
          >
            <Plus className="size-3.5" />
            <span className="hidden sm:inline">{t("project.new", "New project")}</span>
          </Button>
          <span className="hidden max-w-48 truncate rounded-full border border-border px-2.5 py-1 text-[11px] text-muted-foreground md:inline">
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
