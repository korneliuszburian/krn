import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  parseKrnContextPointerIndex,
  parseKrnEvalBaseline,
  parseKrnInitReadinessReport,
  parseKrnPolicyBoundaries,
  parseKrnSourceGraph,
  type KrnInitReadinessReport,
} from "@krn/contracts";
import { INIT_BOOTSTRAP_TARGETS, type InitBootstrapTarget } from "./init-targets.js";
import { createRunId, pathKind } from "./runtime-utils.js";

type CapabilityStatus = KrnInitReadinessReport["required_capabilities"][number]["status"];
type ForbiddenState = KrnInitReadinessReport["forbidden_state"][number];

const READINESS_SOURCE_REFS = ["docs/specs/krn-init/README.md"] as const;

const PARSED_TARGETS = {
  source_pointers: parseKrnSourceGraph,
  context_pointers: parseKrnContextPointerIndex,
  eval_baseline: parseKrnEvalBaseline,
  policy_boundaries: parseKrnPolicyBoundaries,
} as const;

const FORBIDDEN_CONTENT_PATTERNS = [
  ["active_goal_truth_copy", /\bgoal-\d{3}\b/i, "Bootstrap seed files must not copy active goal truth; route current goal through runtime goal/checkpoint state."],
  ["canonical_blueprint_truth_copy", /docs[\\/]+plans[\\/]+canonical[\\/]+draft\.md/i, "Bootstrap seed files must not copy the canonical blueprint path; use source refs or source graph lineage."],
  ["repo_specific_home_path", /(?:\/home\/[A-Za-z0-9._-]+|[A-Z]:\\Users\\[A-Za-z0-9._-]+)/, "Bootstrap seed files must not embed operator-specific absolute home paths."],
  ["active_product_status_text", /active\s+final[- ]product|active\s+goal\s+evidence/i, "Bootstrap seed files must not embed active product status prose; use typed status fields and source refs."],
] as const;

const FORBIDDEN_PATHS = [
  ["repo_local_memory_core", ".krn/memory", ".krn/memory exists; repo-local files are runtime evidence/cache/ledger, not authoritative memory core.", ".krn/memory is absent; bootstrap readiness has not created a repo-local memory core."],
  ["dashboard_runtime_state", ".krn/dashboard", ".krn/dashboard exists; dashboard state is not part of reviewed repo-bootstrap readiness.", ".krn/dashboard is absent; readiness is not using a dashboard-first surface."],
  ["api_runtime_state", ".krn/api", ".krn/api exists; broad API/cloud sync is outside reviewed repo-bootstrap readiness.", ".krn/api is absent; readiness has not created broad API/cloud sync state."],
] as const;

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8")) as unknown;
}

function capabilityReport(
  target: InitBootstrapTarget,
  status: CapabilityStatus,
  reason: string,
): KrnInitReadinessReport["required_capabilities"][number] {
  return {
    capability: target.capability,
    path: target.path,
    status,
    reason,
    source_refs: [...target.sourceRefs],
  };
}

function inspectCapability(targetRoot: string, target: InitBootstrapTarget): KrnInitReadinessReport["required_capabilities"][number] {
  const kind = pathKind(targetRoot, target.path);
  if (kind === "missing") {
    return capabilityReport(
      target,
      "missing",
      `${target.path} is absent; run the reviewed init proposal/apply path for ${target.capability}.`,
    );
  }

  if (kind !== "file") {
    return capabilityReport(target, "invalid", `${target.path} must be a file for reviewed bootstrap readiness.`);
  }

  const parser = PARSED_TARGETS[target.capability as keyof typeof PARSED_TARGETS];
  if (!parser) {
    return capabilityReport(
      target,
      "present",
      `${target.path} exists; this capability has no richer bootstrap parser yet.`,
    );
  }

  try {
    parser(readJson(resolve(targetRoot, target.path)));
    return capabilityReport(target, "present", `${target.path} exists and parses through its typed bootstrap contract.`);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "unknown parse error";
    return capabilityReport(target, "invalid", `${target.path} failed typed bootstrap parsing: ${message}`);
  }
}

