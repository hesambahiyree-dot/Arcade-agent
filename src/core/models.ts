/** Display + API mapping for the model picker. */

export type ModelOption = {
  id: string;
  /** Actual Gemini model id sent to the API. */
  apiId: string;
  labelKey: string;
  hintKey?: string;
  group: "latest" | "fallback" | "custom";
  thinking?: boolean;
};

export const MODEL_OPTIONS: ModelOption[] = [
  {
    id: "gemini-3.6-flash",
    apiId: "gemini-3.6-flash",
    labelKey: "model.flash36",
    hintKey: "model.flash36Hint",
    group: "latest",
  },
  {
    id: "gemini-3.5-flash-lite",
    apiId: "gemini-3.5-flash-lite",
    labelKey: "model.flashLite35",
    hintKey: "model.flashLite35Hint",
    group: "latest",
  },
  {
    id: "gemini-3.1-pro",
    apiId: "gemini-3.1-pro-preview",
    labelKey: "model.pro31",
    hintKey: "model.pro31Hint",
    group: "latest",
  },
  {
    id: "extended-thinking",
    apiId: "gemini-3.1-pro-preview",
    labelKey: "model.thinking",
    hintKey: "model.thinkingHint",
    group: "latest",
    thinking: true,
  },
  {
    id: "gemini-2.5-flash",
    apiId: "gemini-2.5-flash",
    labelKey: "model.fallbackFlash",
    hintKey: "model.fallback",
    group: "fallback",
  },
  {
    id: "gemini-2.5-pro",
    apiId: "gemini-2.5-pro",
    labelKey: "model.fallbackPro",
    hintKey: "model.fallback",
    group: "fallback",
  },
  {
    id: "custom",
    apiId: "",
    labelKey: "model.custom",
    group: "custom",
  },
];

export const DEFAULT_MODEL_ID = "gemini-3.6-flash";

export function resolveModel(modelId: string, customModel: string): {
  apiId: string;
  thinking: boolean;
} {
  if (modelId === "custom") {
    return { apiId: customModel.trim(), thinking: false };
  }
  const option = MODEL_OPTIONS.find((item) => item.id === modelId);
  return {
    apiId: option?.apiId ?? DEFAULT_MODEL_ID,
    thinking: Boolean(option?.thinking),
  };
}
