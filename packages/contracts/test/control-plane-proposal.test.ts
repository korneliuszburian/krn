import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { krnControlPlaneProposalJsonSchema, parseKrnControlPlaneProposal } from "../src/index.js";

const root = process.cwd();

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(join(root, path), "utf8")) as unknown;
}

describe("KRN control-plane proposal contract", () => {
  it("parses the valid proposal example through the public parser", () => {
    const proposal = parseKrnControlPlaneProposal(
      readJson("docs/specs/krn-control-plane-proposal/examples/control-plane-proposal.example.json"),
    );

    expect(proposal.kind).toBe("krn_control_plane_proposal");
    expect(proposal.status).toBe("proposal_only");
    expect(proposal.write_policy.default_effect).toBe("no_mutation");
    expect(proposal.write_policy.allowed_persistence).toBe("append_only");
    expect(proposal.write_policy.idempotency_key).toContain("krn-mcp-stdio-transport");
    expect(proposal.promotion_payload).toMatchObject({
      payload_type: "memory_entry",
      target_path: "docs/memory/product/2026-06-20--krn-mcp-stdio-transport.md",
      write_mode: "exact_file_content",
      content_sha256: "fba6239887a01179fbec3cbb5c43e55f48fd628e7ac04a4e2ef8cb95db109e35",
    });
    expect(proposal.review_gate).toEqual({
      required: true,
      state: "not_reviewed",
      reviewer: null,
    });
  });

  it("rejects the known-bad approved mutation fixture", () => {
    expect(() =>
      parseKrnControlPlaneProposal(
        readJson("docs/specs/krn-control-plane-proposal/fixtures/bad-control-plane-proposal.example.json"),
      ),
    ).toThrow();
  });

  it("rejects a machine-applicable promotion payload that targets a different path", () => {
    expect(() =>
      parseKrnControlPlaneProposal(
        readJson("docs/specs/krn-control-plane-proposal/fixtures/bad-promotion-payload.example.json"),
      ),
    ).toThrow();
  });

  it("exports a JSON schema for downstream tools", () => {
    expect(krnControlPlaneProposalJsonSchema).toMatchObject({
      type: "object",
      properties: expect.objectContaining({
        schema_version: expect.any(Object),
        status: expect.any(Object),
        target: expect.any(Object),
        promotion_payload: expect.any(Object),
        write_policy: expect.any(Object),
      }),
    });
  });
});
