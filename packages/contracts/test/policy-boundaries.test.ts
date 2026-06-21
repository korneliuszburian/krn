import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { krnPolicyBoundariesJsonSchema, parseKrnPolicyBoundaries } from "../src/index.js";

const root = process.cwd();

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(join(root, path), "utf8")) as unknown;
}

describe("KRN policy boundaries contract", () => {
  it("parses the valid policy boundaries example through the public parser", () => {
    const policy = parseKrnPolicyBoundaries(
      readJson("docs/specs/krn-policy-boundaries/examples/policy-boundaries.example.json"),
    );

    expect(policy.kind).toBe("krn_policy_boundaries");
    expect(policy.mode).toBe("local_first_reviewed_seed");
    expect(policy.default_effect).toBe("warn_or_block_by_boundary");
    expect(policy.boundaries.find((boundary) => boundary.surface === "memory_core_write")?.enforcement).toBe("block");
    expect(policy.boundaries.find((boundary) => boundary.surface === "target_file_mutation")?.enforcement).toBe(
      "require_approval",
    );
    expect(policy.forbidden_defaults).toContain("memory_body_repo_write");
    expect(policy.forbidden_defaults).toContain("cloud_sync_default");
    expect(policy.overclaim_boundary).toContain("does not prove hook enforcement");
  });

  it("rejects policy boundaries that allow repo-local memory core writes", () => {
    expect(() =>
      parseKrnPolicyBoundaries(
        readJson("docs/specs/krn-policy-boundaries/fixtures/bad-policy-boundaries-memory-core.example.json"),
      ),
    ).toThrow();
  });

  it("exports a JSON schema for downstream policy tooling", () => {
    expect(krnPolicyBoundariesJsonSchema).toMatchObject({
      type: "object",
      properties: expect.objectContaining({
        schema_version: expect.any(Object),
        boundaries: expect.any(Object),
        forbidden_defaults: expect.any(Object),
        overclaim_boundary: expect.any(Object),
      }),
    });
  });
});
