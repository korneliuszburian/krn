import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { krnReviewReportJsonSchema, parseKrnReviewReport } from "../src/index.js";

const root = process.cwd();

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(join(root, path), "utf8")) as unknown;
}

describe("KrnReviewReport contract", () => {
  it("parses the valid example through the public parser", () => {
    const report = parseKrnReviewReport(readJson("docs/specs/krn-review/examples/krn-review-report.example.json"));

    expect(report.kind).toBe("krn_review_report");
    expect(report.command).toBe("krn review");
    expect(report.mode).toBe("proposal-only");
    expect(report.artifacts.map((artifact) => artifact.id)).toEqual([
      "latest-init-manifest",
      "latest-doctor-report",
      "latest-eval-report",
      "latest-source-check",
    ]);
    expect(report.memory_selection.selected.map((selected) => selected.memory_id)).toEqual([
      "mem-goal-038-memory-boundary",
    ]);
    expect(report.memory_application.applied_memory_ids).toEqual(["mem-goal-038-memory-boundary"]);
    expect(report.memory_feedback.memory_outcomes.map((outcome) => outcome.memory_id)).toEqual([
      "mem-goal-038-memory-boundary",
    ]);
    expect(report.proposals.every((proposal) => proposal.status === "proposal_only")).toBe(true);
    expect(report.source_refs).toEqual([
      "docs/specs/krn-review/README.md",
      "docs/evals/STANDARD.md",
      "docs/goals/goal-038.md",
      "docs/plans/canonical/SOURCES.md#C061",
    ]);
  });

  it("rejects the known-bad fixture", () => {
    expect(() => parseKrnReviewReport(readJson("docs/specs/krn-review/fixtures/bad-krn-review-report.example.json"))).toThrow();
  });

  it("rejects a report when selected memory is not applied", () => {
    const fixture = parseKrnReviewReport(readJson("docs/specs/krn-review/examples/krn-review-report.example.json"));
    const candidate: unknown = {
      ...fixture,
      memory_application: {
        ...fixture.memory_application,
        applied_memory_ids: ["different-memory-id"],
      },
    };

    expect(() => parseKrnReviewReport(candidate)).toThrow();
  });

  it("rejects a report missing selected memory source lineage", () => {
    const fixture = parseKrnReviewReport(readJson("docs/specs/krn-review/examples/krn-review-report.example.json"));
    const candidate: unknown = {
      ...fixture,
      source_refs: fixture.source_refs.filter((sourceRef) => sourceRef !== "docs/plans/canonical/SOURCES.md#C061"),
    };

    expect(() => parseKrnReviewReport(candidate)).toThrow();
  });

  it("exports a JSON schema for downstream tools", () => {
    expect(krnReviewReportJsonSchema).toMatchObject({
      type: "object",
      properties: expect.objectContaining({
        schema_version: expect.any(Object),
        artifacts: expect.any(Object),
        memory_selection: expect.any(Object),
        memory_application: expect.any(Object),
        proposals: expect.any(Object),
      }),
    });
  });
});
