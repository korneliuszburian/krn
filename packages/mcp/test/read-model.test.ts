import { mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { describe, expect, it } from "vitest";
import { listKrnControlPlaneResources, readKrnControlPlaneResource } from "../src/index.js";

const root = process.cwd();

function copyJsonFixture(targetRoot: string, fixturePath: string, runtimePath: string): void {
  const absoluteRuntimePath = join(targetRoot, runtimePath);
  mkdirSync(dirname(absoluteRuntimePath), { recursive: true });
  writeFileSync(absoluteRuntimePath, readFileSync(join(root, fixturePath), "utf8"), "utf8");
}

function createRuntimeTarget(): string {
  const targetRoot = mkdtempSync(join(tmpdir(), "krn-mcp-read-model-"));
  copyJsonFixture(
    targetRoot,
    "docs/specs/krn-init/examples/init-manifest.example.json",
    ".krn/init/20260619T220000Z-test/manifest.json",
  );
  copyJsonFixture(
    targetRoot,
    "docs/specs/krn-doctor/examples/doctor-report.example.json",
    ".krn/doctor/20260619T220100Z-test/report.json",
  );
  copyJsonFixture(
    targetRoot,
    "docs/specs/krn-eval/examples/krn-eval-report.example.json",
    ".krn/eval/20260619T220200Z-test/report.json",
  );
  copyJsonFixture(
    targetRoot,
    "docs/specs/krn-review/examples/krn-review-report.example.json",
    ".krn/review/20260619T220300Z-test/report.json",
  );
  copyJsonFixture(
    targetRoot,
    "docs/specs/krn-benchmark-report/examples/benchmark-report.example.json",
    ".krn/benchmarks/krn-benchmark-spine/20260619T220400Z-test/report.json",
  );
  return targetRoot;
}

describe("KRN MCP read model", () => {
  it("lists allowlisted read-only resources over runtime reports", () => {
    const targetRoot = createRuntimeTarget();
    const index = listKrnControlPlaneResources(targetRoot, new Date("2026-06-19T22:40:00.000Z"));

    expect(index.resources.map((resource) => resource.uri)).toEqual([
      "krn://runtime/summary",
      "krn://runtime/init/latest",
      "krn://runtime/doctor/latest",
      "krn://runtime/eval/latest",
      "krn://runtime/review/latest",
      "krn://runtime/benchmark/latest",
    ]);
    expect(index.summary.total_resources).toBe(6);
    expect(index.summary.available_resources).toBe(6);
    expect(index.summary.write_tools_enabled).toBe(false);
    expect(index.summary.proposal_tools_enabled).toBe(false);
    expect(index.source_refs).not.toContain("docs/goals/goal-038.md");
    expect(index.source_refs).not.toContain("docs/plans/canonical/draft.md");
    for (const resource of index.resources) {
      expect(resource.source_refs).not.toContain("docs/goals/goal-038.md");
      expect(resource.source_refs).not.toContain("docs/plans/canonical/draft.md");
    }
  });

  it("reads parsed latest runtime resources without mutating target files", () => {
    const targetRoot = createRuntimeTarget();
    const beforeEntries = readdirSync(targetRoot).sort();
    const summary = readKrnControlPlaneResource(
      "krn://runtime/summary",
      targetRoot,
      new Date("2026-06-19T22:40:00.000Z"),
    );
    const review = readKrnControlPlaneResource(
      "krn://runtime/review/latest",
      targetRoot,
      new Date("2026-06-19T22:40:00.000Z"),
    );
    const benchmark = readKrnControlPlaneResource(
      "krn://runtime/benchmark/latest",
      targetRoot,
      new Date("2026-06-19T22:40:00.000Z"),
    );
    const afterEntries = readdirSync(targetRoot).sort();

    expect(summary.resource_kind).toBe("runtime_summary");
    expect(summary.read_only).toBe(true);
    expect(summary.status).toBe("available");
    expect(summary.source_refs).not.toContain("docs/goals/goal-038.md");
    expect(summary.source_refs).not.toContain("docs/plans/canonical/draft.md");
    expect(review.resource_kind).toBe("review_report");
    expect(review.status).toBe("available");
    expect(review.payload?.kind).toBe("krn_review_report");
    expect(benchmark.resource_kind).toBe("benchmark_report");
    expect(benchmark.status).toBe("available");
    expect(benchmark.payload?.kind).toBe("krn_benchmark_report");
    expect(afterEntries).toEqual(beforeEntries);
  });

  it("rejects unknown resource URIs", () => {
    const targetRoot = createRuntimeTarget();
    expect(() => readKrnControlPlaneResource("krn://runtime/unknown", targetRoot)).toThrow(/Unknown KRN/);
  });
});
