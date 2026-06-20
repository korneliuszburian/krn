import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, relative, resolve } from "node:path";
import {
  parseDoctorReport,
  parseInitManifest,
  parseKrnEvalReport,
  parseKrnReviewReport,
  type DoctorCheck,
  type DoctorReport,
  type EvalModuleResult,
  type InitManifest,
  type KrnEvalReport,
  type KrnReviewReport,
  type ReviewArtifact,
  type ReviewFinding,
  type ReviewProposal,
} from "@krn/contracts";

type CliResult = {
  exitCode: number;
  stdout: string;
  stderr: string;
};

type InitArgs = {
  target: string;
};

type DoctorArgs = {
  target: string;
};

type EvalArgs = {
  target: string;
  modules: string[];
};

type ReviewArgs = {
  target: string;
};

type EvalModuleDescriptor = {
  moduleId: string;
  command: readonly string[];
  sourceRefs: readonly string[];
};

type ModuleReportSummary = {
  total_cases: number;
  passed_cases: number;
  failed_cases: number;
  case_pass_rate: number;
  total_assertions: number;
  passed_assertions: number;
  failed_assertions: number;
  assertion_pass_rate: number;
  interpretation_caveat: string;
};

const DETECTED_PATHS = [
  { path: "AGENTS.md", expectedKind: "file" },
  { path: ".codex", expectedKind: "directory" },
  { path: ".agents", expectedKind: "directory" },
  { path: "docs/memory/INDEX.md", expectedKind: "file" },
  { path: ".krn", expectedKind: "directory" },
] as const;

const EVAL_MODULES: EvalModuleDescriptor[] = [
  {
    moduleId: "krn-init-contracts",
    command: ["pnpm", "run", "eval:krn-init"],
    sourceRefs: ["docs/evals/krn-init-contracts/README.md", "docs/specs/krn-init/README.md"],
  },
  {
    moduleId: "krn-doctor-contracts",
    command: ["pnpm", "run", "eval:krn-doctor"],
    sourceRefs: ["docs/evals/krn-doctor-contracts/README.md", "docs/specs/krn-doctor/README.md"],
  },
  {
    moduleId: "krn-review-contracts",
    command: ["pnpm", "run", "eval:krn-review"],
    sourceRefs: ["docs/evals/krn-review-contracts/README.md", "docs/specs/krn-review/README.md"],
  },
  {
    moduleId: "krn-mcp-read-model",
    command: ["pnpm", "run", "eval:krn-mcp"],
    sourceRefs: ["docs/evals/krn-mcp-read-model/README.md", "docs/specs/krn-mcp-read-model/README.md"],
  },
  {
    moduleId: "krn-mcp-transport",
    command: ["pnpm", "run", "eval:krn-mcp-transport"],
    sourceRefs: ["docs/evals/krn-mcp-transport/README.md", "docs/specs/krn-mcp-read-model/README.md"],
  },
  {
    moduleId: "krn-proposal-store",
    command: ["pnpm", "run", "eval:krn-proposal-store"],
    sourceRefs: ["docs/evals/krn-proposal-store/README.md", "docs/specs/krn-control-plane-proposal/README.md"],
  },
  {
    moduleId: "krn-mcp-proposal-tool",
    command: ["pnpm", "run", "eval:krn-mcp-proposal-tool"],
    sourceRefs: ["docs/evals/krn-mcp-proposal-tool/README.md", "docs/specs/krn-mcp-proposal-tool/README.md"],
  },
  {
    moduleId: "krn-pending-review-view-model",
    command: ["pnpm", "run", "eval:krn-pending-review-view-model"],
    sourceRefs: [
      "docs/evals/krn-pending-review-view-model/README.md",
      "docs/specs/krn-pending-review-view-model/README.md",
    ],
  },
  {
    moduleId: "krn-dashboard-pending-review-ui",
    command: ["pnpm", "run", "eval:krn-dashboard-pending-review-ui"],
    sourceRefs: [
      "docs/evals/krn-dashboard-pending-review-ui/README.md",
      "docs/goals/goal-012.md",
      "apps/dashboard/package.json",
    ],
  },
  {
    moduleId: "krn-dashboard-promotion-review-ui",
    command: ["pnpm", "run", "eval:krn-dashboard-promotion-review-ui"],
    sourceRefs: [
      "docs/evals/krn-dashboard-promotion-review-ui/README.md",
      "docs/specs/krn-promotion-review-view-model/README.md",
      "docs/goals/goal-015.md",
    ],
  },
  {
    moduleId: "krn-dashboard-eval-runs-ui",
    command: ["pnpm", "run", "eval:krn-dashboard-eval-runs-ui"],
    sourceRefs: [
      "docs/evals/krn-dashboard-eval-runs-ui/README.md",
      "docs/specs/krn-eval-runs-view-model/README.md",
      "docs/goals/goal-016.md",
    ],
  },
  {
    moduleId: "krn-proposal-review-decision",
    command: ["pnpm", "run", "eval:krn-proposal-review-decision"],
    sourceRefs: [
      "docs/evals/krn-proposal-review-decision/README.md",
      "docs/specs/krn-proposal-review-decision/README.md",
      "docs/goals/goal-013.md",
    ],
  },
  {
    moduleId: "krn-proposal-promotion",
    command: ["pnpm", "run", "eval:krn-proposal-promotion"],
    sourceRefs: [
      "docs/evals/krn-proposal-promotion/README.md",
      "docs/specs/krn-proposal-promotion/README.md",
      "docs/goals/goal-014.md",
    ],
  },
  {
    moduleId: "krn-benchmark-spine",
    command: ["pnpm", "run", "eval:krn-benchmark-spine"],
    sourceRefs: [
      "docs/evals/krn-benchmark-spine/README.md",
      "docs/specs/krn-benchmark-report/README.md",
      "docs/goals/goal-017.md",
    ],
  },
  {
    moduleId: "krn-dashboard-benchmark-reports-ui",
    command: ["pnpm", "run", "eval:krn-dashboard-benchmark-reports-ui"],
    sourceRefs: [
      "docs/evals/krn-dashboard-benchmark-reports-ui/README.md",
      "docs/specs/krn-benchmark-reports-view-model/README.md",
      "docs/goals/goal-019.md",
    ],
  },
  {
    moduleId: "krn-benchmark-live-suite",
    command: ["pnpm", "run", "eval:krn-benchmark-live-suite"],
    sourceRefs: [
      "docs/evals/krn-benchmark-live-suite/README.md",
      "docs/evals/krn-benchmark-live-suite/tasks.json",
      "docs/goals/goal-020.md",
    ],
  },
];

