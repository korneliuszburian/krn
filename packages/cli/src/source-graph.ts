import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  parseKrnContextPacket,
  parseKrnSourceCheck,
  parseKrnSourceGraph,
  type KrnSourceCheck,
  type KrnSourceGraph,
} from "@krn/contracts";

export type SourceCheckArgs = {
  target: string;
  context: string;
  graph: string;
};

function createRunId(now: Date): string {
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  return `${stamp}-${process.pid}`;
}

function readOptionValue(argv: readonly string[], index: number, option: string): string {
  const value = argv[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`Missing value for ${option}`);
  }
  return value;
}

export function parseSourceCheckArgs(argv: readonly string[]): SourceCheckArgs {
  if (argv[0] !== "sources" || argv[1] !== "check") {
    throw new Error("Expected command: sources check");
  }

  let target = ".";
  let context: string | null = null;
  let graph: string | null = null;

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--target") {
      target = readOptionValue(argv, index, arg);
      index += 1;
      continue;
    }

    if (arg === "--context") {
      context = readOptionValue(argv, index, arg);
      index += 1;
      continue;
    }

    if (arg === "--graph") {
      graph = readOptionValue(argv, index, arg);
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg ?? "<empty>"}`);
  }

  if (!context) {
    throw new Error("Missing required --context");
  }
  if (!graph) {
    throw new Error("Missing required --graph");
  }

  return { target, context, graph };
}

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8")) as unknown;
}

function sourceAction(record: KrnSourceGraph["records"][number]): Pick<KrnSourceCheck["checked_refs"][number], "action" | "reason"> {
  if (record.status === "conflicting") {
    return { action: "block", reason: `Source conflicts with: ${record.conflicts_with.join(", ")}` };
  }
  if (record.status === "stale" || record.status === "superseded" || record.freshness === "stale") {
    return { action: "block", reason: `Source is ${record.status}/${record.freshness} and must be refreshed before use.` };
  }
  if (record.status === "unverified" || record.freshness === "aging" || record.freshness === "unknown") {
    return { action: "warn", reason: "Source is usable only with explicit caveat or refresh follow-up." };
  }
  return { action: "pass", reason: "Source is active and fresh enough for the selected decision." };
}

export function buildKrnSourceCheck(args: SourceCheckArgs, now = new Date()): KrnSourceCheck {
  const targetRoot = resolve(args.target);
  const contextPath = resolve(args.context);
  const graphPath = resolve(args.graph);
  const context = parseKrnContextPacket(readJson(contextPath));
  const graph = parseKrnSourceGraph(readJson(graphPath));
  const runId = createRunId(now);
  const runtimeReportPath = `.krn/sources/${runId}/source-check.json`;
  const recordsByRef = new Map(graph.records.map((record) => [record.ref, record]));
  const checkedRefs: KrnSourceCheck["checked_refs"] = context.source_refs.map((ref) => {
    const record = recordsByRef.get(ref);
    if (!record) {
      return {
        ref,
        source_id: null,
        status: "missing",
        freshness: "missing",
        confidence: null,
        action: "block",
        reason: "Context packet selected a source ref that is missing from the source graph.",
      };
    }

    return {
      ref,
      source_id: record.id,
      status: record.status,
      freshness: record.freshness,
      confidence: record.confidence,
      ...sourceAction(record),
    };
  });
  const blockedRefs = checkedRefs.filter((checked) => checked.action === "block").map((checked) => checked.ref);
  const warningRefs = checkedRefs.filter((checked) => checked.action === "warn").map((checked) => checked.ref);
  const missingRefs = checkedRefs.filter((checked) => checked.status === "missing").map((checked) => checked.ref);
  const decision = blockedRefs.length > 0 ? "block" : warningRefs.length > 0 ? "warn" : "pass";

  const candidate: unknown = {
    schema_version: "krn-source-check.v1",
    kind: "krn_source_check",
    run_id: runId,
    created_at: now.toISOString(),
    target_root: targetRoot,
    command: "krn sources check",
    context_packet_ref: contextPath,
    source_graph_ref: graphPath,
    checked_refs: checkedRefs,
    blocked_refs: blockedRefs,
    warning_refs: warningRefs,
    missing_refs: missingRefs,
    decision,
    required_actions: checkedRefs
      .filter((checked) => checked.action !== "pass")
      .map((checked) => `Resolve ${checked.ref}: ${checked.reason}`),
    runtime_report_path: runtimeReportPath,
    source_refs: [...new Set([...graph.source_refs, ...context.source_refs])],
    overclaim_boundary:
      "This source check proves selected context source refs were checked against one local source graph. It does not prove global source quality, web freshness, productivity lift, or dashboard readiness.",
    interpretation_caveat:
      "The source graph is a typed local adapter and testable policy boundary. It is not the final cloud/API source service.",
  };

  return parseKrnSourceCheck(candidate);
}

export function writeKrnSourceCheck(targetInput: string, report: KrnSourceCheck): string {
  const targetRoot = resolve(targetInput);
  const reportDir = resolve(targetRoot, ".krn", "sources", report.run_id);
  const reportPath = resolve(reportDir, "source-check.json");

  mkdirSync(reportDir, { recursive: true });
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  return reportPath;
}
