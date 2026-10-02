/**
 * Agent tools: create / read / list / edit files in the virtual project.
 */

import { SchemaType, type FunctionDeclaration } from "@google/generative-ai";
import * as fs from "./fs";

export const SYSTEM_INSTRUCTION =
  "You are an expert web game developer agent. Build the user's requested project as a complete, working web app using HTML, CSS, and JavaScript. The workspace starts empty for every new project. Do not assume or rely on demo/sample files. Prefer ONE create_files call containing all initial files needed for the project, then use read_file/edit_file only when necessary. Always create a complete index.html with the actual playable UI and working game logic, not just a title or placeholder. Keep the number of tool round trips as low as possible. Use relative local file references so the built-in preview can run the project. When done, respond with 'BUILD_COMPLETE'.";

export const TOOL_DECLARATIONS: FunctionDeclaration[] = [
  {
    name: "create_files",
    description: "Create or overwrite several project files in one operation. Prefer this for the initial complete project to minimize round trips.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        files: {
          type: SchemaType.ARRAY,
          description: "Complete project files. Each item contains a project-relative path and its full content.",
          items: {
            type: SchemaType.OBJECT,
            properties: {
              path: { type: SchemaType.STRING, description: "Project-relative path, e.g. index.html" },
              content: { type: SchemaType.STRING, description: "Full file contents." },
            },
            required: ["path", "content"],
          },
        },
      },
      required: ["files"],
    },
  },
  {
    name: "create_file",
    description: "Create or overwrite a single file in the project.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        path: {
          type: SchemaType.STRING,
          description: "Project-relative path, e.g. index.html or css/style.css",
        },
        content: {
          type: SchemaType.STRING,
          description: "Full file contents.",
        },
      },
      required: ["path", "content"],
    },
  },
  {
    name: "read_file",
    description: "Read a file from the project.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        path: { type: SchemaType.STRING, description: "Project-relative path." },
      },
      required: ["path"],
    },
  },
  {
    name: "list_files",
    description: "List files in a directory. Use '.' for the project root.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        directory: {
          type: SchemaType.STRING,
          description: "Directory to list. '.' or '' for root.",
        },
      },
      required: ["directory"],
    },
  },
  {
    name: "edit_file",
    description: "Replace the first occurrence of oldContent with newContent.",
    parameters: {
      type: SchemaType.OBJECT,
      properties: {
        path: { type: SchemaType.STRING, description: "Project-relative path." },
        oldContent: {
          type: SchemaType.STRING,
          description: "Exact text to find.",
        },
        newContent: {
          type: SchemaType.STRING,
          description: "Replacement text.",
        },
      },
      required: ["path", "oldContent", "newContent"],
    },
  },
];

export type ToolName = "create_files" | "create_file" | "read_file" | "list_files" | "edit_file";

export type ToolResult = {
  ok: boolean;
  name: string;
  path?: string;
  output: string;
};

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

export async function executeTool(
  name: string,
  args: Record<string, unknown>,
): Promise<ToolResult> {
  try {
    switch (name as ToolName) {
      case "create_files": {
        const files = Array.isArray(args.files) ? args.files : [];
        if (!files.length) return { ok: false, name, output: "No files were provided." };
        const created: string[] = [];
        for (const entry of files) {
          if (!entry || typeof entry !== "object") continue;
          const item = entry as Record<string, unknown>;
          const path = asString(item.path);
          if (!path) continue;
          await fs.createFile(path, asString(item.content));
          created.push(path);
        }
        if (!created.length) return { ok: false, name, output: "No valid project files were provided." };
        return { ok: true, name, output: `Created ${created.length} files: ${created.join(", ")}` };
      }
      case "create_file": {
        const path = asString(args.path);
        await fs.createFile(path, asString(args.content));
        return { ok: true, name, path, output: `Created ${path}` };
      }
      case "read_file": {
        const path = asString(args.path);
        const content = await fs.readFile(path);
        return { ok: true, name, path, output: content };
      }
      case "list_files": {
        const directory = asString(args.directory, ".");
        const listed = await fs.listFiles(directory);
        return {
          ok: true,
          name,
          output: listed.length ? listed.join("\n") : "(empty)",
        };
      }
      case "edit_file": {
        const path = asString(args.path);
        const output = await fs.editFile(
          path,
          asString(args.oldContent),
          asString(args.newContent),
        );
        return { ok: true, name, path, output };
      }
      default:
        return { ok: false, name, output: `Unknown tool: ${name}` };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, name, output: message };
  }
}
