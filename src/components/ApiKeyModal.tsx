import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { KeyRound, Trash2 } from "lucide-react";
import {
  addKey,
  listKeys,
  removeKey,
  type StoredKey,
} from "@/core/keyManager";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useStore } from "@/store/useStore";

export function ApiKeyModal() {
  const { t } = useTranslation();
  const open = useStore((s) => s.apiKeyModalOpen);
  const setOpen = useStore((s) => s.setApiKeyModalOpen);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [keys, setKeys] = useState<StoredKey[]>(() =>
    typeof window === "undefined" ? [] : listKeys(),
  );

  const refresh = () => setKeys(listKeys());

  const usable = useMemo(
    () => keys.filter((key) => !key.disabled),
    [keys],
  );

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

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("apiKey.title")}</DialogTitle>
          <DialogDescription>{t("apiKey.description")}</DialogDescription>
        </DialogHeader>

        <div className="flex gap-2">
          <Input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            placeholder={t("apiKey.placeholder")}
            autoComplete="off"
            spellCheck={false}
            onKeyDown={(event) => {
              if (event.key === "Enter") onSave();
            }}
          />
          <Button type="button" onClick={onSave}>
            {t("apiKey.save")}
          </Button>
        </div>
        {error ? (
          <p className="mt-2 text-sm text-destructive">{error}</p>
        ) : null}

        <ul className="mt-4 space-y-2">
          {keys.length === 0 ? (
            <li className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-sm text-muted-foreground">
              {t("apiKey.empty")}
            </li>
          ) : (
            keys.map((key, index) => (
              <li
                key={key.id}
                className="flex items-center gap-3 rounded-lg border border-border bg-secondary/40 px-3 py-2"
              >
                <KeyRound className="size-4 text-muted-foreground" />
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-sm tracking-wide">
                    ••••{key.hint}
                    {index === 0 && !key.disabled ? (
                      <span className="ms-2 text-[11px] font-sans tracking-normal text-muted-foreground">
                        {t("apiKey.active")}
                      </span>
                    ) : null}
                  </p>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {t("apiKey.usage", { count: key.usageCount })}
                  </p>
                </div>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    removeKey(key.id);
                    refresh();
                  }}
                  aria-label={t("apiKey.remove")}
                >
                  <Trash2 className="size-4" />
                </Button>
              </li>
            ))
          )}
        </ul>
        {usable.length === 0 && keys.length > 0 ? (
          <p className="mt-3 text-sm text-destructive">{t("apiKey.missing")}</p>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
