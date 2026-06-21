import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { parseKrnEngineeringGate, type KrnEngineeringGate } from "@krn/contracts";
import { resolveKrnRequiredSkills } from "./skill-routing.js";

export type GateArgs = {
  target: string;
  task: string;
  path: string | null;
};

type GateCheck = KrnEngineeringGate["checks"][number];
type CheckDefinition = readonly [GateCheck["id"], string, string, string];

const CHECK_DEFINITIONS: readonly CheckDefinition[] = [
  ["mechanism", "Name the concrete mechanism that improves KRN before editing.", "State the mechanism as a consumed product behavior, not a best-practice label.", "docs/specs/krn-engineering-gate/README.md#required-non-trivial-checks"],
  ["scope_boundary", "Name the exact surface touched by this slice.", "Keep the slice limited to the named files, public interfaces, and tests.", "docs/specs/krn-engineering-gate/README.md#required-non-trivial-checks"],
  ["consumer", "Every durable object must have a current consumer.", "Do not add contracts, docs, reports, or UI surfaces unless a CLI, review, eval, MCP/API, or dashboard consumer exists.", "docs/specs/krn-engineering-gate/README.md#required-non-trivial-checks"],
  ["verification", "Name focused verification before implementation is claimed done.", "Run narrow public-interface tests, pnpm typecheck, and git diff --check for this task.", "docs/specs/krn-engineering-gate/README.md#validation"],
  ["rollback_or_kill", "Name how to reverse or kill the layer if it adds ceremony without value.", "Keep the slice removable and define the review finding or metric that would delete it.", "docs/specs/krn-engineering-gate/README.md#required-non-trivial-checks"],
  ["hardcoded_truth", "Separate stable schema constants from volatile product truth.", "Put volatile truth behind a typed store, config, source graph, or fixture; do not bake it into product code.", "docs/specs/krn-engineering-gate/README.md#required-non-trivial-checks"],
  ["skill_routing", "Use matching repo skills for non-trivial work.", "Use the required skills before editing and record missing triggers as skill-quality issues.", "docs/specs/krn-engineering-gate/README.md#required-non-trivial-checks"],
  ["simplify_cadence", "Run a simplify/condense check when adding durable objects.", "Review diff stat, duplicate concepts, unconsumed objects, default read-set growth, and unused exports before commit.", "docs/specs/krn-engineering-gate/README.md#validation"],
  ["overclaim_boundary", "Name what this slice does not prove.", "Report the narrow proof and explicitly avoid productivity, memory-quality, hook-enforcement, or final-product claims unless measured.", "docs/specs/krn-engineering-gate/README.md#purpose"],
];

function readOptionValue(argv: readonly string[], index: number, option: string): string {
  const value = argv[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`Missing value for ${option}`);
  }
  return value;
}

