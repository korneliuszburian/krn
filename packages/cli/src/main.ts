import { existsSync, mkdirSync, statSync, writeFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { parseInitManifest, type InitManifest } from "@krn/contracts";

type CliResult = {
  exitCode: number;
  stdout: string;
  stderr: string;
};

type InitArgs = {
  target: string;
};

const DETECTED_PATHS = [
  { path: "AGENTS.md", expectedKind: "file" },
  { path: ".codex", expectedKind: "directory" },
  { path: ".agents", expectedKind: "directory" },
  { path: "docs/memory/INDEX.md", expectedKind: "file" },
  { path: ".krn", expectedKind: "directory" },
] as const;

function usage(): string {
  return "Usage: krn init --dry-run [--target <path>]\n";
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

export function runKrnCli(argv: readonly string[] = process.argv.slice(2)): CliResult {
  const normalizedArgv = argv[0] === "--" ? argv.slice(1) : argv;

  if (normalizedArgv.length === 0 || normalizedArgv.includes("--help")) {
    return { exitCode: 0, stdout: usage(), stderr: "" };
  }

  try {
    const args = parseInitArgs(normalizedArgv);
    const manifest = buildInitManifest(args.target);
    const manifestPath = writeManifest(args.target, manifest);
    return { exitCode: 0, stdout: `${manifestPath}\n`, stderr: "" };
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
