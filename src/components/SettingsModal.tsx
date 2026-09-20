import { useTranslation } from "react-i18next";
import { MODEL_OPTIONS } from "@/core/models";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useStore, type ThemeMode } from "@/store/useStore";
import { cn } from "@/lib/utils";

const THEMES: ThemeMode[] = ["light", "dark", "system"];

export function SettingsModal() {
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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("settings.title")}</DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          <section className="space-y-2">
            <Label>{t("settings.language")}</Label>
            <p className="text-xs text-muted-foreground">{t("settings.languageHint")}</p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setLanguage("fa")}
                className={cn(
                  "h-11 rounded-lg border text-sm font-medium transition-colors duration-150",
                  language === "fa"
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background hover:bg-accent",
                )}
              >
                {t("settings.persian")}
              </button>
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={cn(
                  "h-11 rounded-lg border text-sm font-medium transition-colors duration-150",
                  language === "en"
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background hover:bg-accent",
                )}
              >
                {t("settings.english")}
              </button>
            </div>
          </section>

          <section className="space-y-2">
            <Label>{t("settings.theme")}</Label>
            <p className="text-xs text-muted-foreground">{t("settings.themeHint")}</p>
            <div className="grid grid-cols-3 gap-2">
              {THEMES.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setTheme(mode)}
                  className={cn(
                    "h-11 rounded-lg border text-sm font-medium transition-colors duration-150",
                    theme === mode
                      ? "border-foreground bg-foreground text-background"
                      : "border-border bg-background hover:bg-accent",
                  )}
                >
                  {t(
                    mode === "light"
                      ? "settings.themeLight"
                      : mode === "dark"
                        ? "settings.themeDark"
                        : "settings.themeSystem",
                  )}
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-2">
            <Label>{t("settings.model")}</Label>
            <p className="text-xs text-muted-foreground">{t("settings.modelHint")}</p>
            <Select value={modelId} onValueChange={setModelId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>{t("model.latest")}</SelectLabel>
                  {MODEL_OPTIONS.filter((m) => m.group === "latest").map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {t(model.labelKey)}
                      {model.hintKey ? ` — ${t(model.hintKey)}` : ""}
                    </SelectItem>
                  ))}
                </SelectGroup>
                <SelectGroup>
                  <SelectLabel>{t("model.fallback")}</SelectLabel>
                  {MODEL_OPTIONS.filter((m) => m.group === "fallback").map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {t(model.labelKey)}
                    </SelectItem>
                  ))}
                </SelectGroup>
                <SelectGroup>
                  {MODEL_OPTIONS.filter((m) => m.group === "custom").map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      {t(model.labelKey)}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            {modelId === "custom" ? (
              <Input
                value={customModel}
                onChange={(event) => setCustomModel(event.target.value)}
                placeholder={t("settings.customPlaceholder")}
                className="font-mono"
                spellCheck={false}
              />
            ) : null}
          </section>

          <section className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-3">
            <div>
              <p className="text-sm font-medium">{t("settings.clearProject")}</p>
              <p className="text-xs text-muted-foreground">{t("settings.clearHint")}</p>
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                clearProject();
                setOpen(false);
              }}
            >
              {t("settings.clearProject")}
            </Button>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  );
}