function usage(): string {
  return "Usage: krn <command>\n\nCommands:\n  init --dry-run [--target <path>]\n  doctor [--target <path>]\n  eval [--target <path>] [--module <module-id>]\n  review [--target <path>]\n";
}

function parseInitArgs(argv: readonly string[]): InitArgs {
  if (argv[0] !== "init") {
    throw new Error("Expected command: init");
  }

  let target = ".";
  let sawDryRun = false;

  for (let index = 1; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--dry-run") {
      sawDryRun = true;
      continue;
    }

    if (arg === "--target") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error("Missing value for --target");
      }
      target = value;
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg ?? "<empty>"}`);
  }

  if (!sawDryRun) {
    throw new Error("krn init currently requires --dry-run");
  }

  return { target };
}

function parseDoctorArgs(argv: readonly string[]): DoctorArgs {
  if (argv[0] !== "doctor") {
    throw new Error("Expected command: doctor");
  }

  let target = ".";

  for (let index = 1; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--target") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error("Missing value for --target");
      }
      target = value;
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg ?? "<empty>"}`);
  }

  return { target };
}

function parseEvalArgs(argv: readonly string[]): EvalArgs {
  if (argv[0] !== "eval") {
    throw new Error("Expected command: eval");
  }

  let target = ".";
  const modules: string[] = [];

  for (let index = 1; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--target") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error("Missing value for --target");
      }
      target = value;
      index += 1;
      continue;
    }

    if (arg === "--module") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error("Missing value for --module");
      }
      modules.push(value);
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg ?? "<empty>"}`);
  }

  return { target, modules };
}

function parseReviewArgs(argv: readonly string[]): ReviewArgs {
  if (argv[0] !== "review") {
    throw new Error("Expected command: review");
  }

  let target = ".";

  for (let index = 1; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--target") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error("Missing value for --target");
      }
      target = value;
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg ?? "<empty>"}`);
  }

  return { target };
}

function pathKind(targetRoot: string, relativePath: string): "file" | "directory" | "missing" {
  const absolutePath = resolve(targetRoot, relativePath);
  if (!existsSync(absolutePath)) {
    return "missing";
  }

  const stats = statSync(absolutePath);
  if (stats.isDirectory()) {
    return "directory";
  }

  return "file";
}

function artifactReason(relativePath: string, exists: boolean): string {
  if (!exists) {
    return `${relativePath} is not present in the target project.`;
  }

  switch (relativePath) {
    case "AGENTS.md":
      return "Root agent instructions already exist and must not be overwritten.";
    case ".codex":
      return "Project-local Codex configuration or hooks already exist.";
    case ".agents":
      return "Repo-local operator skills already exist.";
    case "docs/memory/INDEX.md":
      return "Reviewed memory index already exists.";
    case ".krn":
      return "KRN runtime artifact directory already exists.";
    default:
      return `${relativePath} exists in the target project.`;
  }
}

function plannedAction(exists: boolean): "create" | "skip" | "proposal_only" {
  return exists ? "skip" : "create";
}

function collisionStrategy(exists: boolean): "skip" | "merge_required" | "proposal_only" {
  return exists ? "skip" : "proposal_only";
}

function createRunId(now: Date): string {
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  return `${stamp}-${process.pid}`;
}

