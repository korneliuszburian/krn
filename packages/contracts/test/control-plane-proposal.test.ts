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

  it("parses an init local-config proposal without treating it as an approved write", () => {
    const proposal = parseKrnControlPlaneProposal({
      schema_version: "krn-control-plane-proposal.v1",
      kind: "krn_control_plane_proposal",
      proposal_id: "init-bootstrap-local-config-test",
      proposal_kind: "init_bootstrap",
      status: "proposal_only",
      title: "Review KRN init local-config bootstrap",
      rationale: "The local config target must be reviewed before target mutation.",
      proposed_change: "Review the .krn/config.toml bootstrap proposal without writing the target file.",
      promotion_payload: {
        payload_type: "init_local_config",
        bootstrap_capability: "local_config",
        target_path: ".krn/config.toml",
        write_mode: "exact_file_content",
        file_content: "schema_version = \"krn-local-config.v1\"\n",
        content_sha256: "ba31fcc69959c0e2ba441096e10a2bb687653df3e392cc6493bdff77fec8d6d1",
      },
      target: {
        target_type: "path",
        path: ".krn/config.toml",
      },
      write_policy: {
        default_effect: "no_mutation",
        allowed_persistence: "append_only",
        idempotency_key: "init-bootstrap:local_config:test",
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
        "This proposal is review input only; it does not mutate .krn/config.toml or prove write-mode safety.",
    });

    expect(proposal.proposal_kind).toBe("init_bootstrap");
    expect(proposal.promotion_payload).toMatchObject({
      payload_type: "init_local_config",
      bootstrap_capability: "local_config",
      target_path: ".krn/config.toml",
    });
    expect(proposal.status).toBe("proposal_only");
    expect(proposal.write_policy.default_effect).toBe("no_mutation");
  });

  it("parses an init source-pointers proposal without treating it as an approved write", () => {
    const proposal = parseKrnControlPlaneProposal({
      schema_version: "krn-control-plane-proposal.v1",
      kind: "krn_control_plane_proposal",
      proposal_id: "init-bootstrap-source-pointers-test",
      proposal_kind: "init_bootstrap",
      status: "proposal_only",
      title: "Review KRN init source-pointers bootstrap",
      rationale: "The source graph seed target must be reviewed before target mutation.",
      proposed_change: "Review the .krn/sources/index.json bootstrap proposal without writing the target file.",
      promotion_payload: {
        payload_type: "init_source_pointers",
        bootstrap_capability: "source_pointers",
        target_path: ".krn/sources/index.json",
        write_mode: "exact_file_content",
        file_content: "{\"schema_version\":\"krn-source-graph.v1\"}\n",
        content_sha256: "0000000000000000000000000000000000000000000000000000000000000000",
      },
      target: {
        target_type: "path",
        path: ".krn/sources/index.json",
      },
      write_policy: {
        default_effect: "no_mutation",
        allowed_persistence: "append_only",
        idempotency_key: "init-bootstrap:source_pointers:test",
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
        "This proposal is review input only; it does not mutate .krn/sources/index.json or prove write-mode safety.",
    });

    expect(proposal.proposal_kind).toBe("init_bootstrap");
    expect(proposal.promotion_payload).toMatchObject({
      payload_type: "init_source_pointers",
      bootstrap_capability: "source_pointers",
      target_path: ".krn/sources/index.json",
    });
    expect(proposal.status).toBe("proposal_only");
    expect(proposal.write_policy.default_effect).toBe("no_mutation");
  });

  it("parses an init context-pointers proposal without treating it as an approved write", () => {
    const proposal = parseKrnControlPlaneProposal({
      schema_version: "krn-control-plane-proposal.v1",
      kind: "krn_control_plane_proposal",
      proposal_id: "init-bootstrap-context-pointers-test",
      proposal_kind: "init_bootstrap",
      status: "proposal_only",
      title: "Review KRN init context-pointers bootstrap",
      rationale: "The context pointer index target must be reviewed before target mutation.",
      proposed_change: "Review the .krn/context/index.json bootstrap proposal without writing the target file.",
      promotion_payload: {
        payload_type: "init_context_pointers",
        bootstrap_capability: "context_pointers",
        target_path: ".krn/context/index.json",
        write_mode: "exact_file_content",
        file_content: "{\"schema_version\":\"krn-context-pointer-index.v1\"}\n",
        content_sha256: "0000000000000000000000000000000000000000000000000000000000000000",
      },
      target: {
        target_type: "path",
        path: ".krn/context/index.json",
      },
      write_policy: {
        default_effect: "no_mutation",
        allowed_persistence: "append_only",
        idempotency_key: "init-bootstrap:context_pointers:test",
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
        "This proposal is review input only; it does not mutate .krn/context/index.json or prove write-mode safety.",
    });

    expect(proposal.proposal_kind).toBe("init_bootstrap");
    expect(proposal.promotion_payload).toMatchObject({
      payload_type: "init_context_pointers",
      bootstrap_capability: "context_pointers",
      target_path: ".krn/context/index.json",
    });
    expect(proposal.status).toBe("proposal_only");
    expect(proposal.write_policy.default_effect).toBe("no_mutation");
  });

  it("parses an init eval-baseline proposal without treating it as an approved write", () => {
    const proposal = parseKrnControlPlaneProposal({
      schema_version: "krn-control-plane-proposal.v1",
      kind: "krn_control_plane_proposal",
      proposal_id: "init-bootstrap-eval-baseline-test",
      proposal_kind: "init_bootstrap",
      status: "proposal_only",
      title: "Review KRN init eval-baseline bootstrap",
      rationale: "The eval baseline target must be reviewed before target mutation.",
      proposed_change: "Review the .krn/evals/baseline.json bootstrap proposal without writing the target file.",
      promotion_payload: {
        payload_type: "init_eval_baseline",
        bootstrap_capability: "eval_baseline",
        target_path: ".krn/evals/baseline.json",
        write_mode: "exact_file_content",
        file_content: "{\"schema_version\":\"krn-eval-baseline.v1\"}\n",
        content_sha256: "0000000000000000000000000000000000000000000000000000000000000000",
      },
      target: {
        target_type: "path",
        path: ".krn/evals/baseline.json",
      },
      write_policy: {
        default_effect: "no_mutation",
        allowed_persistence: "append_only",
        idempotency_key: "init-bootstrap:eval_baseline:test",
      },
      review_gate: {
        required: true,
        state: "not_reviewed",
        reviewer: null,
      },
      evidence_refs: ["docs/specs/krn-init/README.md"],
      source_refs: ["docs/specs/krn-init/README.md"],
      blocked_surfaces: ["target_file_mutation", "memory_core_write", "lab_default", "lift_claim"],
      created_at: "2026-06-20T22:30:00.000Z",
      created_by: "krn init",
      interpretation_caveat:
        "This proposal is review input only; it does not mutate .krn/evals/baseline.json or prove eval quality.",
    });

    expect(proposal.proposal_kind).toBe("init_bootstrap");
    expect(proposal.promotion_payload).toMatchObject({
      payload_type: "init_eval_baseline",
      bootstrap_capability: "eval_baseline",
      target_path: ".krn/evals/baseline.json",
    });
    expect(proposal.status).toBe("proposal_only");
    expect(proposal.write_policy.default_effect).toBe("no_mutation");
  });

  it("parses an init skill-wiring proposal without treating it as an approved write", () => {
    const proposal = parseKrnControlPlaneProposal({
      schema_version: "krn-control-plane-proposal.v1",
      kind: "krn_control_plane_proposal",
      proposal_id: "init-bootstrap-skill-wiring-test",
      proposal_kind: "init_bootstrap",
      status: "proposal_only",
      title: "Review KRN init skill-wiring bootstrap",
      rationale: "The skill wiring target must be reviewed before target mutation.",
      proposed_change: "Review the .agents/skills/README.md bootstrap proposal without writing the target file.",
      promotion_payload: {
        payload_type: "init_skill_wiring",
        bootstrap_capability: "skill_wiring",
        target_path: ".agents/skills/README.md",
        write_mode: "exact_file_content",
        file_content: "# KRN Skill Wiring\n",
        content_sha256: "0000000000000000000000000000000000000000000000000000000000000000",
      },
      target: {
        target_type: "path",
        path: ".agents/skills/README.md",
      },
      write_policy: {
        default_effect: "no_mutation",
        allowed_persistence: "append_only",
        idempotency_key: "init-bootstrap:skill_wiring:test",
      },
      review_gate: {
        required: true,
        state: "not_reviewed",
        reviewer: null,
      },
      evidence_refs: ["docs/specs/krn-init/README.md"],
      source_refs: ["docs/specs/krn-init/README.md"],
      blocked_surfaces: ["target_file_mutation", "memory_core_write", "copied_skill_body"],
      created_at: "2026-06-20T22:30:00.000Z",
      created_by: "krn init",
      interpretation_caveat:
        "This proposal is review input only; it does not mutate .agents/skills/README.md or prove skill quality.",
    });

    expect(proposal.proposal_kind).toBe("init_bootstrap");
    expect(proposal.promotion_payload).toMatchObject({
      payload_type: "init_skill_wiring",
      bootstrap_capability: "skill_wiring",
      target_path: ".agents/skills/README.md",
    });
    expect(proposal.status).toBe("proposal_only");
    expect(proposal.write_policy.default_effect).toBe("no_mutation");
  });

  it("parses an init policy-boundaries proposal without treating it as an approved write", () => {
    const proposal = parseKrnControlPlaneProposal({
      schema_version: "krn-control-plane-proposal.v1",
      kind: "krn_control_plane_proposal",
      proposal_id: "init-bootstrap-policy-boundaries-test",
      proposal_kind: "init_bootstrap",
      status: "proposal_only",
      title: "Review KRN init policy-boundaries bootstrap",
      rationale: "The policy boundary target must be reviewed before target mutation.",
      proposed_change: "Review the .krn/policies/boundaries.json bootstrap proposal without writing the target file.",
      promotion_payload: {
        payload_type: "init_policy_boundaries",
        bootstrap_capability: "policy_boundaries",
        target_path: ".krn/policies/boundaries.json",
        write_mode: "exact_file_content",
        file_content: "{\"schema_version\":\"krn-policy-boundaries.v1\"}\n",
        content_sha256: "0000000000000000000000000000000000000000000000000000000000000000",
      },
      target: {
        target_type: "path",
        path: ".krn/policies/boundaries.json",
      },
      write_policy: {
        default_effect: "no_mutation",
        allowed_persistence: "append_only",
        idempotency_key: "init-bootstrap:policy_boundaries:test",
      },
      review_gate: {
        required: true,
        state: "not_reviewed",
        reviewer: null,
      },
      evidence_refs: ["docs/specs/krn-init/README.md"],
      source_refs: ["docs/specs/krn-init/README.md"],
      blocked_surfaces: ["target_file_mutation", "memory_core_write", "cloud_sync_default"],
      created_at: "2026-06-20T22:30:00.000Z",
      created_by: "krn init",
      interpretation_caveat:
        "This proposal is review input only; it does not mutate .krn/policies/boundaries.json or prove hook enforcement.",
    });

    expect(proposal.proposal_kind).toBe("init_bootstrap");
    expect(proposal.promotion_payload).toMatchObject({
      payload_type: "init_policy_boundaries",
      bootstrap_capability: "policy_boundaries",
      target_path: ".krn/policies/boundaries.json",
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

  it("rejects an init local-config payload targeting a different path", () => {
    expect(() =>
      parseKrnControlPlaneProposal({
        schema_version: "krn-control-plane-proposal.v1",
        kind: "krn_control_plane_proposal",
        proposal_id: "bad-init-local-config-target",
        proposal_kind: "init_bootstrap",
        status: "proposal_only",
        title: "Bad local config target",
        rationale: "Local config payloads must target the local config path.",
        proposed_change: "Write local config to the wrong place.",
        promotion_payload: {
          payload_type: "init_local_config",
          bootstrap_capability: "local_config",
          target_path: "docs/memory/config.toml",
          write_mode: "exact_file_content",
          file_content: "schema_version = \"krn-local-config.v1\"\n",
          content_sha256: "ba31fcc69959c0e2ba441096e10a2bb687653df3e392cc6493bdff77fec8d6d1",
        },
        target: {
          target_type: "path",
          path: "docs/memory/config.toml",
        },
        write_policy: {
          default_effect: "no_mutation",
          allowed_persistence: "append_only",
          idempotency_key: "bad-init-local-config-target:test",
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

  it("rejects an init source-pointers payload targeting a different path", () => {
    expect(() =>
      parseKrnControlPlaneProposal({
        schema_version: "krn-control-plane-proposal.v1",
        kind: "krn_control_plane_proposal",
        proposal_id: "bad-init-source-pointers-target",
        proposal_kind: "init_bootstrap",
        status: "proposal_only",
        title: "Bad source pointers target",
        rationale: "Source pointer payloads must target the source graph seed path.",
        proposed_change: "Write source pointers to the wrong place.",
        promotion_payload: {
          payload_type: "init_source_pointers",
          bootstrap_capability: "source_pointers",
          target_path: "docs/plans/canonical/SOURCES.md",
          write_mode: "exact_file_content",
          file_content: "{\"schema_version\":\"krn-source-graph.v1\"}\n",
          content_sha256: "0000000000000000000000000000000000000000000000000000000000000000",
        },
        target: {
          target_type: "path",
          path: "docs/plans/canonical/SOURCES.md",
        },
        write_policy: {
          default_effect: "no_mutation",
          allowed_persistence: "append_only",
          idempotency_key: "bad-init-source-pointers-target:test",
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

  it("rejects an init context-pointers payload targeting a different path", () => {
    expect(() =>
      parseKrnControlPlaneProposal({
        schema_version: "krn-control-plane-proposal.v1",
        kind: "krn_control_plane_proposal",
        proposal_id: "bad-init-context-pointers-target",
        proposal_kind: "init_bootstrap",
        status: "proposal_only",
        title: "Bad context pointers target",
        rationale: "Context pointer payloads must target the context pointer index path.",
        proposed_change: "Write context pointers to the wrong place.",
        promotion_payload: {
          payload_type: "init_context_pointers",
          bootstrap_capability: "context_pointers",
          target_path: "docs/memory/INDEX.md",
          write_mode: "exact_file_content",
          file_content: "{\"schema_version\":\"krn-context-pointer-index.v1\"}\n",
          content_sha256: "0000000000000000000000000000000000000000000000000000000000000000",
        },
        target: {
          target_type: "path",
          path: "docs/memory/INDEX.md",
        },
        write_policy: {
          default_effect: "no_mutation",
          allowed_persistence: "append_only",
          idempotency_key: "bad-init-context-pointers-target:test",
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

  it("rejects an init eval-baseline payload targeting a different path", () => {
    expect(() =>
      parseKrnControlPlaneProposal({
        schema_version: "krn-control-plane-proposal.v1",
        kind: "krn_control_plane_proposal",
        proposal_id: "bad-init-eval-baseline-target",
        proposal_kind: "init_bootstrap",
        status: "proposal_only",
        title: "Bad eval baseline target",
        rationale: "Eval baseline payloads must target the eval baseline seed path.",
        proposed_change: "Write eval baseline to the wrong place.",
        promotion_payload: {
          payload_type: "init_eval_baseline",
          bootstrap_capability: "eval_baseline",
          target_path: ".krn/evals/lab.json",
          write_mode: "exact_file_content",
          file_content: "{\"schema_version\":\"krn-eval-baseline.v1\"}\n",
          content_sha256: "0000000000000000000000000000000000000000000000000000000000000000",
        },
        target: {
          target_type: "path",
          path: ".krn/evals/lab.json",
        },
        write_policy: {
          default_effect: "no_mutation",
          allowed_persistence: "append_only",
          idempotency_key: "bad-init-eval-baseline-target:test",
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

  it("rejects an init skill-wiring payload targeting a different path", () => {
    expect(() =>
      parseKrnControlPlaneProposal({
        schema_version: "krn-control-plane-proposal.v1",
        kind: "krn_control_plane_proposal",
        proposal_id: "bad-init-skill-wiring-target",
        proposal_kind: "init_bootstrap",
        status: "proposal_only",
        title: "Bad skill wiring target",
        rationale: "Skill wiring payloads must target the repo-local skill seed path.",
        proposed_change: "Write skill wiring to the wrong place.",
        promotion_payload: {
          payload_type: "init_skill_wiring",
          bootstrap_capability: "skill_wiring",
          target_path: ".agents/skills/typescript-contract-engineer/SKILL.md",
          write_mode: "exact_file_content",
          file_content: "# Bad copied skill\n",
          content_sha256: "0000000000000000000000000000000000000000000000000000000000000000",
        },
        target: {
          target_type: "path",
          path: ".agents/skills/typescript-contract-engineer/SKILL.md",
        },
        write_policy: {
          default_effect: "no_mutation",
          allowed_persistence: "append_only",
          idempotency_key: "bad-init-skill-wiring-target:test",
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

  it("rejects an init policy-boundaries payload targeting a different path", () => {
    expect(() =>
      parseKrnControlPlaneProposal({
        schema_version: "krn-control-plane-proposal.v1",
        kind: "krn_control_plane_proposal",
        proposal_id: "bad-init-policy-boundaries-target",
        proposal_kind: "init_bootstrap",
        status: "proposal_only",
        title: "Bad policy boundaries target",
        rationale: "Policy boundary payloads must target the policy boundary seed path.",
        proposed_change: "Write policy boundaries to the wrong place.",
        promotion_payload: {
          payload_type: "init_policy_boundaries",
          bootstrap_capability: "policy_boundaries",
          target_path: ".krn/policies/unsafe.json",
          write_mode: "exact_file_content",
          file_content: "{\"schema_version\":\"krn-policy-boundaries.v1\"}\n",
          content_sha256: "0000000000000000000000000000000000000000000000000000000000000000",
        },
        target: {
          target_type: "path",
          path: ".krn/policies/unsafe.json",
        },
        write_policy: {
          default_effect: "no_mutation",
          allowed_persistence: "append_only",
          idempotency_key: "bad-init-policy-boundaries-target:test",
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
