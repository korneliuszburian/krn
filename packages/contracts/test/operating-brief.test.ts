import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { krnOperatingBriefJsonSchema, parseKrnOperatingBrief } from "../src/index.js";

const root = process.cwd();

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(join(root, path), "utf8")) as unknown;
}

describe("KRN operating brief contract", () => {
  it("parses the valid operating brief fixture", () => {
    const brief = parseKrnOperatingBrief(readJson("docs/specs/krn-operating-brief/examples/krn-operating-brief.example.json"));

    expect(brief.command).toBe("krn brief");
    expect(brief.memory_selection.selected.map((selected) => selected.memory_id)).toEqual([
      "mem-goal-038-memory-boundary",
    ]);
    expect(brief.selected_context.map((context) => context.ref)).toEqual(["memory:mem-goal-038-memory-boundary"]);
    expect(brief.applied_kernel_terms).toContain("memory-operative");
  });

  it("rejects selected context that was not selected by memory selection", () => {
    expect(() =>
      parseKrnOperatingBrief(
        readJson("docs/specs/krn-operating-brief/fixtures/bad-operating-brief-unselected-context.example.json"),
      ),
    ).toThrow();
  });

  it("exports a JSON schema for downstream tools", () => {
    expect(krnOperatingBriefJsonSchema).toMatchObject({
      type: "object",
      properties: expect.objectContaining({
        memory_selection: expect.any(Object),
        memory_application: expect.any(Object),
      }),
    });
  });
});
