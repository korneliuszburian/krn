import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { basename, relative, resolve } from "node:path";
import {
  parseDoctorReport,
  parseInitManifest,
  parseKrnEvalReport,
  parseKrnResearchPack,
  type DoctorCheck,
  type DoctorReport,
  type EvalLane,
  type EvalLaneSelection,
  type EvalModuleResult,
  type InitManifest,
  type KrnEvalReport,
  type KrnResearchPack,
  type SourceBudgetMode,
} from "@krn/contracts";
import { buildKrnOperatingBrief, writeKrnOperatingBrief, type BriefArgs } from "./brief.js";
import { buildKrnContextPacket, parseContextBuildArgs, writeKrnContextPacket } from "./context.js";
import { buildKrnEngineeringGate, parseKrnGateArgs, writeKrnEngineeringGate } from "./gate.js";
import { buildKrnReviewReport, writeKrnReviewReport } from "./review.js";
import { buildKrnSourceCheck, parseSourceCheckArgs, writeKrnSourceCheck } from "./source-graph.js";

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
  lane: EvalLaneSelection;
};

type ReviewArgs = {
  target: string;
};

type ResearchPackArgs = {
  target: string;
  question: string;
  decision: string;
  budget: SourceBudgetMode;
};

type EvalModuleDescriptor = {
  moduleId: string;
  lane: EvalLane;
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
    lane: "core",
    command: ["pnpm", "run", "eval:krn-init"],
    sourceRefs: ["docs/evals/krn-init-contracts/README.md", "docs/specs/krn-init/README.md"],
  },
  {
    moduleId: "krn-doctor-contracts",
    lane: "core",
    command: ["pnpm", "run", "eval:krn-doctor"],
    sourceRefs: ["docs/evals/krn-doctor-contracts/README.md", "docs/specs/krn-doctor/README.md"],
  },
  {
    moduleId: "krn-review-contracts",
    lane: "core",
    command: ["pnpm", "run", "eval:krn-review"],
    sourceRefs: ["docs/evals/krn-review-contracts/README.md", "docs/specs/krn-review/README.md"],
  },
  {
    moduleId: "krn-mcp-read-model",
    lane: "core",
    command: ["pnpm", "run", "eval:krn-mcp"],
    sourceRefs: ["docs/evals/krn-mcp-read-model/README.md", "docs/specs/krn-mcp-read-model/README.md"],
  },
  {
    moduleId: "krn-mcp-transport",
    lane: "core",
    command: ["pnpm", "run", "eval:krn-mcp-transport"],
    sourceRefs: ["docs/evals/krn-mcp-transport/README.md", "docs/specs/krn-mcp-read-model/README.md"],
  },
  {
    moduleId: "krn-proposal-store",
    lane: "current",
    command: ["pnpm", "run", "eval:krn-proposal-store"],
    sourceRefs: ["docs/evals/krn-proposal-store/README.md", "docs/specs/krn-control-plane-proposal/README.md"],
  },
  {
    moduleId: "krn-mcp-proposal-tool",
    lane: "current",
    command: ["pnpm", "run", "eval:krn-mcp-proposal-tool"],
    sourceRefs: ["docs/evals/krn-mcp-proposal-tool/README.md", "docs/specs/krn-mcp-proposal-tool/README.md"],
  },
  {
    moduleId: "krn-pending-review-view-model",
    lane: "current",
    command: ["pnpm", "run", "eval:krn-pending-review-view-model"],
    sourceRefs: [
      "docs/evals/krn-pending-review-view-model/README.md",
      "docs/specs/krn-pending-review-view-model/README.md",
    ],
  },
  {
    moduleId: "krn-dashboard-pending-review-ui",
    lane: "lab",
    command: ["pnpm", "run", "eval:krn-dashboard-pending-review-ui"],
    sourceRefs: [
      "docs/evals/krn-dashboard-pending-review-ui/README.md",
      "docs/goals/goal-012.md",
      "apps/dashboard/package.json",
    ],
  },
  {
    moduleId: "krn-dashboard-promotion-review-ui",
    lane: "lab",
    command: ["pnpm", "run", "eval:krn-dashboard-promotion-review-ui"],
    sourceRefs: [
      "docs/evals/krn-dashboard-promotion-review-ui/README.md",
      "docs/specs/krn-promotion-review-view-model/README.md",
      "docs/goals/goal-015.md",
    ],
  },
  {
    moduleId: "krn-dashboard-eval-runs-ui",
    lane: "lab",
    command: ["pnpm", "run", "eval:krn-dashboard-eval-runs-ui"],
    sourceRefs: [
      "docs/evals/krn-dashboard-eval-runs-ui/README.md",
      "docs/specs/krn-eval-runs-view-model/README.md",
      "docs/goals/goal-016.md",
    ],
  },
  {
    moduleId: "krn-proposal-review-decision",
    lane: "current",
    command: ["pnpm", "run", "eval:krn-proposal-review-decision"],
    sourceRefs: [
      "docs/evals/krn-proposal-review-decision/README.md",
      "docs/specs/krn-proposal-review-decision/README.md",
      "docs/goals/goal-013.md",
    ],
  },
  {
    moduleId: "krn-proposal-promotion",
    lane: "current",
    command: ["pnpm", "run", "eval:krn-proposal-promotion"],
    sourceRefs: [
      "docs/evals/krn-proposal-promotion/README.md",
      "docs/specs/krn-proposal-promotion/README.md",
      "docs/goals/goal-014.md",
    ],
  },
  {
    moduleId: "krn-benchmark-spine",
    lane: "lab",
    command: ["pnpm", "run", "eval:krn-benchmark-spine"],
    sourceRefs: [
      "docs/evals/krn-benchmark-spine/README.md",
      "docs/specs/krn-benchmark-report/README.md",
      "docs/goals/goal-017.md",
    ],
  },
  {
    moduleId: "krn-dashboard-benchmark-reports-ui",
    lane: "lab",
    command: ["pnpm", "run", "eval:krn-dashboard-benchmark-reports-ui"],
    sourceRefs: [
      "docs/evals/krn-dashboard-benchmark-reports-ui/README.md",
      "docs/specs/krn-benchmark-reports-view-model/README.md",
      "docs/goals/goal-019.md",
    ],
  },
  {
    moduleId: "krn-benchmark-live-suite",
    lane: "lab",
    command: ["pnpm", "run", "eval:krn-benchmark-live-suite"],
    sourceRefs: [
      "docs/evals/krn-benchmark-live-suite/README.md",
      "docs/evals/krn-benchmark-live-suite/tasks.json",
      "docs/goals/goal-020.md",
    ],
  },
  {
    moduleId: "krn-benchmark-live-stability",
    lane: "lab",
    command: ["pnpm", "run", "eval:krn-benchmark-live-stability"],
    sourceRefs: [
      "docs/evals/krn-benchmark-live-stability/README.md",
      "docs/evals/krn-benchmark-live-stability/cases.json",
      "docs/goals/goal-027.md",
    ],
  },
  {
    moduleId: "krn-benchmark-arena-contract",
    lane: "lab",
    command: ["pnpm", "run", "eval:krn-benchmark-arena-contract"],
    sourceRefs: [
      "docs/evals/krn-benchmark-arena-contract/README.md",
      "docs/evals/krn-benchmark-arena-contract/arena-contract.example.json",
      "docs/goals/goal-030.md",
    ],
  },
  {
    moduleId: "krn-benchmark-expanded-arena",
    lane: "lab",
    command: ["pnpm", "run", "eval:krn-benchmark-expanded-arena"],
    sourceRefs: [
      "docs/evals/krn-benchmark-expanded-arena/README.md",
      "docs/evals/krn-benchmark-expanded-arena/tasks.json",
      "docs/evals/krn-benchmark-expanded-arena/cases.json",
      "docs/evals/krn-benchmark-expanded-arena/fixtures/live-smoke-release-claim.md",
      "docs/goals/goal-034.md",
      "docs/goals/goal-033.md",
      "docs/goals/goal-032.md",
      "docs/goals/goal-031.md",
    ],
  },
  {
    moduleId: "krn-repair-record",
    lane: "lab",
    command: ["pnpm", "run", "eval:krn-repair-record"],
    sourceRefs: [
      "docs/evals/krn-repair-record/README.md",
      "docs/specs/krn-repair-record/README.md",
      "docs/goals/goal-021.md",
    ],
  },
  {
    moduleId: "krn-research-pack",
    lane: "lab",
    command: ["pnpm", "run", "eval:krn-research-pack"],
    sourceRefs: [
      "docs/evals/krn-research-pack/README.md",
      "docs/specs/krn-research-pack/README.md",
      "docs/goals/goal-036.md",
    ],
  },
];

