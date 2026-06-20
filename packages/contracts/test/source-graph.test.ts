import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { krnSourceCheckJsonSchema, krnSourceGraphJsonSchema, parseKrnSourceCheck, parseKrnSourceGraph } from "../src/index.js";

const root = process.cwd();

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(join(root, path), "utf8")) as unknown;
}

describe("KRN source graph contract", () => {
  it("parses the valid source graph and source check fixtures", () => {
    const graph = parseKrnSourceGraph(readJson("docs/specs/krn-source-graph/examples/source-graph.example.json"));
    const check = parseKrnSourceCheck(readJson("docs/specs/krn-source-graph/examples/source-check.example.json"));

    expect(graph.records.map((record) => record.ref)).toEqual([
      "docs/goals/goal-038.md",
      "docs/plans/canonical/SOURCES.md#C061",
    ]);
    expect(check.decision).toBe("pass");
    expect(check.blocked_refs).toEqual([]);
  });

  it("rejects conflicting source records without a named conflict", () => {
    expect(() =>
      parseKrnSourceGraph(readJson("docs/specs/krn-source-graph/fixtures/bad-source-graph-conflict.example.json")),
    ).toThrow(/conflicting source records/);
  });

  it("rejects source checks that understate blocked refs", () => {
    const check = parseKrnSourceCheck(readJson("docs/specs/krn-source-graph/examples/source-check.example.json"));

    expect(() =>
      parseKrnSourceCheck({
        ...check,
        blocked_refs: ["docs/goals/goal-038.md"],
        decision: "pass",
      }),
    ).toThrow(/blocked refs/);
  });

  it("exports JSON schemas for downstream tools", () => {
    expect(krnSourceGraphJsonSchema).toMatchObject({ type: "object" });
    expect(krnSourceCheckJsonSchema).toMatchObject({ type: "object" });
  });
});
