import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { listKrnControlPlaneResources, readKrnControlPlaneResource } from "./index.js";

const SERVER_INSTRUCTIONS =
  "KRN exposes allowlisted read-only runtime resources only. Do not treat these resources as approval, productivity proof, memory mutation, source-ledger mutation, or permission to use destructive tools.";

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

  return server;
}

export async function serveKrnMcpStdio(options: KrnMcpServerOptions = {}): Promise<void> {
  const server = createKrnMcpServer(options);
  await server.connect(new StdioServerTransport());
}