function buildInitManifest(targetInput: string, now = new Date()): InitManifest {
  const targetRoot = resolve(targetInput);
  const runId = createRunId(now);
  const runtimeManifestPath = `.krn/init/${runId}/manifest.json`;

  const detectedArtifacts = DETECTED_PATHS.map((artifact) => {
    const kind = pathKind(targetRoot, artifact.path);
    const exists = kind !== "missing";

    return {
      path: artifact.path,
      kind,
      exists,
      reason: artifactReason(artifact.path, exists),
    };
  });

  const agentsExists = detectedArtifacts.find((artifact) => artifact.path === "AGENTS.md")?.exists ?? false;
  const memoryIndexExists =
    detectedArtifacts.find((artifact) => artifact.path === "docs/memory/INDEX.md")?.exists ?? false;

  const candidateManifest: unknown = {
    schema_version: "krn-init-manifest.v1",
    kind: "krn_init_manifest",
    run_id: runId,
    created_at: now.toISOString(),
    target_root: targetRoot,
    mode: "dry-run",
    project_profile: {
      schema_version: "product-spine.v1",
      id: basename(targetRoot) || "target-project",
      kind: "project_profile",
      status: "draft",
      project_name: basename(targetRoot) || "target-project",
      identity: "Target project inspected by KRN init dry-run.",
      product_boundary: "KRN init reports planned setup only; it does not mutate target project files.",
      current_phase: "Slice 2 Typed Runtime Spine",
      source_refs: [
        "docs/goals/goal-006.md",
        "docs/goals/goal-007.md",
        "docs/specs/krn-init/README.md",
      ],
      guardrails: [
        "dry-run only",
        "schema-backed manifest",
        "no target setup mutation by default",
        "runtime artifacts stay under .krn/",
      ],
      next_allowed_surfaces: ["packages/contracts", "packages/cli", "packages/evals"],
      blocked_surfaces: ["packages/mcp", "apps/dashboard", "runtime skills"],
    },
    detected_artifacts: detectedArtifacts,
    planned_files: [
      {
        path: "AGENTS.md",
        action: plannedAction(agentsExists),
        reason: agentsExists
          ? "Existing root instructions are preserved; KRN init must not overwrite them."
          : "KRN would propose a minimal AGENTS.md selector in a future reviewed write flow.",
        source_refs: ["AGENTS.md", "docs/memory/INDEX.md", "docs/goals/goal-007.md"],
      },
      {
        path: "docs/memory/INDEX.md",
        action: memoryIndexExists ? "proposal_only" : "create",
        reason: memoryIndexExists
          ? "Memory changes require review before becoming durable truth."
          : "KRN would propose a reviewed memory index in a future write flow.",
        source_refs: ["docs/memory/INDEX.md", "docs/product/final-product-plan.md"],
      },
      {
        path: runtimeManifestPath,
        action: "create",
        reason: "Dry-run runtime manifest is the only default write surface.",
        source_refs: ["docs/specs/krn-init/README.md", "docs/goals/goal-007.md"],
      },
    ],
    planned_runtime_dirs: [
      {
        path: ".krn/init",
        purpose: "Dry-run init manifests and local bootstrap runtime reports.",
      },
    ],
    collisions: [
      {
        path: "AGENTS.md",
        strategy: collisionStrategy(agentsExists),
        reason: agentsExists
          ? "Existing agent instructions must be reviewed instead of overwritten."
          : "No collision detected; future writes would still require an explicit write-mode contract.",
      },
      {
        path: "docs/memory/INDEX.md",
        strategy: memoryIndexExists ? "proposal_only" : "proposal_only",
        reason: memoryIndexExists
          ? "Memory index changes are durable and require review."
          : "Memory index creation would require review before becoming durable project truth.",
      },
    ],
    no_touch_paths: [".git", "node_modules", "AGENTS.md", ".codex", ".agents", "docs/memory"],
    source_refs: [
      "docs/goals/goal-006.md",
      "docs/goals/goal-007.md",
      "docs/specs/krn-init/README.md",
      "docs/product/final-product-plan.md",
    ],
    product_spine_refs: ["project_profile", "memory_entry", "source_claim", "eval_run", "proposal", "decision"],
    validation: {
      status: "valid",
      checks: [
        "schema-backed manifest",
        "dry-run mode only",
        "source refs present",
        "no-touch paths present",
      ],
    },
    interpretation_caveat:
      "This manifest proves dry-run contract behavior only; it does not prove productivity lift, write-mode safety, MCP readiness, or dashboard readiness.",
  };

  return parseInitManifest(candidateManifest);
}

function writeManifest(targetInput: string, manifest: InitManifest): string {
  const targetRoot = resolve(targetInput);
  const manifestDir = resolve(targetRoot, ".krn", "init", manifest.run_id);
  const manifestPath = resolve(manifestDir, "manifest.json");

  mkdirSync(manifestDir, { recursive: true });
  writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, "utf8");

  return manifestPath;
}

function countSkillContracts(targetRoot: string): number {
  const skillsRoot = resolve(targetRoot, ".agents", "skills");
  if (!existsSync(skillsRoot) || !statSync(skillsRoot).isDirectory()) {
    return 0;
  }

  return readdirSync(skillsRoot, { withFileTypes: true }).filter((entry) => {
    if (!entry.isDirectory()) {
      return false;
    }
    return existsSync(resolve(skillsRoot, entry.name, "SKILL.md"));
  }).length;
}

