/**
 * @file src/lib/mcp/serverFactory.ts
 *
 * Factory for creating configured Model Context Protocol (MCP) Server instances.
 * Registers Tools, Prompts, Resources, and Autocompletions uniformly for both
 * the stdio transport and the remote Streamable HTTP gateway (/api/mcp).
 */

import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  CompleteRequestSchema,
  GetPromptRequestSchema,
  ListPromptsRequestSchema,
  ListResourceTemplatesRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
  ErrorCode,
  McpError,
  type GetPromptResult,
} from "@modelcontextprotocol/sdk/types.js";
import { getIngredientCatalog } from "@/lib/ingredients/ingredientCatalog";
import { LocalRecipeService } from "@/services/LocalRecipeService";
import { resolveCaller, type ResolvedCaller } from "./auth";
import {
  MCP_SERVER_VERSION,
  TOOL_DEFINITIONS,
  isToolName,
} from "./catalog";
import { PROMPT_DEFINITIONS, getPrompt } from "./prompts";
import {
  RESOURCE_DEFINITIONS,
  RESOURCE_TEMPLATES,
  readResource,
} from "./resources";
import { invokeTool, structuredToolContent } from "./tools";

export interface CreateServerOptions {
  sessionId?: string;
  defaultCaller?: ResolvedCaller;
  onInvocation?: (toolName: string, args: Record<string, unknown>) => void;
}

const COMMON_CUISINES = [
  "Italian",
  "Japanese",
  "Mexican",
  "Mediterranean",
  "French",
  "Indian",
  "Thai",
  "Levantine",
  "Chinese",
  "Korean",
  "Greek",
  "Spanish",
  "Vietnamese",
  "Middle Eastern",
];

const HISTORICAL_AGENTS = [
  "paracelsus",
  "culpeper",
  "avicenna",
  "hildegard",
  "nostradamus",
  "hermes_trismegistus",
];

const TECHNIQUE_SLUGS = [
  "dry-brining",
  "reverse-sear",
  "emulsification",
  "deglazing-pan-sauce",
  "blooming-spices",
  "velveting",
  "braising",
];

function registerToolHandlers(
  server: Server,
  options: CreateServerOptions,
  sessionId: string,
): void {
  server.setRequestHandler(ListToolsRequestSchema, () =>
    Promise.resolve({
      tools: TOOL_DEFINITIONS,
    }),
  );

  server.setRequestHandler(CallToolRequestSchema, async (request, extra) => {
    const { name, arguments: args } = request.params;
    if (!isToolName(name)) {
      throw new McpError(ErrorCode.InvalidParams, `Unknown tool: ${name}`);
    }

    const toolArgs = args ?? {};
    options.onInvocation?.(name, toolArgs);

    const result = await invokeTool(name, toolArgs, {
      signal: extra.signal,
      correlationId: `mcp:${sessionId}:${extra.requestId}`,
    });

    const payload = structuredToolContent(result);
    return {
      ...(result.ok ? {} : { isError: true }),
      structuredContent: payload,
      content: [
        { type: "text" as const, text: JSON.stringify(payload, null, 2) },
      ],
    };
  });
}

function registerPromptHandlers(server: Server): void {
  server.setRequestHandler(ListPromptsRequestSchema, () =>
    Promise.resolve({
      prompts: PROMPT_DEFINITIONS,
    }),
  );

  server.setRequestHandler(GetPromptRequestSchema, (request): Promise<GetPromptResult> => {
    const { name, arguments: args } = request.params;
    const prompt = getPrompt(name, args);
    if (!prompt) {
      return Promise.reject(new McpError(ErrorCode.InvalidParams, `Unknown prompt: ${name}`));
    }
    return Promise.resolve(prompt);
  });
}

function registerResourceHandlers(server: Server, options: CreateServerOptions): void {
  server.setRequestHandler(ListResourcesRequestSchema, () =>
    Promise.resolve({
      resources: RESOURCE_DEFINITIONS,
    }),
  );

  server.setRequestHandler(ListResourceTemplatesRequestSchema, () =>
    Promise.resolve({
      resourceTemplates: RESOURCE_TEMPLATES,
    }),
  );

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;
    const caller = options.defaultCaller ?? (await resolveCaller({}));
    const res = await readResource(uri, caller);
    if (!res) {
      throw new McpError(ErrorCode.InvalidParams, `Resource not found: ${uri}`);
    }
    return res;
  });
}

function completePromptArgument(name: string, query: string): string[] {
  if (name === "cuisine") {
    return COMMON_CUISINES.filter((c) => c.toLowerCase().includes(query)).slice(0, 20);
  }
  if (name === "historicalAgent") {
    return HISTORICAL_AGENTS.filter((a) => a.toLowerCase().includes(query)).slice(0, 20);
  }
  return [];
}

async function completeResourceUri(uri: string, query: string): Promise<string[]> {
  if (uri.startsWith("alchm://ingredients/")) {
    const catalog = getIngredientCatalog();
    return catalog.entries
      .map((i) => i.slug)
      .filter((slug) => slug.toLowerCase().includes(query))
      .slice(0, 20);
  }
  if (uri.startsWith("alchm://techniques/")) {
    return TECHNIQUE_SLUGS.filter((t) => t.toLowerCase().includes(query)).slice(0, 20);
  }
  if (uri.startsWith("alchm://recipes/")) {
    try {
      const recipes = await LocalRecipeService.getAllRecipes();
      return recipes
        .filter((r) => r.id.toLowerCase().includes(query) || r.name.toLowerCase().includes(query))
        .map((r) => r.id)
        .slice(0, 20);
    } catch {
      return [];
    }
  }
  if (uri.startsWith("alchm://solar-return/")) {
    const maxYear = new Date().getUTCFullYear() - 1;
    const years: string[] = [];
    for (let y = maxYear; y >= maxYear - 30; y--) {
      const s = String(y);
      if (s.includes(query)) years.push(s);
    }
    return years.slice(0, 20);
  }
  return [];
}

function registerCompletionHandlers(server: Server): void {
  server.setRequestHandler(CompleteRequestSchema, async (request) => {
    const { ref, argument } = request.params;
    const query = argument.value.toLowerCase().trim();

    if (ref.type === "ref/prompt") {
      const values = completePromptArgument(argument.name, query);
      return { completion: { values } };
    }

    const values = await completeResourceUri(ref.uri, query);
    return { completion: { values } };
  });
}

/**
 * Creates and registers a full-featured MCP Server instance with Tools, Prompts,
 * Resources, and Interactive Autocompletion (`completion/complete`).
 */
export function createAlchmMcpServer(options: CreateServerOptions = {}): Server {
  const sessionId = options.sessionId ?? "server";

  const server = new Server(
    { name: "alchm-mcp-server", version: MCP_SERVER_VERSION },
    {
      capabilities: {
        tools: {},
        prompts: {},
        resources: {},
        completions: {},
      },
    },
  );

  registerToolHandlers(server, options, sessionId);
  registerPromptHandlers(server);
  registerResourceHandlers(server, options);
  registerCompletionHandlers(server);

  return server;
}
