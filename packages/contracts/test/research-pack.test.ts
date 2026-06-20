import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { krnResearchPackJsonSchema, parseKrnResearchPack } from "../src/index.js";

const root = process.cwd();

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(join(root, path), "utf8")) as unknown;
}

describe("KrnResearchPack contract", () => {
  it("parses the valid example through the public parser", () => {
    const pack = parseKrnResearchPack(
      readJson("docs/specs/krn-research-pack/examples/research-pack.example.json"),
    );

    expect(pack.kind).toBe("krn_research_pack");
    expect(pack.status).toBe("ready_for_review");
    expect(pack.source_budget.mode).toBe("quick");
    expect(pack.sources).toHaveLength(5);
    expect(pack.mechanism_matrix[0]?.source_ids).toContain("S1");
  });

  it("rejects a ready research pack below the source budget", () => {
    expect(() =>
      parseKrnResearchPack(
        readJson("docs/specs/krn-research-pack/fixtures/bad-research-pack.example.json"),
      ),
    ).toThrow();
  });

  it("allows empty source work only while scaffolded", () => {
    const fixture = parseKrnResearchPack(
      readJson("docs/specs/krn-research-pack/examples/research-pack.example.json"),
    );

    const scaffold = parseKrnResearchPack({
      ...fixture,
      status: "scaffolded",
      sources: [],
      mechanism_matrix: [],
      contradictions: [],
      rejected_alternatives: [],
      decision_candidates: [],
      promotion_targets: [],
    });

    expect(scaffold.status).toBe("scaffolded");
    expect(scaffold.sources).toEqual([]);
  });

  it("rejects mechanisms that cite missing source ids", () => {
    const fixture = parseKrnResearchPack(
      readJson("docs/specs/krn-research-pack/examples/research-pack.example.json"),
    );

    expect(() =>
      parseKrnResearchPack({
        ...fixture,
        mechanism_matrix: [
          {
            ...fixture.mechanism_matrix[0],
            source_ids: ["missing-source"],
          },
        ],
      }),
    ).toThrow();
  });

  it("exports a JSON schema for downstream tools", () => {
    expect(krnResearchPackJsonSchema).toMatchObject({
      type: "object",
      properties: expect.objectContaining({
        schema_version: expect.any(Object),
        source_budget: expect.any(Object),
        mechanism_matrix: expect.any(Object),
      }),
    });
  });
});