export function parseKrnGateArgs(argv: readonly string[]): GateArgs {
  if (argv[0] !== "gate") {
    throw new Error("Expected command: gate");
  }

  let target = ".";
  let task: string | null = null;
  let path: string | null = null;

  for (let index = 1; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--target") {
      target = readOptionValue(argv, index, arg);
      index += 1;
      continue;
    }

    if (arg === "--task") {
      task = readOptionValue(argv, index, arg);
      index += 1;
      continue;
    }

    if (arg === "--path") {
      path = readOptionValue(argv, index, arg);
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg ?? "<empty>"}`);
  }

  if (!task) {
    throw new Error("Missing required --task");
  }

  return { target, task, path };
}

function createRunId(now: Date): string {
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  return `${stamp}-${process.pid}`;
}

function classifyScope(task: string, targetPath: string | null): KrnEngineeringGate["scope_classification"] {
  const lowerTask = task.toLowerCase();
  const trivialSignals = /\b(typo|spelling|format|one-line|one line|literal copy|rename only)\b/.test(lowerTask);
  const productSignals = /\b(contract|parser|cli|eval|memory|source|goal|hook|mcp|api|dashboard|refactor|typescript|schema)\b/.test(
    lowerTask,
  );

  if (trivialSignals && !productSignals && targetPath === null) {
    return "trivial";
  }

  return "non_trivial";
}

function needsBlockedSurface(task: string): boolean {
  const lowerTask = task.toLowerCase();
  const disallowedSurfacePattern = /\b(dashboard|benchmark|cloud sync|api sync|broad api|live-full)\b/g;
  const justifiedConsumer = /\b(typed consumer|memory application|selection|review consumer|source graph|trace consumer)\b/.test(
    lowerTask,
  );

  const disallowedSurface = [...lowerTask.matchAll(disallowedSurfacePattern)].some((match) => {
    const matchIndex = match.index ?? 0;
    const previousBoundary = Math.max(
      lowerTask.lastIndexOf(".", matchIndex),
      lowerTask.lastIndexOf(";", matchIndex),
      lowerTask.lastIndexOf("\n", matchIndex),
    );
    const localContext = lowerTask.slice(previousBoundary + 1, matchIndex);
    return !/\b(no|not|without|avoid|forbid|forbidden|block|blocked|reject|exclude|excludes|forbidding)\b/.test(
      localContext,
    );
  });

  return disallowedSurface && !justifiedConsumer;
}

function buildChecks(task: string, blocked: boolean): KrnEngineeringGate["checks"] {
  const status = blocked ? "fail" : "pass";
  const blockedPrefix = blocked ? "Stop and narrow the task before editing. " : "";

  return CHECK_DEFINITIONS.map(([id, requirement, action, evidence]) => ({
    id,
    requirement,
    status,
    action: `${blockedPrefix}${action}`,
    evidence,
  }));
}

export function buildKrnEngineeringGate(args: GateArgs, now = new Date()): KrnEngineeringGate {
  const targetRoot = resolve(args.target);
  const runId = createRunId(now);
  const runtimeReportPath = `.krn/gates/${runId}/engineering-gate.json`;
  const blocked = needsBlockedSurface(args.task);
  const gateStatus: KrnEngineeringGate["gate_status"] = blocked ? "blocked" : "pass";

  const candidate: unknown = {
    schema_version: "krn-engineering-gate.v1",
    kind: "krn_engineering_gate",
    run_id: runId,
    created_at: now.toISOString(),
    target_root: targetRoot,
    command: "krn gate",
    task_intent: args.task,
    target_path: args.path,
    scope_classification: classifyScope(args.task, args.path),
    gate_status: gateStatus,
    checks: buildChecks(args.task, blocked),
    required_skills: resolveKrnRequiredSkills({
      task: args.task,
      targetPath: args.path,
    }),
    blocked_actions: [
      "Do not edit product code before mechanism, consumer, verification, rollback, and hardcoded-truth checks are explicit.",
      "Do not treat docs/memory/** or .krn/** as authoritative memory core.",
      "Do not add dashboard, benchmark, broad API/cloud sync, or passive docs before a typed consumed behavior exists.",
    ],
    hardcoded_truth_policy: {
      allowed: ["schema versions", "stable command names", "stable check IDs", "explicit test fixtures"],
      forbidden: [
        "live memory records",
        "active source lists",
        "current goal state in product code",
        "repo-local absolute paths in product code",
      ],
    },
    next_steps: [
      {
        step: blocked
          ? "Rewrite the task around the current bottleneck and a real typed consumer before editing."
          : `Execute the smallest production-shaped slice for: ${args.task}`,
        verification:
          "Run focused public-interface tests, pnpm typecheck, git diff --check, and the engineering-gate simplify/condense check.",
      },
    ],
    runtime_report_path: runtimeReportPath,
    source_refs: ["docs/specs/krn-engineering-gate/README.md"],
    overclaim_boundary:
      "This gate proves that a non-trivial task has a required pre-edit engineering checklist and runtime artifact. It does not prove hook-level enforcement, productivity lift, final memory quality, or completed implementation.",
    interpretation_caveat:
      "The gate is a before-edit artifact. It forces explicit engineering standards, but the actual slice still needs tests, typecheck, diff review, simplify/condense, commit, and push.",
  };

  return parseKrnEngineeringGate(candidate);
}

export function writeKrnEngineeringGate(targetInput: string, gate: KrnEngineeringGate): string {
  const targetRoot = resolve(targetInput);
  const gateDir = resolve(targetRoot, ".krn", "gates", gate.run_id);
  const gatePath = resolve(gateDir, "engineering-gate.json");

  mkdirSync(gateDir, { recursive: true });
  writeFileSync(gatePath, `${JSON.stringify(gate, null, 2)}\n`, "utf8");

  return gatePath;
}