function countEvalCases(targetRoot: string): number {
  const evalsRoot = resolve(targetRoot, "docs", "evals");
  if (!existsSync(evalsRoot) || !statSync(evalsRoot).isDirectory()) {
    return 0;
  }

  return readdirSync(evalsRoot, { withFileTypes: true }).filter((entry) => {
    if (!entry.isDirectory()) {
      return false;
    }
    return existsSync(resolve(evalsRoot, entry.name, "cases.json"));
  }).length;
}

function doctorStatus(exists: boolean): "ready" | "warning" {
  return exists ? "ready" : "warning";
}

function summarizeChecks(checks: readonly DoctorCheck[]): { ready: number; warning: number; blocked: number } {
  return checks.reduce(
    (summary, check) => {
      summary[check.status] += 1;
      return summary;
    },
    { ready: 0, warning: 0, blocked: 0 },
  );
}

function overallStatus(summary: { ready: number; warning: number; blocked: number }): "ready" | "warning" | "blocked" {
  if (summary.blocked > 0) {
    return "blocked";
  }
  if (summary.warning > 0) {
    return "warning";
  }
  return "ready";
}

function buildDoctorReport(targetInput: string, now = new Date()): DoctorReport {
  const targetRoot = resolve(targetInput);
  const runId = createRunId(now);
  const runtimeReportPath = `.krn/doctor/${runId}/report.json`;
  const skillCount = countSkillContracts(targetRoot);
  const evalCount = countEvalCases(targetRoot);
  const hooksJsonExists = pathKind(targetRoot, ".codex/hooks.json") === "file";
  const compactHookExists = pathKind(targetRoot, ".codex/hooks/compact_continuity.py") === "file";
  const hooksReady = hooksJsonExists && compactHookExists;

  const checks: DoctorCheck[] = [
    {
      id: "agents-root-instructions",
      surface: "agents",
      path: "AGENTS.md",
      status: doctorStatus(pathKind(targetRoot, "AGENTS.md") === "file"),
      exists: pathKind(targetRoot, "AGENTS.md") === "file",
      summary:
        pathKind(targetRoot, "AGENTS.md") === "file"
          ? "Root AGENTS.md exists."
          : "Root AGENTS.md is missing.",
      source_refs: ["AGENTS.md", "docs/goals/goal-006.md"],
    },
    {
      id: "memory-index",
      surface: "memory",
      path: "docs/memory/INDEX.md",
      status: doctorStatus(pathKind(targetRoot, "docs/memory/INDEX.md") === "file"),
      exists: pathKind(targetRoot, "docs/memory/INDEX.md") === "file",
      summary:
        pathKind(targetRoot, "docs/memory/INDEX.md") === "file"
          ? "Repo-local memory index exists."
          : "Repo-local memory index is missing.",
      source_refs: ["docs/memory/INDEX.md", "docs/goals/goal-006.md"],
    },
    {
      id: "operator-skills",
      surface: "skills",
      path: ".agents/skills",
      status: doctorStatus(skillCount > 0),
      exists: skillCount > 0,
      summary:
        skillCount > 0
          ? `${skillCount} operator skill contracts are present.`
          : "No operator skill contracts were found.",
      source_refs: ["docs/skills/operator-pipeline.md", "docs/goals/goal-006.md"],
    },
    {
      id: "compact-hooks",
      surface: "hooks",
      path: ".codex/hooks.json",
      status: doctorStatus(hooksReady),
      exists: hooksReady,
      summary: hooksReady
        ? "Project-local compact continuity hook files are present."
        : "Compact continuity hook config or script is missing.",
      source_refs: ["docs/memory/openai-codex/2026-06-19--compact-hooks-continuity.md", "docs/goals/goal-006.md"],
    },
    {
      id: "eval-modules",
      surface: "evals",
      path: "docs/evals",
      status: doctorStatus(evalCount > 0),
      exists: evalCount > 0,
      summary: evalCount > 0 ? `${evalCount} eval modules with cases are present.` : "No eval module cases were found.",
      source_refs: ["docs/evals/README.md", "docs/evals/STANDARD.md"],
    },
    {
      id: "runtime-artifacts",
      surface: "runtime",
      path: ".krn",
      status: doctorStatus(pathKind(targetRoot, ".krn") === "directory"),
      exists: pathKind(targetRoot, ".krn") === "directory",
      summary:
        pathKind(targetRoot, ".krn") === "directory"
          ? "KRN runtime artifact directory exists."
          : "KRN runtime artifact directory is missing and will be created for this report.",
      source_refs: ["docs/goals/goal-006.md", "docs/specs/krn-doctor/README.md"],
    },
  ];

  const summary = summarizeChecks(checks);
  const candidateReport: unknown = {
    schema_version: "krn-doctor-report.v1",
    kind: "krn_doctor_report",
    run_id: runId,
    created_at: now.toISOString(),
    target_root: targetRoot,
    command: "krn doctor",
    overall_status: overallStatus(summary),
    checks,
    summary,
    runtime_report_path: runtimeReportPath,
    source_refs: ["docs/goals/goal-006.md", "docs/specs/krn-doctor/README.md", "docs/product/final-product-plan.md"],
    interpretation_caveat:
      "This report proves local readiness surface detection only; it does not prove productivity lift, hook semantic correctness, API/MCP readiness, or dashboard readiness.",
  };

  return parseDoctorReport(candidateReport);
}

