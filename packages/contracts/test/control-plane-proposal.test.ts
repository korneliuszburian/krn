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

  it("parses an init bootstrap proposal without treating it as an approved write", () => {
    const proposal = parseKrnControlPlaneProposal({
      schema_version: "krn-control-plane-proposal.v1",
      kind: "krn_control_plane_proposal",
      proposal_id: "init-bootstrap-agent-instructions-test",
      proposal_kind: "init_bootstrap",
      status: "proposal_only",
      title: "Review KRN init agent-instructions bootstrap",
      rationale: "The first init write target must be reviewed before target mutation.",
      proposed_change: "Review the AGENTS.md bootstrap proposal without writing the target file.",
      promotion_payload: {
        payload_type: "init_agent_instructions",
        bootstrap_capability: "agent_instructions",
        target_path: "AGENTS.md",
        write_mode: "exact_file_content",
        file_content: "# Agent Instructions\n\nThis repository is KRN-enabled.\n",
        content_sha256: "8a29e1918af766a50f89c4f7c01f3d09e7608882ff0ce900a1ed5721b43d9055",
      },
      target: {
        target_type: "path",
        path: "AGENTS.md",
      },
      write_policy: {
        default_effect: "no_mutation",
        allowed_persistence: "append_only",
        idempotency_key: "init-bootstrap:agent_instructions:test",
      },
      review_gate: {
        required: true,
        state: "not_reviewed",
        reviewer: null,
      },
      evidence_refs: ["docs/specs/krn-init/README.md"],
      source_refs: ["docs/specs/krn-init/README.md"],
      blocked_surfaces: ["target_file_mutation", "memory_core_write"],
      created_at: "2026-06-20T22:30:00.000Z",
      created_by: "krn init",
      interpretation_caveat:
        "This proposal is review input only; it does not mutate AGENTS.md or prove write-mode safety.",
    });

    expect(proposal.proposal_kind).toBe("init_bootstrap");
    expect(proposal.promotion_payload).toMatchObject({
      payload_type: "init_agent_instructions",
      bootstrap_capability: "agent_instructions",
      target_path: "AGENTS.md",
    });
    expect(proposal.status).toBe("proposal_only");
    expect(proposal.write_policy.default_effect).toBe("no_mutation");
  });

  it("rejects an init payload attached to a non-init proposal", () => {
    expect(() =>
      parseKrnControlPlaneProposal({
        schema_version: "krn-control-plane-proposal.v1",
        kind: "krn_control_plane_proposal",
        proposal_id: "bad-memory-proposal-with-init-payload",
        proposal_kind: "memory_update",
        status: "proposal_only",
        title: "Bad proposal",
        rationale: "Init payloads must not be accepted for memory proposals.",
        proposed_change: "Write AGENTS.md through the wrong proposal kind.",
        promotion_payload: {
          payload_type: "init_agent_instructions",
          bootstrap_capability: "agent_instructions",
          target_path: "AGENTS.md",
          write_mode: "exact_file_content",
          file_content: "# Agent Instructions\n",
          content_sha256: "1b12d919816a1caab0d5c54eddea2db3d33e1723071e43fdf4cfa02a0a986228",
        },
        target: {
          target_type: "path",
          path: "AGENTS.md",
        },
        write_policy: {
          default_effect: "no_mutation",
          allowed_persistence: "append_only",
          idempotency_key: "bad-init-payload:test",
        },
        review_gate: {
          required: true,
          state: "not_reviewed",
          reviewer: null,
        },
        evidence_refs: ["docs/specs/krn-init/README.md"],
        source_refs: ["docs/specs/krn-init/README.md"],
        blocked_surfaces: ["target_file_mutation"],
        created_at: "2026-06-20T22:30:00.000Z",
        created_by: "test",
        interpretation_caveat: "Bad fixture.",
      }),
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
