import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ArrowUp, Square } from "lucide-react";
import { runAgent } from "@/core/agent";
import { hasKeys } from "@/core/keyManager";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useStore } from "@/store/useStore";
import { cn } from "@/lib/utils";

const EXAMPLE_KEYS = [
  "examples.snake",
  "examples.todo",
  "examples.calculator",
  "examples.platformer",
] as const;

export function ChatPanel() {
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
  const [prompt, setPrompt] = useState("");
  const abortRef = useRef<AbortController | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages, isBuilding]);

  async function startBuild(text: string) {
    const trimmed = text.trim();
    if (!trimmed || isBuilding) return;
    if (!hasKeys()) {
      setApiKeyModalOpen(true);
      addMessage({ role: "status", content: t("chat.needKey") });
      return;
    }
    setPrompt("");
    addMessage({ role: "user", content: trimmed });
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
            toolOk: event.ok,
          });
          refreshFiles();
        }
        if (event.type === "complete") {
          addMessage({
            role: "assistant",
            content: event.text || t("chat.buildComplete"),
          });
          refreshFiles();
          bumpPreview();
        }
        if (event.type === "error") {
          addMessage({ role: "status", content: event.message });
        }
      },
    });
    abortRef.current = null;
    setBuilding(false);
  }

  function stop() {
    abortRef.current?.abort();
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col bg-sidebar">
      <header className="flex h-12 items-center justify-between border-b border-border px-4">
        <h2 className="text-sm font-medium">{t("chat.title")}</h2>
        {isBuilding ? (
          <span className="text-[11px] text-muted-foreground tabular-nums">
            {t("chat.iteration", { current: iteration, max: 15 })}
          </span>
        ) : null}
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto">
        <div className="space-y-3 p-4">
          {messages.length === 0 ? (
            <EmptyState
              onPick={(value) => {
                setPrompt(value);
              }}
            />
          ) : (
            messages.map((message) => (
              <article
                key={message.id}
                className={cn(
                  "rounded-lg px-3 py-2 text-sm",
                  message.role === "user" && "bg-foreground text-background",
                  message.role === "assistant" && "bg-card border border-border",
                  message.role === "tool" && "border border-border bg-transparent font-mono text-xs text-muted-foreground",
                  message.role === "status" && "text-destructive",
                )}
              >
                {message.role === "tool" ? (
                  <p>
                    <span className="font-medium text-foreground">
                      {message.toolName}
                    </span>
                    {message.content ? ` · ${message.content}` : null}
                  </p>
                ) : (
                  <p className="whitespace-pre-wrap">{message.content}</p>
                )}
              </article>
            ))
          )}
          {isBuilding ? (
            <p className="shimmer text-sm font-medium">{t("chat.thinking")}</p>
          ) : null}
          <div ref={endRef} />
        </div>
      </div>

      <form
        className="border-t border-border p-3"
        onSubmit={(event) => {
          event.preventDefault();
          void startBuild(prompt);
        }}
      >
        <Textarea
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          placeholder={t("chat.placeholder")}
          className="min-h-24 bg-background"
          onKeyDown={(event) => {
            if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
              event.preventDefault();
              void startBuild(prompt);
            }
          }}
        />
        <div className="mt-2 flex justify-end">
          {isBuilding ? (
            <Button type="button" variant="outline" onClick={stop}>
              <Square className="size-3.5" />
              {t("chat.stop")}
            </Button>
          ) : (
            <Button type="submit" disabled={!prompt.trim()}>
              <ArrowUp className="size-4" />
              {t("chat.build")}
            </Button>
          )}
        </div>
      </form>
    </div>
  );
}

function EmptyState({ onPick }: { onPick: (value: string) => void }) {
  const { t } = useTranslation();
  return (
    <div className="space-y-4 pt-4">
      <div>
        <h3 className="text-lg font-semibold tracking-tight">
          {t("chat.emptyTitle")}
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">{t("chat.emptyBody")}</p>
      </div>
      <div>
        <p className="mb-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
          {t("examples.title")}
        </p>
        <div className="space-y-2">
          {EXAMPLE_KEYS.map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => onPick(t(key))}
              className="w-full rounded-lg border border-border bg-card px-3 py-2.5 text-start text-sm text-foreground transition-colors duration-150 hover:bg-accent"
            >
              {t(key)}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
