import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  krnControlPlaneResourceIndexJsonSchema,
  krnControlPlaneResourceJsonSchema,
  parseKrnControlPlaneResource,
  parseKrnControlPlaneResourceIndex,
} from "../src/index.js";

const root = process.cwd();

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(join(root, path), "utf8")) as unknown;
}

describe("KRN control-plane resource contracts", () => {
  it("parses the valid resource index example through the public parser", () => {
    const index = parseKrnControlPlaneResourceIndex(
      readJson("docs/specs/krn-mcp-read-model/examples/control-plane-resource-index.example.json"),
    );

    expect(index.kind).toBe("krn_control_plane_resource_index");
    expect(index.summary.write_tools_enabled).toBe(false);
    expect(index.allowlisted_uris).toContain("krn://runtime/summary");
    expect(index.allowlisted_uris).toContain("krn://runtime/benchmark/latest");
  });

  it("parses the valid resource example through the public parser", () => {
    const resource = parseKrnControlPlaneResource(
      readJson("docs/specs/krn-mcp-read-model/examples/control-plane-resource.example.json"),
    );

    expect(resource.kind).toBe("krn_control_plane_resource");
    expect(resource.uri).toBe("krn://runtime/summary");
    expect(resource.read_only).toBe(true);
  });

  it("rejects the known-bad fixture", () => {
    expect(() =>
      parseKrnControlPlaneResource(
        readJson("docs/specs/krn-mcp-read-model/fixtures/bad-control-plane-resource.example.json"),
      ),
    ).toThrow();
  });

  it("exports JSON schemas for downstream tools", () => {
    expect(krnControlPlaneResourceJsonSchema).toMatchObject({
      type: "object",
      properties: expect.objectContaining({
        schema_version: expect.any(Object),
        payload: expect.any(Object),
      }),
    });
    expect(krnControlPlaneResourceIndexJsonSchema).toMatchObject({
      type: "object",
      properties: expect.objectContaining({
        resources: expect.any(Object),
        allowlisted_uris: expect.any(Object),
      }),
    });
  });
});
