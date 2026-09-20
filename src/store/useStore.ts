import { create } from "zustand";
import { persist } from "zustand/middleware";
import { clearFiles, replaceAll, snapshot, type FileMap } from "@/core/fs";
import { SAMPLE_ACTIVE, SAMPLE_FILES } from "@/core/sampleProject";
import { DEFAULT_MODEL_ID } from "@/core/models";
import i18n, {
  LANG_STORAGE_KEY,
  languageDir,
  type AppLanguage,
} from "@/i18n";

export type ThemeMode = "light" | "dark" | "system";
export type MobilePanel = "chat" | "editor" | "preview";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "tool" | "status";
  content: string;
  toolName?: string;
  toolOk?: boolean;
  createdAt: number;
};

export type AppState = {
  messages: ChatMessage[];
  files: FileMap;
  activeFile: string | null;
  previewNonce: number;
  isBuilding: boolean;
  iteration: number;
  theme: ThemeMode;
  language: AppLanguage;
  modelId: string;
  customModel: string;
  mobilePanel: MobilePanel;
  settingsOpen: boolean;
  apiKeyModalOpen: boolean;
  addMessage: (message: Omit<ChatMessage, "id" | "createdAt">) => void;
  setFiles: (files: FileMap) => void;
  refreshFiles: () => void;
  setActiveFile: (path: string | null) => void;
  updateFileContent: (path: string, content: string) => void;
  bumpPreview: () => void;
  setBuilding: (value: boolean) => void;
  setIteration: (value: number) => void;
  setTheme: (theme: ThemeMode) => void;
  setLanguage: (language: AppLanguage) => void;
  setModelId: (id: string) => void;
  setCustomModel: (value: string) => void;
  setMobilePanel: (panel: MobilePanel) => void;
  setSettingsOpen: (open: boolean) => void;
  setApiKeyModalOpen: (open: boolean) => void;
  loadSample: () => void;
  clearProject: () => void;
};

export const THEME_STORAGE_KEY = "arcade-agent-theme";

export function applyTheme(theme: ThemeMode): void {
  if (typeof document === "undefined") return;
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const dark = theme === "dark" || (theme === "system" && prefersDark);
  document.documentElement.classList.toggle("dark", dark);
}

export function applyLanguage(language: AppLanguage): void {
  if (typeof document === "undefined") return;
  document.documentElement.lang = language;
  document.documentElement.dir = languageDir(language);
  void i18n.changeLanguage(language);
  window.localStorage.setItem(LANG_STORAGE_KEY, language);
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
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

      addMessage: (message) =>
        set((state) => ({
          messages: [
            ...state.messages,
            {
              ...message,
              id: crypto.randomUUID(),
              createdAt: Date.now(),
            },
          ].slice(-120),
        })),

      setFiles: (files) => {
        replaceAll(files);
        const paths = Object.keys(files);
        set({
          files: { ...files },
          activeFile:
            get().activeFile && files[get().activeFile as string]
              ? get().activeFile
              : (files["index.html"] !== undefined
                  ? "index.html"
                  : (paths[0] ?? null)),
        });
      },

      refreshFiles: () => {
        const files = snapshot();
        const paths = Object.keys(files);
        set({
          files,
          activeFile:
            get().activeFile && files[get().activeFile as string]
              ? get().activeFile
              : (files["index.html"] !== undefined
                  ? "index.html"
                  : (paths[0] ?? null)),
        });
      },

      setActiveFile: (path) => set({ activeFile: path }),

      updateFileContent: (path, content) => {
        const files = { ...get().files, [path]: content };
        replaceAll(files);
        set({ files });
      },

      bumpPreview: () => set({ previewNonce: get().previewNonce + 1 }),

      setBuilding: (value) => set({ isBuilding: value, iteration: value ? 1 : 0 }),

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
          mobilePanel: "preview",
        }));
      },

      clearProject: () => {
        clearFiles();
        set({
          messages: [],
          files: {},
          activeFile: null,
          previewNonce: get().previewNonce + 1,
          iteration: 0,
        });
      },
    }),
    {
      name: "arcade-agent-state",
      partialize: (state) => ({
        messages: state.messages,
        files: state.files,
        activeFile: state.activeFile,
        theme: state.theme,
        language: state.language,
        modelId: state.modelId,
        customModel: state.customModel,
      }),
      onRehydrateStorage: () => (state) => {
        if (!state) return;
        if (state.files) replaceAll(state.files);
        applyTheme(state.theme);
        applyLanguage(state.language);
      },
    },
  ),
);
