import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { krnMcpProposalToolResultJsonSchema, parseKrnMcpProposalToolResult } from "../src/index.js";

const root = process.cwd();

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(join(root, path), "utf8")) as unknown;
}

describe("KRN MCP proposal tool result contract", () => {
  it("parses the valid tool result example through the public parser", () => {
    const result = parseKrnMcpProposalToolResult(
      readJson("docs/specs/krn-mcp-proposal-tool/examples/mcp-proposal-tool-result.example.json"),
    );

    expect(result.kind).toBe("krn_mcp_proposal_tool_result");
    expect(result.tool_name).toBe("krn_store_control_plane_proposal");
    expect(result.approved).toBe(false);
    expect(result.mutated_target).toBe(false);
    expect(result.proposal_store.proposal_path).toMatch(/^\.krn\/proposals\//);
  });

  it("rejects a result that claims approval", () => {
    expect(() =>
      parseKrnMcpProposalToolResult(
        readJson("docs/specs/krn-mcp-proposal-tool/fixtures/bad-mcp-proposal-tool-result.example.json"),
      ),
    ).toThrow();
  });

  it("exports a JSON schema for downstream tools", () => {
    expect(krnMcpProposalToolResultJsonSchema).toMatchObject({
      type: "object",
      properties: expect.objectContaining({
        schema_version: expect.any(Object),
        approved: expect.any(Object),
        mutated_target: expect.any(Object),
        proposal_store: expect.any(Object),
      }),
    });
  });
});