function usage(): string {
  return "Usage: krn <command>\n\nCommands:\n  init --dry-run [--target <path>]\n  doctor [--target <path>]\n  eval [--target <path>] [--lane core|current|lab|all] [--module <module-id>]\n  review [--target <path>]\n  brief --task <text> [--path <path>] [--target <path>]\n  context build --task <text> [--path <path>] [--target <path>]\n  sources check --context <path> --graph <path> [--target <path>]\n  gate --task <text> [--path <path>] [--target <path>]\n  research-pack --question <text> --decision <text> [--budget quick|standard|deep] [--target <path>]\n";
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
  let lane: EvalLaneSelection = "current";

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

    if (arg === "--lane") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error("Missing value for --lane");
      }
      if (!["core", "current", "lab", "all"].includes(value)) {
        throw new Error(`Unknown eval lane: ${value}`);
      }
      lane = value as EvalLaneSelection;
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg ?? "<empty>"}`);
  }

  if (modules.length > 0) {
    return { target, modules, lane: "custom" };
  }

  return { target, modules, lane };
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

function parseBriefArgs(argv: readonly string[]): BriefArgs {
  if (argv[0] !== "brief") {
    throw new Error("Expected command: brief");
  }

  let target = ".";
  let task: string | null = null;
  let path: string | null = null;

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

    if (arg === "--task") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error("Missing value for --task");
      }
      task = value;
      index += 1;
      continue;
    }

    if (arg === "--path") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error("Missing value for --path");
      }
      path = value;
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

function parseResearchPackArgs(argv: readonly string[]): ResearchPackArgs {
  if (argv[0] !== "research-pack") {
    throw new Error("Expected command: research-pack");
  }

  let target = ".";
  let question: string | null = null;
  let decision: string | null = null;
  let budget: SourceBudgetMode = "standard";

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

    if (arg === "--question") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error("Missing value for --question");
      }
      question = value;
      index += 1;
      continue;
    }

    if (arg === "--decision") {
      const value = argv[index + 1];
      if (!value || value.startsWith("--")) {
        throw new Error("Missing value for --decision");
      }
      decision = value;
      index += 1;
      continue;
    }

    if (arg === "--budget") {
      const value = argv[index + 1];
      if (value !== "quick" && value !== "standard" && value !== "deep") {
        throw new Error("Missing or invalid value for --budget");
      }
      budget = value;
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg ?? "<empty>"}`);
  }

  if (!question) {
    throw new Error("Missing required --question");
  }

  if (!decision) {
    throw new Error("Missing required --decision");
  }

  return { target, question, decision, budget };
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
      current_phase: "Goal 038 Final Product Bootstrap",
      source_refs: [
        "docs/goals/goal-038.md",
        "docs/plans/canonical/draft.md",
        "docs/specs/krn-init/README.md",
      ],
      guardrails: [
        "dry-run only",
        "schema-backed manifest",
        "no target setup mutation by default",
        "runtime artifacts stay under .krn/",
        "repo files are bootstrap/audit/export substrate, not memory core",
      ],
      next_allowed_surfaces: ["AGENTS.md proposal", ".krn/config.toml proposal", ".krn/sources", ".krn/context", ".krn/evals"],
      blocked_surfaces: ["dashboard", "broad API/cloud sync", "benchmark expansion", "repo-local memory core"],
    },
    detected_artifacts: detectedArtifacts,
    planned_files: [
      {
        path: "AGENTS.md",
        action: plannedAction(agentsExists),
        reason: agentsExists
          ? "Existing root instructions are preserved; KRN init must not overwrite them."
          : "KRN would propose a minimal AGENTS.md selector in a future reviewed write flow.",
        source_refs: ["AGENTS.md", "docs/memory/INDEX.md", "docs/goals/goal-038.md"],
      },
      {
        path: "docs/memory/INDEX.md",
        action: memoryIndexExists ? "proposal_only" : "create",
        reason: memoryIndexExists
          ? "Pattern-bank changes require review and are not authoritative memory-core writes."
          : "KRN would propose a reviewed pattern-bank index in a future write flow.",
        source_refs: ["docs/memory/INDEX.md", "docs/goals/goal-038.md"],
      },
      {
        path: runtimeManifestPath,
        action: "create",
        reason: "Dry-run runtime manifest is the only default write surface.",
        source_refs: ["docs/specs/krn-init/README.md", "docs/goals/goal-038.md"],
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
          ? "Pattern-bank index changes are durable and require review."
          : "Pattern-bank index creation would require review before becoming durable project knowledge.",
      },
    ],
    bootstrap_plan: [
      {
        capability: "agent_instructions",
        path: "AGENTS.md",
        action: agentsExists ? "skip" : "proposal_only",
        purpose: "Create or preserve a thin Codex selector that points to active goal, memory index, and verification rules.",
        boundary: "AGENTS.md must stay a compact router, not a generated encyclopedia or memory database.",
        source_refs: ["AGENTS.md", "docs/goals/goal-038.md", "docs/memory/INDEX.md"],
      },
      {
        capability: "local_config",
        path: ".krn/config.toml",
        action: "proposal_only",
        purpose: "Describe local-first KRN project settings without requiring cloud/API sync.",
        boundary: "Config may point at stores and policies; it must not embed live memory records or current-goal truth.",
        source_refs: ["docs/goals/goal-038.md", "docs/plans/canonical/draft.md"],
      },
      {
        capability: "source_pointers",
        path: ".krn/sources/index.json",
        action: "proposal_only",
        purpose: "Point Codex/KRN at source graph entries used for source-backed planning and stale/conflict checks.",
        boundary: "Source pointers are indexes and lineage, not a copied bibliography or hardcoded active source list.",
        source_refs: ["docs/specs/krn-source-graph/README.md", "docs/plans/canonical/SOURCES.md"],
      },
      {
        capability: "context_pointers",
        path: ".krn/context/",
        action: "proposal_only",
        purpose: "Prepare the runtime directory for bounded context packets built from task intent, memory selection, and source refs.",
        boundary: "Context packets may record selected IDs and guidance; they must not store authoritative memory bodies.",
        source_refs: ["docs/specs/krn-context-packet/README.md", "docs/goals/goal-038.md"],
      },
      {
        capability: "eval_baseline",
        path: ".krn/evals/",
        action: "proposal_only",
        purpose: "Prepare a local eval baseline that uses the lean core/current path before explicit lab work.",
        boundary: "Green evals are regression evidence only; lab, benchmark, and dashboard checks stay explicit.",
        source_refs: ["docs/specs/krn-eval/README.md", "docs/evals/STANDARD.md"],
      },
      {
        capability: "skill_wiring",
        path: ".agents/skills/",
        action: "proposal_only",
        purpose: "Wire only required operator skills with owners, triggers, forbidden behavior, and verification.",
        boundary: "Skills are not prompt sprawl; missing triggers should produce evals or deletion decisions, not endless markdown.",
        source_refs: ["docs/goals/goal-038.md", "docs/plans/canonical/pattern-matrix.md"],
      },
      {
        capability: "policy_boundaries",
        path: ".krn/policies/",
        action: "proposal_only",
        purpose: "Prepare local policy hooks and approval boundaries for unsafe writes, memory writes, source acceptance, and command use.",
        boundary: "Policies can warn/block/propose; broad write-capable API or cloud sync requires later explicit audit/idempotency work.",
        source_refs: ["docs/goals/goal-038.md", "docs/specs/krn-engineering-gate/README.md"],
      },
    ],
    no_touch_paths: [".git", "node_modules", "AGENTS.md", ".codex", ".agents", "docs/memory"],
    source_refs: [
      "docs/goals/goal-038.md",
      "docs/specs/krn-init/README.md",
      "docs/plans/canonical/draft.md",
    ],
    product_spine_refs: ["project_profile", "memory_entry", "source_claim", "eval_run", "proposal", "decision"],
    validation: {
      status: "valid",
      checks: [
        "schema-backed manifest",
        "dry-run mode only",
        "source refs present",
        "bootstrap capabilities present",
        "no-touch paths present",
      ],
    },
    interpretation_caveat:
      "This manifest proves dry-run bootstrap contract behavior only; it does not prove productivity lift, write-mode safety, memory-core quality, MCP readiness, dashboard readiness, or paper-research automation.",
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