function writeDoctorReport(targetInput: string, report: DoctorReport): string {
  const targetRoot = resolve(targetInput);
  const reportDir = resolve(targetRoot, ".krn", "doctor", report.run_id);
  const reportPath = resolve(reportDir, "report.json");

  mkdirSync(reportDir, { recursive: true });
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  return reportPath;
}

function readJsonFile(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8")) as unknown;
}

function stringField(record: Record<string, unknown>, key: string): string {
  const value = record[key];
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`Module report missing string field: ${key}`);
  }
  return value;
}

function numberField(record: Record<string, unknown>, key: string): number {
  const value = record[key];
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new Error(`Module report missing numeric field: ${key}`);
  }
  return value;
}

function parseModuleReportSummary(input: unknown): ModuleReportSummary {
  if (!input || typeof input !== "object") {
    throw new Error("Module report must be an object");
  }

  const record = input as Record<string, unknown>;

  return {
    total_cases: numberField(record, "total_cases"),
    passed_cases: numberField(record, "passed_cases"),
    failed_cases: numberField(record, "failed_cases"),
    case_pass_rate: numberField(record, "case_pass_rate"),
    total_assertions: numberField(record, "total_assertions"),
    passed_assertions: numberField(record, "passed_assertions"),
    failed_assertions: numberField(record, "failed_assertions"),
    assertion_pass_rate: numberField(record, "assertion_pass_rate"),
    interpretation_caveat: stringField(record, "interpretation_caveat"),
  };
}

function extractReportPath(output: string): string {
  const reportLine = output
    .split(/\r?\n/)
    .reverse()
    .find((line) => line.startsWith("report: "));

  if (!reportLine) {
    throw new Error("Eval module output did not include a report path");
  }

  return reportLine.replace(/^report:\s*/, "").trim();
}

function toTargetRelativePath(targetRoot: string, absolutePath: string): string {
  const relativePath = relative(targetRoot, absolutePath).replaceAll("\\", "/");
  if (relativePath.length > 0 && !relativePath.startsWith("..") && !relativePath.startsWith("/")) {
    return relativePath;
  }
  return absolutePath;
}

function selectEvalModules(moduleIds: readonly string[]): EvalModuleDescriptor[] {
  if (moduleIds.length === 0) {
    return EVAL_MODULES;
  }

  return moduleIds.map((moduleId) => {
    const descriptor = EVAL_MODULES.find((module) => module.moduleId === moduleId);
    if (!descriptor) {
      throw new Error(`Unknown eval module: ${moduleId}`);
    }
    return descriptor;
  });
}

