import { mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { parseKrnControlPlaneProposal, parseKrnDashboardViewModel } from "@krn/contracts";
import { describe, expect, it } from "vitest";
import { buildKrnDashboardViewModel, storeKrnControlPlaneProposal } from "../src/index.js";

const root = process.cwd();

function copyJsonFixture(targetRoot: string, fixturePath: string, runtimePath: string): void {
  const absoluteRuntimePath = join(targetRoot, runtimePath);
  mkdirSync(dirname(absoluteRuntimePath), { recursive: true });
  writeFileSync(absoluteRuntimePath, readFileSync(join(root, fixturePath), "utf8"), "utf8");
}

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(join(root, path), "utf8")) as unknown;
}

function writeText(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
}

function createRuntimeTarget(): string {
  const targetRoot = mkdtempSync(join(tmpdir(), "krn-dashboard-view-model-"));
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
  const proposal = parseKrnControlPlaneProposal(
    readJson("docs/specs/krn-control-plane-proposal/examples/control-plane-proposal.example.json"),
  );
  for (const sourceRef of proposal.source_refs) {
    writeText(join(targetRoot, sourceRef), `# ${sourceRef}\n`);
  }
  storeKrnControlPlaneProposal(proposal, {
    targetInput: targetRoot,
    now: new Date("2026-06-20T00:00:00.000Z"),
  });
  return targetRoot;
}

describe("KRN dashboard view model builder", () => {
  it("builds a parsed view model from real read-only MCP resources", () => {
    const targetRoot = createRuntimeTarget();
    const beforeEntries = readdirSync(targetRoot).sort();
    const viewModel = buildKrnDashboardViewModel(targetRoot, new Date("2026-06-20T00:00:00.000Z"));
    const reparsed = parseKrnDashboardViewModel(viewModel);
    const afterEntries = readdirSync(targetRoot).sort();

    expect(reparsed.no_mock_state).toBe(true);
    expect(reparsed.resource_health.status).toBe("ready");
    expect(reparsed.resource_health.available_resources).toBe(6);
    expect(reparsed.latest_runtime_artifacts.map((artifact) => artifact.resource_uri)).toEqual([
      "krn://runtime/init/latest",
      "krn://runtime/doctor/latest",
      "krn://runtime/eval/latest",
      "krn://runtime/review/latest",
      "krn://runtime/benchmark/latest",
    ]);
    expect(reparsed.pending_review.pending_proposals).toBe(1);
    expect(reparsed.pending_review.source).toBe("proposal_store");
    expect(reparsed.next_allowed_action.target_surface).toBe("pending_review");
    expect(afterEntries).toEqual(beforeEntries);
  });

  it("uses explicit zero pending review when no proposal records exist", () => {
    const targetRoot = mkdtempSync(join(tmpdir(), "krn-dashboard-view-model-empty-"));
    const viewModel = buildKrnDashboardViewModel(targetRoot, new Date("2026-06-20T00:00:00.000Z"));

    expect(viewModel.no_mock_state).toBe(true);
    expect(viewModel.resource_health.status).toBe("degraded");
    expect(viewModel.pending_review.pending_proposals).toBe(0);
    expect(viewModel.pending_review.source).toBe("explicit_zero_no_proposals");
    expect(viewModel.next_allowed_action.target_surface).toBe("runtime_artifacts");
  });
});
