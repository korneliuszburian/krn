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
    ]);
    expect(report.proposals.every((proposal) => proposal.status === "proposal_only")).toBe(true);
  });

  it("rejects the known-bad fixture", () => {
    expect(() => parseKrnReviewReport(readJson("docs/specs/krn-review/fixtures/bad-krn-review-report.example.json"))).toThrow();
  });

  it("exports a JSON schema for downstream tools", () => {
    expect(krnReviewReportJsonSchema).toMatchObject({
      type: "object",
      properties: expect.objectContaining({
        schema_version: expect.any(Object),
        artifacts: expect.any(Object),
        proposals: expect.any(Object),
      }),
    });
  });
});
