import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { krnProposalPromotionJsonSchema, parseKrnProposalPromotion } from "../src/index.js";

const root = process.cwd();

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(join(root, path), "utf8")) as unknown;
}

describe("KRN proposal promotion contract", () => {
  it("parses the valid proposal promotion example through the public parser", () => {
    const promotion = parseKrnProposalPromotion(
      readJson("docs/specs/krn-proposal-promotion/examples/proposal-promotion.example.json"),
    );

    expect(promotion.kind).toBe("krn_proposal_promotion");
    expect(promotion.proposal_kind).toBe("memory_update");
    expect(promotion.promotion_scope).toBe("approved_memory_update_only");
    expect(promotion.apply_mode).toBe("record_only");
    expect(promotion.promotion_state).toBe("planned");
    expect(promotion.target_mutated).toBe(false);
    expect(promotion.write_policy.default_effect).toBe("record_only");
    expect(promotion.write_policy.allowed_effects).toContain("append_promotion_record");
  });

  it("rejects the known-bad record-only mutation fixture", () => {
    expect(() =>
      parseKrnProposalPromotion(
        readJson("docs/specs/krn-proposal-promotion/fixtures/bad-proposal-promotion.example.json"),
      ),
    ).toThrow();
  });

  it("parses an init bootstrap promotion with the init-only scope", () => {
    const promotion = parseKrnProposalPromotion({
      schema_version: "krn-proposal-promotion.v1",
      kind: "krn_proposal_promotion",
      promotion_id: "promotion-init-bootstrap-agent-instructions-test",
      proposal_id: "init-bootstrap-agent-instructions-test",
      proposal_path: ".krn/proposals/init-bootstrap/proposal.json",
      decision_id: "decision-init-bootstrap-agent-instructions-test",
      decision_path: ".krn/proposal-reviews/init-bootstrap/decision.json",
      proposal_kind: "init_bootstrap",
      promotion_scope: "approved_init_bootstrap_only",
      apply_mode: "apply_exact_target_write",
      promotion_state: "applied",
      target_mutated: true,
      target: {
        target_type: "path",
        path: "AGENTS.md",
        write_mode: "exact_file_content",
        file_content: "# Agent Instructions\n\nThis repository is KRN-enabled.\n",
        content_sha256: "8a29e1918af766a50f89c4f7c01f3d09e7608882ff0ce900a1ed5721b43d9055",
      },
      write_policy: {
        default_effect: "record_only",
        allowed_effects: ["append_promotion_record", "write_exact_target_content"],
        idempotency_key: "init-bootstrap-apply:init-bootstrap-agent-instructions-test:decision",
      },
      evidence_refs: [".krn/init/test/manifest.json"],
      source_refs: [".krn/init/test/manifest.json"],
      blocked_surfaces: ["target_overwrite", "memory_core_write"],
      created_at: "2026-06-20T22:40:00.000Z",
      created_by: "krn init",
      interpretation_caveat:
        "This promotion applies one reviewed init agent-instructions payload only; it does not prove broad repo bootstrap.",
    });

    expect(promotion.proposal_kind).toBe("init_bootstrap");
    expect(promotion.promotion_scope).toBe("approved_init_bootstrap_only");
    expect(promotion.target.path).toBe("AGENTS.md");
  });

  it("rejects an init bootstrap promotion using the memory-only scope", () => {
    expect(() =>
      parseKrnProposalPromotion({
        schema_version: "krn-proposal-promotion.v1",
        kind: "krn_proposal_promotion",
        promotion_id: "bad-init-bootstrap-memory-scope",
        proposal_id: "init-bootstrap-agent-instructions-test",
        proposal_path: ".krn/proposals/init-bootstrap/proposal.json",
        decision_id: "decision-init-bootstrap-agent-instructions-test",
        decision_path: ".krn/proposal-reviews/init-bootstrap/decision.json",
        proposal_kind: "init_bootstrap",
        promotion_scope: "approved_memory_update_only",
        apply_mode: "record_only",
        promotion_state: "planned",
        target_mutated: false,
        target: {
          target_type: "path",
          path: "AGENTS.md",
          write_mode: "exact_file_content",
          file_content: "# Agent Instructions\n",
          content_sha256: "1b12d919816a1caab0d5c54eddea2db3d33e1723071e43fdf4cfa02a0a986228",
        },
        write_policy: {
          default_effect: "record_only",
          allowed_effects: ["append_promotion_record"],
          idempotency_key: "bad-init-bootstrap-memory-scope",
        },
        evidence_refs: [".krn/init/test/manifest.json"],
        source_refs: [".krn/init/test/manifest.json"],
        blocked_surfaces: ["target_overwrite"],
        created_at: "2026-06-20T22:40:00.000Z",
        created_by: "test",
        interpretation_caveat: "Bad fixture.",
      }),
    ).toThrow();
  });

  it("exports a JSON schema for downstream promotion tools", () => {
    expect(krnProposalPromotionJsonSchema).toMatchObject({
      type: "object",
      properties: expect.objectContaining({
        schema_version: expect.any(Object),
        apply_mode: expect.any(Object),
        promotion_state: expect.any(Object),
        target: expect.any(Object),
        write_policy: expect.any(Object),
      }),
    });
  });
});
