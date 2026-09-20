/**
 * Gemini client. Uses @google/generative-ai for function calling,
 * with a REST fallback for thinking-config / newer model ids.
 */

import {
  GoogleGenerativeAI,
  GoogleGenerativeAIFetchError,
  type Content,
  type FunctionCall,
  type GenerateContentResult,
  type Part,
} from "@google/generative-ai";
import { SYSTEM_INSTRUCTION, TOOL_DECLARATIONS } from "./tools";

export type GeminiTurn = {
  text: string;
  functionCalls: FunctionCall[];
};

export type GenerateTurnInput = {
  apiKey: string;
  model: string;
  contents: Content[];
  thinking?: boolean;
  signal?: AbortSignal;
};

const REST_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

function toTurn(result: GenerateContentResult): GeminiTurn {
  const calls = result.response.functionCalls() ?? [];
  let text = "";
  try {
    text = result.response.text() ?? "";
  } catch {
    text = "";
  }
  return { text, functionCalls: calls };
}

export async function generateTurn(input: GenerateTurnInput): Promise<GeminiTurn> {
  if (input.thinking) {
    return generateTurnRest(input);
  }
  try {
    return await generateTurnSdk(input);
  } catch (error) {
    if (shouldFallbackToRest(error)) {
      return generateTurnRest(input);
    }
    throw error;
  }
}

async function generateTurnSdk(input: GenerateTurnInput): Promise<GeminiTurn> {
  const client = new GoogleGenerativeAI(input.apiKey);
  const model = client.getGenerativeModel({
    model: input.model,
    systemInstruction: SYSTEM_INSTRUCTION,
    tools: [{ functionDeclarations: TOOL_DECLARATIONS }],
  });
  const result = await model.generateContent({ contents: input.contents }, {
    signal: input.signal,
  });
  return toTurn(result);
}

function shouldFallbackToRest(error: unknown): boolean {
  if (error instanceof GoogleGenerativeAIFetchError) {
    return error.status === 404 || error.status === 400;
  }
  const message = error instanceof Error ? error.message : "";
  return /not found|unknown model|thinking/i.test(message);
}

type RestPart = {
  text?: string;
  functionCall?: { name: string; args?: Record<string, unknown> };
  functionResponse?: { name: string; response: unknown };
};

async function generateTurnRest(input: GenerateTurnInput): Promise<GeminiTurn> {
  const url = `${REST_BASE}/${encodeURIComponent(input.model)}:generateContent?key=${encodeURIComponent(input.apiKey)}`;
  const body = {
    systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
    tools: [{ functionDeclarations: TOOL_DECLARATIONS }],
    contents: input.contents,
    generationConfig: input.thinking
      ? { thinkingConfig: { thinkingBudget: 24576 } }
      : undefined,
  };

  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal: input.signal,
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    const error = new GoogleGenerativeAIFetchError(
      `Gemini HTTP ${response.status}: ${detail.slice(0, 280)}`,
      response.status,
      response.statusText,
    );
    throw error;
  }

  const json = (await response.json()) as {
    candidates?: Array<{
      content?: { parts?: RestPart[] };
    }>;
  };
  const parts = json.candidates?.[0]?.content?.parts ?? [];
  const functionCalls: FunctionCall[] = [];
  const texts: string[] = [];
  for (const part of parts) {
    if (part.functionCall?.name) {
      functionCalls.push({
        name: part.functionCall.name,
        args: part.functionCall.args ?? {},
      });
    }
    if (part.text) texts.push(part.text);
  }
  return { text: texts.join("\n"), functionCalls };
}

export function modelFunctionParts(calls: FunctionCall[]): Part[] {
  return calls.map((call) => ({
    functionCall: { name: call.name, args: call.args },
  }));
}

export function toolResponseParts(
  results: Array<{ name: string; response: unknown }>,
): Part[] {
  return results.map((result) => ({
    functionResponse: {
      name: result.name,
      response: result.response as object,
    },
  }));
}

export type { Content };