function uniqueEvalLanes(laneValues: readonly EvalLane[]): EvalLane[] {
  const lanes: EvalLane[] = [];
  for (const lane of laneValues) {
    if (!lanes.includes(lane)) {
      lanes.push(lane);
    }
  }
  return lanes;
}

function includedLanesForSelection(selection: EvalLaneSelection): EvalLane[] {
  if (selection === "core") {
    return ["core"];
  }
  if (selection === "current") {
    return ["core", "current"];
  }
  if (selection === "lab") {
    return ["lab"];
  }
  if (selection === "all") {
    return ["core", "current", "lab"];
  }
  return ["core", "current", "lab"];
}

function excludedLanesForSelection(selection: EvalLaneSelection, includedLanes: readonly EvalLane[]): EvalLane[] {
  if (selection === "custom" || selection === "all") {
    return [];
  }

  return (["core", "current", "lab"] as const).filter((lane) => !includedLanes.includes(lane));
}

function selectEvalModules(args: EvalArgs): EvalModuleDescriptor[] {
  if (args.modules.length > 0) {
    return args.modules.map((moduleId) => {
      const descriptor = EVAL_MODULES.find((module) => module.moduleId === moduleId);
      if (!descriptor) {
        throw new Error(`Unknown eval module: ${moduleId}`);
      }
      return descriptor;
    });
  }

  const includedLanes = includedLanesForSelection(args.lane);
  return EVAL_MODULES.filter((module) => includedLanes.includes(module.lane));
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
      lane: descriptor.lane,
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
      lane: descriptor.lane,
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

function summarizeEvalLanes(modules: readonly EvalModuleResult[]): KrnEvalReport["lane_summary"] {
  const lanes = uniqueEvalLanes(modules.map((moduleResult) => moduleResult.lane));

  return lanes.map((lane) => {
    const laneModules = modules.filter((moduleResult) => moduleResult.lane === lane);
    return {
      lane,
      total_modules: laneModules.length,
      passed_modules: laneModules.filter((moduleResult) => moduleResult.status === "passed").length,
      failed_modules: laneModules.filter((moduleResult) => moduleResult.status === "failed").length,
      error_modules: laneModules.filter((moduleResult) => moduleResult.status === "error").length,
    };
  });
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
  const selectedModules = selectEvalModules(args);
  const modules = selectedModules.map((module) => runEvalModule(targetRoot, module));
  const summary = summarizeEvalModules(modules);
  const includedLanes =
    args.lane === "custom" ? uniqueEvalLanes(selectedModules.map((module) => module.lane)) : includedLanesForSelection(args.lane);
  const excludedLanes = excludedLanesForSelection(args.lane, includedLanes);

  const candidateReport: unknown = {
    schema_version: "krn-eval-report.v1",
    kind: "krn_eval_report",
    run_id: runId,
    created_at: now.toISOString(),
    target_root: targetRoot,
    command: "krn eval",
    mode: "validate",
    overall_status: evalOverallStatus(modules),
    lane_selection: {
      requested_lane: args.lane,
      default_lane: "current",
      included_lanes: includedLanes,
      excluded_lanes: excludedLanes,
      module_filter: [...args.modules],
      policy:
        "Default current runs core plus current eval modules. Lab modules require --lane lab, --lane all, or explicit --module selection.",
    },
    modules,
    lane_summary: summarizeEvalLanes(modules),
    summary,
    runtime_report_path: runtimeReportPath,
    source_refs: [
      "docs/goals/goal-038.md",
      "docs/specs/krn-eval/README.md",
      "docs/evals/STANDARD.md",
      "docs/plans/canonical/draft.md",
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

function sourceBudgetRange(mode: SourceBudgetMode): { min: number; max: number | null } {
  switch (mode) {
    case "quick":
      return { min: 5, max: 8 };
    case "standard":
      return { min: 10, max: 20 };
    case "deep":
      return { min: 20, max: null };
  }
}

function buildKrnResearchPack(args: ResearchPackArgs, now = new Date()): KrnResearchPack {
  const targetRoot = resolve(args.target);
  const runId = createRunId(now);
  const runtimeReportPath = `.krn/research-packs/${runId}/research-pack.json`;
  const budgetRange = sourceBudgetRange(args.budget);

  const candidatePack: unknown = {
    schema_version: "krn-research-pack.v1",
    kind: "krn_research_pack",
    run_id: runId,
    created_at: now.toISOString(),
    target_root: targetRoot,
    command: "krn research-pack",
    status: "scaffolded",
    research_question: args.question,
    krn_decision: args.decision,
    source_budget: {
      mode: args.budget,
      min_sources: budgetRange.min,
      max_sources: budgetRange.max,
      stop_condition:
        "Stop when the source budget is met, mechanisms and contradictions are extracted, and KRN promotion targets are explicit.",
    },
    source_universe: [
      {
        kind: "local_source_bank",
        ref: ".krn/source-bank/repos",
        inclusion_reason: "Prefer locally pinned source repositories before repeating broad web lookup.",
      },
      {
        kind: "repo_memory",
        ref: "docs/memory/INDEX.md",
        inclusion_reason: "Use reviewed KRN memory as selector context, not as unverified source truth.",
      },
      {
        kind: "canonical_docs",
        ref: "docs/source-bank/MANIFEST.md",
        inclusion_reason: "Use the source manifest to choose source families and promotion targets.",
      },
      {
        kind: "primary_papers",
        ref: "source-budget-dependent primary papers and official docs",
        inclusion_reason: "Promote mechanisms only after primary-source or reproducible-source inspection.",
      },
    ],
    sources: [],
    mechanism_matrix: [],
    contradictions: [],
    rejected_alternatives: [],
    decision_candidates: [],
    promotion_targets: [],
    next_action:
      "Run the long-researcher skill against this scaffold, fill sources and mechanisms, then parse the completed pack before promoting memory or ADR changes.",
    runtime_report_path: runtimeReportPath,
    source_refs: [
      ".agents/skills/long-researcher/SKILL.md",
      ".agents/skills/long-researcher/references/research-pack-template.md",
      "docs/goals/goal-006.md",
      "docs/goals/goal-036.md",
      "docs/source-bank/MANIFEST.md",
      "docs/specs/krn-research-pack/README.md",
    ],
    evidence_refs: [runtimeReportPath],
    interpretation_caveat:
      "This scaffold proves only that KRN can create a typed research-pack target. It does not prove sources were read, mechanisms were extracted, memory should be promoted, or productivity lift exists.",
  };

  return parseKrnResearchPack(candidatePack);
}

function writeKrnResearchPack(targetInput: string, pack: KrnResearchPack): string {
  const targetRoot = resolve(targetInput);
  const reportDir = resolve(targetRoot, ".krn", "research-packs", pack.run_id);
  const reportPath = resolve(reportDir, "research-pack.json");

  mkdirSync(reportDir, { recursive: true });
  writeFileSync(reportPath, `${JSON.stringify(pack, null, 2)}\n`, "utf8");

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

    if (normalizedArgv[0] === "brief") {
      const args = parseBriefArgs(normalizedArgv);
      const brief = buildKrnOperatingBrief(args);
      const briefPath = writeKrnOperatingBrief(args.target, brief);
      return { exitCode: 0, stdout: `${briefPath}\n`, stderr: "" };
    }

    if (normalizedArgv[0] === "context") {
      const args = parseContextBuildArgs(normalizedArgv);
      const packet = buildKrnContextPacket(args);
      const packetPath = writeKrnContextPacket(args.target, packet);
      return { exitCode: 0, stdout: `${packetPath}\n`, stderr: "" };
    }

    if (normalizedArgv[0] === "sources") {
      const args = parseSourceCheckArgs(normalizedArgv);
      const report = buildKrnSourceCheck(args);
      const reportPath = writeKrnSourceCheck(args.target, report);
      const exitCode = report.decision === "block" ? 1 : 0;
      return { exitCode, stdout: `${reportPath}\n`, stderr: "" };
    }

    if (normalizedArgv[0] === "gate") {
      const args = parseKrnGateArgs(normalizedArgv);
      const gate = buildKrnEngineeringGate(args);
      const gatePath = writeKrnEngineeringGate(args.target, gate);
      const exitCode = gate.gate_status === "blocked" ? 1 : 0;
      return { exitCode, stdout: `${gatePath}\n`, stderr: "" };
    }

    if (normalizedArgv[0] === "research-pack") {
      const args = parseResearchPackArgs(normalizedArgv);
      const pack = buildKrnResearchPack(args);
      const packPath = writeKrnResearchPack(args.target, pack);
      return { exitCode: 0, stdout: `${packPath}\n`, stderr: "" };
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
