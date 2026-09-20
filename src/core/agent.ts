/**
 * Agent loop:
 * 1. Send the user prompt to Gemini with tools.
 * 2. If the model calls a tool, execute it and append the result.
 * 3. Repeat until a final text response or 15 iterations.
 */

import type { Content } from "@google/generative-ai";
import { generateTurn, modelFunctionParts, toolResponseParts } from "./gemini";
import { withKeyRotation } from "./keyManager";
import { resolveModel } from "./models";
import { executeTool } from "./tools";

export const MAX_ITERATIONS = 15;

export type AgentEvent =
  | { type: "iteration"; index: number }
  | { type: "tool"; name: string; path?: string; ok: boolean; output: string }
  | { type: "text"; text: string }
  | { type: "complete"; text: string }
  | { type: "error"; message: string };

export type RunAgentInput = {
  prompt: string;
  modelId: string;
  customModel: string;
  signal?: AbortSignal;
  onEvent: (event: AgentEvent) => void;
};

function stripComplete(text: string): string {
  return text.replace(/\bBUILD_COMPLETE\b/g, "").trim();
}

export async function runAgent(input: RunAgentInput): Promise<void> {
  const resolved = resolveModel(input.modelId, input.customModel);
  if (!resolved.apiId) {
    input.onEvent({ type: "error", message: "Enter a custom model name." });
    return;
  }

  const contents: Content[] = [{ role: "user", parts: [{ text: input.prompt }] }];

  try {
    for (let index = 1; index <= MAX_ITERATIONS; index += 1) {
      if (input.signal?.aborted) {
        input.onEvent({ type: "error", message: "Stopped." });
        return;
      }
      input.onEvent({ type: "iteration", index });

      const turn = await withKeyRotation((apiKey) =>
        generateTurn({
          apiKey,
          model: resolved.apiId,
          contents,
          thinking: resolved.thinking,
          signal: input.signal,
        }),
      );

      if (turn.functionCalls.length > 0) {
        contents.push({
          role: "model",
          parts: modelFunctionParts(turn.functionCalls),
        });

        const executed = [];
        for (const call of turn.functionCalls) {
          const args = (call.args ?? {}) as Record<string, unknown>;
          const result = await executeTool(call.name, args);
          input.onEvent({
            type: "tool",
            name: result.name,
            path: result.path,
            ok: result.ok,
            output: result.output,
          });
          executed.push({
            name: call.name,
            response: { ok: result.ok, output: result.output },
          });
        }

        contents.push({
          role: "user",
          parts: toolResponseParts(executed),
        });
        continue;
      }

      const text = turn.text || "";
      const cleaned = stripComplete(text);
      const done =
        /BUILD_COMPLETE/i.test(text) || cleaned.length > 0 || index === MAX_ITERATIONS;
      if (done) {
        input.onEvent({
          type: "complete",
          text: cleaned || "BUILD_COMPLETE",
        });
        return;
      }
    }

    input.onEvent({
      type: "error",
      message: `Stopped after ${MAX_ITERATIONS} tool iterations.`,
    });
  } catch (error) {
    if (input.signal?.aborted) {
      input.onEvent({ type: "error", message: "Stopped." });
      return;
    }
    const message = error instanceof Error ? error.message : String(error);
    input.onEvent({ type: "error", message });
  }
}
