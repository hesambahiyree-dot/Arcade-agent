import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Play } from "lucide-react";
import { buildPreviewHtml } from "@/core/preview";
import { Button } from "@/components/ui/button";
import { useStore } from "@/store/useStore";

export function PreviewPanel() {
  const { t } = useTranslation();
  const files = useStore((s) => s.files);
  const previewNonce = useStore((s) => s.previewNonce);
  const bumpPreview = useStore((s) => s.bumpPreview);
  const hasHtml = Boolean(files["index.html"] || files["index.htm"]);

  const srcDoc = useMemo(
    () => (hasHtml ? buildPreviewHtml(files) : ""),
    [files, hasHtml, previewNonce],
  );

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col bg-background">
      <header className="flex h-12 items-center justify-between border-b border-border px-3">
        <h2 className="text-sm font-medium">{t("preview.title")}</h2>
        <Button type="button" size="sm" variant="outline" onClick={bumpPreview}>
          <Play className="size-3.5" />
          {t("preview.run")}
        </Button>
      </header>
      <div className="min-h-0 flex-1 bg-card">
        {hasHtml ? (
          <iframe
            key={previewNonce}
            title={t("preview.title")}
            className="h-full w-full border-0 bg-background"
            sandbox="allow-scripts allow-forms allow-modals allow-pointer-lock"
            srcDoc={srcDoc}
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 px-6 text-center">
            <p className="text-sm font-medium">{t("preview.empty")}</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              {t("preview.emptyHint")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
