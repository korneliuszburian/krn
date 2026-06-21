import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { krnEvalModuleRegistryJsonSchema, parseKrnEvalModuleRegistry } from "../src/index.js";

const root = process.cwd();

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(join(root, path), "utf8")) as unknown;
}

describe("KrnEvalModuleRegistry contract", () => {
  it("parses the repo eval registry through the public parser", () => {
    const registry = parseKrnEvalModuleRegistry(readJson("docs/evals/registry.json"));

    expect(registry.kind).toBe("krn_eval_module_registry");
    expect(registry.default_lane).toBe("current");
    expect(registry.modules.map((module) => module.module_id)).toContain("krn-init-contracts");
    expect(registry.modules.map((module) => module.module_id)).toContain("krn-research-pack");
    expect(registry.modules.filter((module) => module.lane === "core")).toHaveLength(5);
    expect(registry.modules.some((module) => module.lane === "lab")).toBe(true);
  });

  it("rejects duplicate module IDs", () => {
    expect(() =>
      parseKrnEvalModuleRegistry(readJson("docs/specs/krn-eval/fixtures/bad-eval-module-registry-duplicate.example.json")),
    ).toThrow();
  });

  it("exports a JSON schema for downstream tools", () => {
    expect(krnEvalModuleRegistryJsonSchema).toMatchObject({
      type: "object",
      properties: expect.objectContaining({
        schema_version: expect.any(Object),
        modules: expect.any(Object),
      }),
    });
  });
});