function runEvalModule(targetRoot: string, descriptor: EvalModuleDescriptor): EvalModuleResult {
  const [command, ...args] = descriptor.command;
  if (!command) {
    throw new Error(`Eval module ${descriptor.moduleId} has no command`);
  }

  try {
    const output = execFileSync(command, args, {
      cwd: targetRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    const reportPath = extractReportPath(output);
    const summary = parseModuleReportSummary(readJsonFile(reportPath));
    const status = summary.failed_cases === 0 ? "passed" : "failed";

    return {
      module_id: descriptor.moduleId,
      command: [...descriptor.command],
      status,
      report_path: toTargetRelativePath(targetRoot, reportPath),
      ...summary,
      source_refs: [...descriptor.sourceRefs],
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "unknown eval module error";

    return {
      module_id: descriptor.moduleId,
      command: [...descriptor.command],
      status: "error",
      report_path: null,
      total_cases: 0,
      passed_cases: 0,
      failed_cases: 0,
      case_pass_rate: 0,
      total_assertions: 0,
      passed_assertions: 0,
      failed_assertions: 0,
      assertion_pass_rate: 0,
      source_refs: [...descriptor.sourceRefs],
      interpretation_caveat: `The eval module failed before KRN could parse its report: ${message}`,
    };
  }
}

function summarizeEvalModules(modules: readonly EvalModuleResult[]): KrnEvalReport["summary"] {
  return modules.reduce(
    (summary, moduleResult) => {
      summary.total_modules += 1;
      if (moduleResult.status === "passed") {
        summary.passed_modules += 1;
      } else {
        summary.failed_modules += 1;
      }
      summary.total_cases += moduleResult.total_cases;
      summary.passed_cases += moduleResult.passed_cases;
      summary.failed_cases += moduleResult.failed_cases;
      summary.total_assertions += moduleResult.total_assertions;
      summary.passed_assertions += moduleResult.passed_assertions;
      summary.failed_assertions += moduleResult.failed_assertions;
      return summary;
    },
    {
      total_modules: 0,
      passed_modules: 0,
      failed_modules: 0,
      total_cases: 0,
      passed_cases: 0,
      failed_cases: 0,
      total_assertions: 0,
      passed_assertions: 0,
      failed_assertions: 0,
    },
  );
}

function evalOverallStatus(modules: readonly EvalModuleResult[]): "passed" | "failed" | "error" {
  if (modules.some((moduleResult) => moduleResult.status === "error")) {
    return "error";
  }
  if (modules.some((moduleResult) => moduleResult.status === "failed")) {
    return "failed";
  }
  return "passed";
}

function buildKrnEvalReport(args: EvalArgs, now = new Date()): KrnEvalReport {
  const targetRoot = resolve(args.target);
  const runId = createRunId(now);
  const runtimeReportPath = `.krn/eval/${runId}/report.json`;
  const selectedModules = selectEvalModules(args.modules);
  const modules = selectedModules.map((module) => runEvalModule(targetRoot, module));
  const summary = summarizeEvalModules(modules);

  const candidateReport: unknown = {
    schema_version: "krn-eval-report.v1",
    kind: "krn_eval_report",
    run_id: runId,
    created_at: now.toISOString(),
    target_root: targetRoot,
    command: "krn eval",
    mode: "validate",
    overall_status: evalOverallStatus(modules),
    modules,
    summary,
    runtime_report_path: runtimeReportPath,
    source_refs: [
      "docs/goals/goal-006.md",
      "docs/specs/krn-eval/README.md",
      "docs/evals/STANDARD.md",
      "docs/product/final-product-plan.md",
    ],
    interpretation_caveat:
      "This report proves local deterministic eval execution and aggregation only; it does not prove productivity lift, benchmark lift, API/MCP readiness, complete dashboard readiness, or human approval quality.",
  };

  return parseKrnEvalReport(candidateReport);
}

function writeKrnEvalReport(targetInput: string, report: KrnEvalReport): string {
  const targetRoot = resolve(targetInput);
  const reportDir = resolve(targetRoot, ".krn", "eval", report.run_id);
  const reportPath = resolve(reportDir, "report.json");

  mkdirSync(reportDir, { recursive: true });
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  return reportPath;
}

function latestRuntimeFile(targetRoot: string, runtimeDir: string, fileName: string): string | null {
  const absoluteRuntimeDir = resolve(targetRoot, runtimeDir);
  if (!existsSync(absoluteRuntimeDir) || !statSync(absoluteRuntimeDir).isDirectory()) {
    return null;
  }

  const candidates = readdirSync(absoluteRuntimeDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => resolve(absoluteRuntimeDir, entry.name, fileName))
    .filter((candidatePath) => existsSync(candidatePath) && statSync(candidatePath).isFile())
    .sort();

  return candidates.at(-1) ?? null;
}

function artifactPathForEvidence(path: string | null): string[] {
  if (!path) {
    return [];
  }
  return [path];
}

function reviewArtifact(
  id: string,
  kind: ReviewArtifact["kind"],
  status: ReviewArtifact["status"],
  path: string | null,
  summary: string,
  sourceRefs: readonly string[],
): ReviewArtifact {
  return {
    id,
    kind,
    status,
    path,
    summary,
    source_refs: [...sourceRefs],
  };
}

function buildInitReviewArtifact(targetRoot: string): ReviewArtifact {
  const manifestPath = latestRuntimeFile(targetRoot, ".krn/init", "manifest.json");
  if (!manifestPath) {
    return reviewArtifact(
      "latest-init-manifest",
      "init_manifest",
      "missing",
      null,
      "No init dry-run manifest was found.",
      ["docs/specs/krn-init/README.md", "docs/goals/goal-006.md"],
    );
  }

  try {
    const manifest = parseInitManifest(readJsonFile(manifestPath));
    return reviewArtifact(
      "latest-init-manifest",
      "init_manifest",
      "present",
      toTargetRelativePath(targetRoot, manifestPath),
      `Latest init manifest ${manifest.run_id} parsed in ${manifest.mode} mode.`,
      ["docs/specs/krn-init/README.md", "docs/goals/goal-006.md"],
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "unknown parse error";
    return reviewArtifact(
      "latest-init-manifest",
      "init_manifest",
      "invalid",
      toTargetRelativePath(targetRoot, manifestPath),
      `Latest init manifest could not be parsed: ${message}`,
      ["docs/specs/krn-init/README.md", "docs/goals/goal-006.md"],
    );
  }
}

function buildDoctorReviewArtifact(targetRoot: string): ReviewArtifact {
  const reportPath = latestRuntimeFile(targetRoot, ".krn/doctor", "report.json");
  if (!reportPath) {
    return reviewArtifact(
      "latest-doctor-report",
      "doctor_report",
      "missing",
      null,
      "No doctor readiness report was found.",
      ["docs/specs/krn-doctor/README.md", "docs/goals/goal-006.md"],
    );
  }

  try {
    const report = parseDoctorReport(readJsonFile(reportPath));
    return reviewArtifact(
      "latest-doctor-report",
      "doctor_report",
      "present",
      toTargetRelativePath(targetRoot, reportPath),
      `Latest doctor report ${report.run_id} parsed with overall status ${report.overall_status}.`,
      ["docs/specs/krn-doctor/README.md", "docs/goals/goal-006.md"],
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "unknown parse error";
    return reviewArtifact(
      "latest-doctor-report",
      "doctor_report",
      "invalid",
      toTargetRelativePath(targetRoot, reportPath),
      `Latest doctor report could not be parsed: ${message}`,
      ["docs/specs/krn-doctor/README.md", "docs/goals/goal-006.md"],
    );
  }
}

function buildEvalReviewArtifact(targetRoot: string): ReviewArtifact {
  const reportPath = latestRuntimeFile(targetRoot, ".krn/eval", "report.json");
  if (!reportPath) {
    return reviewArtifact(
      "latest-eval-report",
      "eval_report",
      "missing",
      null,
      "No aggregate eval report was found.",
      ["docs/specs/krn-eval/README.md", "docs/goals/goal-006.md"],
    );
  }

  try {
    const report = parseKrnEvalReport(readJsonFile(reportPath));
    return reviewArtifact(
      "latest-eval-report",
      "eval_report",
      "present",
      toTargetRelativePath(targetRoot, reportPath),
      `Latest eval aggregate ${report.run_id} parsed with ${report.summary.passed_modules}/${report.summary.total_modules} modules passing.`,
      ["docs/specs/krn-eval/README.md", "docs/goals/goal-006.md"],
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "unknown parse error";
    return reviewArtifact(
      "latest-eval-report",
      "eval_report",
      "invalid",
      toTargetRelativePath(targetRoot, reportPath),
      `Latest aggregate eval report could not be parsed: ${message}`,
      ["docs/specs/krn-eval/README.md", "docs/goals/goal-006.md"],
    );
  }
}

function buildReviewFindings(artifacts: readonly ReviewArtifact[]): ReviewFinding[] {
  const findings: ReviewFinding[] = [];

  for (const artifact of artifacts) {
    if (artifact.status === "present") {
      findings.push({
        id: `${artifact.id}-present`,
        severity: "info",
        artifact_id: artifact.id,
        summary: artifact.summary,
        evidence_refs: artifactPathForEvidence(artifact.path),
        source_refs: artifact.source_refs,
      });
      continue;
    }

    findings.push({
      id: `${artifact.id}-${artifact.status}`,
      severity: artifact.status === "missing" ? "warning" : "blocking",
      artifact_id: artifact.id,
      summary: artifact.summary,
      evidence_refs: artifactPathForEvidence(artifact.path),
      source_refs: artifact.source_refs,
    });
  }

  return findings;
}

function proposal(
  id: string,
  proposalType: ReviewProposal["proposal_type"],
  title: string,
  rationale: string,
  evidenceRefs: readonly string[],
  sourceRefs: readonly string[],
  blockedSurfaces: readonly string[],
): ReviewProposal {
  return {
    id,
    proposal_type: proposalType,
    status: "proposal_only",
    title,
    rationale,
    evidence_refs: [...evidenceRefs],
    source_refs: [...sourceRefs],
    blocked_surfaces: [...blockedSurfaces],
  };
}

function buildReviewProposals(artifacts: readonly ReviewArtifact[]): ReviewProposal[] {
  const evidenceRefs = artifacts.flatMap((artifact) => (artifact.path ? [artifact.path] : []));
  const proposals: ReviewProposal[] = [];
  const missingOrInvalid = artifacts.filter((artifact) => artifact.status !== "present");

  if (missingOrInvalid.length > 0) {
    proposals.push(
      proposal(
        "repair-missing-runtime-evidence",
        "repair_record",
        "Regenerate missing or invalid Slice 2 runtime evidence before promotion.",
        "KRN review cannot promote runtime evidence when one or more required artifacts are missing or invalid.",
        missingOrInvalid.map((artifact) => artifact.id),
        ["docs/goals/goal-006.md", "docs/evals/STANDARD.md"],
        ["packages/mcp", "apps/dashboard", "runtime skills"],
      ),
    );
  } else {
    proposals.push(
      proposal(
        "promote-slice-2-runtime-evidence",
        "source_claim_update",
        "Review and promote Slice 2 runtime evidence into the source ledger.",
        "The latest init, doctor, and eval runtime artifacts all parse through KRN contracts; a human should review before durable promotion.",
        evidenceRefs,
        ["docs/goals/goal-006.md", "docs/plans/canonical/SOURCES.md"],
        ["packages/mcp", "apps/dashboard", "runtime skills"],
      ),
    );
    proposals.push(
      proposal(
        "advance-after-human-review",
        "next_action",
        "After human review, start Slice 3 with a read-only MCP/API resource contract.",
        "Slice 3 must consume real typed runtime reports and stay read-only/proposal-only at first.",
        evidenceRefs,
        ["docs/goals/goal-006.md", "docs/product/final-product-plan.md"],
        ["destructive MCP tools", "dashboard mocked state", "runtime skills"],
      ),
    );
  }

  return proposals;
}

function summarizeReview(artifacts: readonly ReviewArtifact[], findings: readonly ReviewFinding[], proposals: readonly ReviewProposal[]): KrnReviewReport["summary"] {
  return {
    total_artifacts: artifacts.length,
    present_artifacts: artifacts.filter((artifact) => artifact.status === "present").length,
    missing_artifacts: artifacts.filter((artifact) => artifact.status === "missing").length,
    invalid_artifacts: artifacts.filter((artifact) => artifact.status === "invalid").length,
    findings: findings.length,
    blocking_findings: findings.filter((finding) => finding.severity === "blocking").length,
    proposals: proposals.length,
  };
}

function reviewOverallStatus(summary: KrnReviewReport["summary"]): "ready_for_human_review" | "needs_attention" | "blocked" {
  if (summary.blocking_findings > 0 || summary.invalid_artifacts > 0) {
    return "blocked";
  }
  if (summary.missing_artifacts > 0) {
    return "needs_attention";
  }
  return "ready_for_human_review";
}

function buildKrnReviewReport(targetInput: string, now = new Date()): KrnReviewReport {
  const targetRoot = resolve(targetInput);
  const runId = createRunId(now);
  const runtimeReportPath = `.krn/review/${runId}/report.json`;
  const artifacts = [
    buildInitReviewArtifact(targetRoot),
    buildDoctorReviewArtifact(targetRoot),
    buildEvalReviewArtifact(targetRoot),
  ];
  const findings = buildReviewFindings(artifacts);
  const proposals = buildReviewProposals(artifacts);
  const summary = summarizeReview(artifacts, findings, proposals);

  const candidateReport: unknown = {
    schema_version: "krn-review-report.v1",
    kind: "krn_review_report",
    run_id: runId,
    created_at: now.toISOString(),
    target_root: targetRoot,
    command: "krn review",
    mode: "proposal-only",
    overall_status: reviewOverallStatus(summary),
    artifacts,
    findings,
    proposals,
    summary,
    no_touch_paths: ["AGENTS.md", ".codex", ".agents", "docs/memory", "docs/evals", "docs/plans"],
    runtime_report_path: runtimeReportPath,
    source_refs: [
      "docs/goals/goal-006.md",
      "docs/specs/krn-review/README.md",
      "docs/evals/STANDARD.md",
      "docs/product/final-product-plan.md",
    ],
    interpretation_caveat:
      "This report proposes human review actions from local runtime artifacts only; it does not approve memory/source changes, prove productivity lift, or unblock destructive API/MCP/dashboard behavior by itself.",
  };

  return parseKrnReviewReport(candidateReport);
}

function writeKrnReviewReport(targetInput: string, report: KrnReviewReport): string {
  const targetRoot = resolve(targetInput);
  const reportDir = resolve(targetRoot, ".krn", "review", report.run_id);
  const reportPath = resolve(reportDir, "report.json");

  mkdirSync(reportDir, { recursive: true });
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");

  return reportPath;
}

export function runKrnCli(argv: readonly string[] = process.argv.slice(2)): CliResult {
  const normalizedArgv = argv[0] === "--" ? argv.slice(1) : argv;

  if (normalizedArgv.length === 0 || normalizedArgv.includes("--help")) {
    return { exitCode: 0, stdout: usage(), stderr: "" };
  }

  try {
    if (normalizedArgv[0] === "init") {
      const args = parseInitArgs(normalizedArgv);
      const manifest = buildInitManifest(args.target);
      const manifestPath = writeManifest(args.target, manifest);
      return { exitCode: 0, stdout: `${manifestPath}\n`, stderr: "" };
    }

    if (normalizedArgv[0] === "doctor") {
      const args = parseDoctorArgs(normalizedArgv);
      const report = buildDoctorReport(args.target);
      const reportPath = writeDoctorReport(args.target, report);
      return { exitCode: 0, stdout: `${reportPath}\n`, stderr: "" };
    }

    if (normalizedArgv[0] === "eval") {
      const args = parseEvalArgs(normalizedArgv);
      const report = buildKrnEvalReport(args);
      const reportPath = writeKrnEvalReport(args.target, report);
      const exitCode = report.overall_status === "passed" ? 0 : 1;
      return { exitCode, stdout: `${reportPath}\n`, stderr: "" };
    }

    if (normalizedArgv[0] === "review") {
      const args = parseReviewArgs(normalizedArgv);
      const report = buildKrnReviewReport(args.target);
      const reportPath = writeKrnReviewReport(args.target, report);
      return { exitCode: 0, stdout: `${reportPath}\n`, stderr: "" };
    }

    throw new Error(`Unknown command: ${normalizedArgv[0] ?? "<empty>"}`);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown CLI error";
    return { exitCode: 1, stdout: "", stderr: `${message}\n${usage()}` };
  }
}

export function main(argv: readonly string[] = process.argv.slice(2)): void {
  const result = runKrnCli(argv);
  process.stdout.write(result.stdout);
  process.stderr.write(result.stderr);
  process.exitCode = result.exitCode;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
