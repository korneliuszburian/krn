import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  KRN_STORE_CONTROL_PLANE_PROPOSAL_TOOL,
  KrnControlPlaneProposalSchema,
  KrnMcpProposalToolResultSchema,
  listKrnControlPlaneResources,
  parseKrnMcpProposalToolResult,
  readKrnControlPlaneResource,
  storeKrnControlPlaneProposal,
} from "./index.js";

const SERVER_INSTRUCTIONS =
  "KRN exposes allowlisted read-only runtime resources and one proposal-only append-only tool. Do not treat resources or tool results as approval, productivity proof, memory mutation, source-ledger mutation, dashboard readiness, or permission to use destructive tools.";

export type KrnMcpServerOptions = {
  targetRoot?: string;
  now?: () => Date;
};

function resourceText(payload: unknown): string {
  return `${JSON.stringify(payload, null, 2)}\n`;
}

export function createKrnMcpServer(options: KrnMcpServerOptions = {}): McpServer {
  const targetRoot = options.targetRoot ?? ".";
  const now = options.now ?? (() => new Date());
  const server = new McpServer(
    {
      name: "krn-control-plane",
      version: "0.0.0",
    },
    {
      instructions: SERVER_INSTRUCTIONS,
    },
  );

  const index = listKrnControlPlaneResources(targetRoot, now());
  for (const descriptor of index.resources) {
    server.registerResource(
      descriptor.name,
      descriptor.uri,
      {
        description: descriptor.description,
        mimeType: descriptor.mime_type,
        _meta: {
          read_only: descriptor.read_only,
          resource_kind: descriptor.resource_kind,
          status: descriptor.status,
          latest_report_path: descriptor.latest_report_path,
          source_refs: descriptor.source_refs,
        },
      },
      (uri) => {
        const resource = readKrnControlPlaneResource(uri.toString(), targetRoot, now());
        return {
          contents: [
            {
              uri: resource.uri,
              mimeType: resource.mime_type,
              text: resourceText(resource),
              _meta: {
                read_only: resource.read_only,
                resource_kind: resource.resource_kind,
                status: resource.status,
                latest_report_path: resource.latest_report_path,
                source_refs: resource.source_refs,
              },
            },
          ],
        };
      },
    );
  }

  server.registerTool(
    KRN_STORE_CONTROL_PLANE_PROPOSAL_TOOL,
    {
      title: "Store KRN control-plane proposal",
      description:
        "Persist a schema-backed KRN proposal as append-only review input under .krn/proposals. This does not approve the proposal, mutate its target, publish dashboard events, or expose destructive writes.",
      inputSchema: KrnControlPlaneProposalSchema,
      outputSchema: KrnMcpProposalToolResultSchema,
      annotations: {
        title: "Store KRN control-plane proposal",
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
      _meta: {
        krn_tool_boundary: "proposal_only_append_only",
        writes_only_under: ".krn/proposals",
        approval_state: "not_reviewed",
        overclaim_boundary:
          "Tool annotations are hints only; safety is enforced by the proposal parser, source-ref validation, append-only store, and evals.",
      },
    },
    (proposal) => {
      const stored = storeKrnControlPlaneProposal(proposal, { targetInput: targetRoot, now: now() });
      const toolResult = parseKrnMcpProposalToolResult({
        schema_version: "krn-mcp-proposal-tool-result.v1",
        kind: "krn_mcp_proposal_tool_result",
        tool_name: KRN_STORE_CONTROL_PLANE_PROPOSAL_TOOL,
        status: stored.status,
        proposal_store: stored,
        approved: false,
        mutated_target: false,
        blocked_surfaces: [
          "memory_mutation",
          "source_ledger_mutation",
          "goal_mutation",
          "dashboard_event_publish",
          "destructive_mcp_tools",
        ],
        source_refs: [
          "docs/goals/goal-038.md",
          "docs/goals/goal-010.md",
          "docs/specs/krn-control-plane-proposal/README.md",
          "docs/specs/krn-mcp-proposal-tool/README.md",
        ],
        interpretation_caveat:
          "This MCP tool result proves append-only proposal persistence only; it does not approve the proposal, mutate its target, prove dashboard readiness, expose HTTP/API, or prove productivity lift.",
      });

      return {
        structuredContent: toolResult,
        content: [
          {
            type: "text",
            text: resourceText(toolResult),
          },
        ],
      };
    },
  );

  return server;
}

export async function serveKrnMcpStdio(options: KrnMcpServerOptions = {}): Promise<void> {
  const server = createKrnMcpServer(options);
  await server.connect(new StdioServerTransport());
}
