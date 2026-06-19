import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { initManifestJsonSchema, parseInitManifest } from "../src/index.js";

const root = process.cwd();

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(join(root, path), "utf8")) as unknown;
}

describe("InitManifest contract", () => {
  it("parses the valid example through the public parser", () => {
    const manifest = parseInitManifest(readJson("docs/specs/krn-init/examples/init-manifest.example.json"));

    expect(manifest.kind).toBe("krn_init_manifest");
    expect(manifest.mode).toBe("dry-run");
    expect(manifest.planned_files.some((item) => item.action === "proposal_only")).toBe(true);
  });

  it("rejects the known-bad fixture", () => {
    expect(() => parseInitManifest(readJson("docs/specs/krn-init/fixtures/bad-init-manifest.example.json"))).toThrow();
  });

  it("exports a JSON schema for downstream tools", () => {
    expect(initManifestJsonSchema).toMatchObject({
      type: "object",
      properties: expect.objectContaining({
        schema_version: expect.any(Object),
        planned_files: expect.any(Object),
      }),
    });
  });
});