function forbiddenPathState(targetRoot: string, [id, path, present, clear]: (typeof FORBIDDEN_PATHS)[number]): ForbiddenState {
  const status = pathKind(targetRoot, path) === "missing" ? "clear" : "present";
  return {
    id,
    path,
    status,
    reason: status === "present" ? present : clear,
  };
}

function inspectForbiddenContent(targetRoot: string): ForbiddenState[] {
  const states: ForbiddenState[] = [];

  for (const target of INIT_BOOTSTRAP_TARGETS) {
    if (pathKind(targetRoot, target.path) !== "file") {
      continue;
    }
    const content = readFileSync(resolve(targetRoot, target.path), "utf8");

    for (const [id, pattern, reason] of FORBIDDEN_CONTENT_PATTERNS) {
      if (pattern.test(content)) {
        states.push({
          id,
          path: target.path,
          status: "present",
          reason,
        });
      }
    }
  }

  return states;
}

export function buildKrnInitReadinessReport(targetInput: string, now = new Date()): KrnInitReadinessReport {
  const targetRoot = resolve(targetInput);
  const runId = createRunId(now);
  const requiredCapabilities = INIT_BOOTSTRAP_TARGETS.map((target) => inspectCapability(targetRoot, target));
  const forbiddenState = [
    ...FORBIDDEN_PATHS.map((item) => forbiddenPathState(targetRoot, item)),
    ...inspectForbiddenContent(targetRoot),
  ];
  const summary = {
    required_capabilities: requiredCapabilities.length,
    present_capabilities: requiredCapabilities.filter((item) => item.status === "present").length,
    missing_capabilities: requiredCapabilities.filter((item) => item.status === "missing").length,
    invalid_capabilities: requiredCapabilities.filter((item) => item.status === "invalid").length,
    forbidden_state_present: forbiddenState.filter((item) => item.status === "present").length,
  };
  const blockedSurfaces = [
    ...requiredCapabilities
      .filter((item) => item.status !== "present")
      .map((item) => `${item.capability}:${item.status}`),
    ...forbiddenState.filter((item) => item.status === "present").map((item) => item.id),
  ];
  const readinessStatus: "ready" | "blocked" = blockedSurfaces.length === 0 ? "ready" : "blocked";

  return parseKrnInitReadinessReport({
    schema_version: "krn-init-readiness-report.v1",
    kind: "krn_init_readiness_report",
    run_id: runId,
    created_at: now.toISOString(),
    target_root: targetRoot,
    command: "krn init --readiness",
    readiness_status: readinessStatus,
    required_capabilities: requiredCapabilities,
    forbidden_state: forbiddenState,
    summary,
    next_action:
      readinessStatus === "ready"
        ? "Use this target for the next local repo-bootstrap dogfood task; do not claim memory quality, hook/security, dashboard/API, or productivity lift."
        : "Resolve missing/invalid reviewed bootstrap capabilities and remove forbidden bootstrap state before dogfood.",
    blocked_surfaces: blockedSurfaces,
    source_refs: [...READINESS_SOURCE_REFS],
    overclaim_boundary:
      "This report proves local reviewed repo-bootstrap readiness only; it does not prove merge-mode safety, memory quality, hook/security enforcement, dashboard/API readiness, source freshness, skill quality, or productivity lift.",
    interpretation_caveat:
      "Runtime evidence may store readiness status, capability IDs, and outcomes; authoritative product memory and source truth remain outside this report.",
  });
}

export function writeKrnInitReadinessReport(targetInput: string, report: KrnInitReadinessReport): string {
  const targetRoot = resolve(targetInput);
  const reportDir = resolve(targetRoot, ".krn", "init", report.run_id);
  const reportPath = resolve(reportDir, "readiness.json");

  mkdirSync(reportDir, { recursive: true });
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  return reportPath;
}
