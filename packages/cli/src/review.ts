import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import {
  parseDoctorReport,
  parseInitManifest,
  parseKrnEvalReport,
  parseKrnReviewReport,
  type KrnMemoryApplication,
  type KrnReviewReport,
  type ReviewArtifact,
  type ReviewFinding,
  type ReviewProposal,
} from "@krn/contracts";
import { buildReviewMemoryBundle, recordMemoryFeedback } from "./memory-store.js";

function createRunId(now: Date): string {
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  return `${stamp}-${process.pid}`;
}

function readJsonFile(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8")) as unknown;
}

function toTargetRelativePath(targetRoot: string, absolutePath: string): string {
  const relativePath = relative(targetRoot, absolutePath).replaceAll("\\", "/");
  if (relativePath.length > 0 && !relativePath.startsWith("..") && !relativePath.startsWith("/")) {
    return relativePath;
  }
  return absolutePath;
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
      ["docs/specs/krn-init/README.md", "docs/goals/goal-038.md"],
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
      ["docs/specs/krn-init/README.md", "docs/goals/goal-038.md"],
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "unknown parse error";
    return reviewArtifact(
      "latest-init-manifest",
      "init_manifest",
      "invalid",
      toTargetRelativePath(targetRoot, manifestPath),
      `Latest init manifest could not be parsed: ${message}`,
      ["docs/specs/krn-init/README.md", "docs/goals/goal-038.md"],
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
      ["docs/specs/krn-doctor/README.md", "docs/goals/goal-038.md"],
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
      ["docs/specs/krn-doctor/README.md", "docs/goals/goal-038.md"],
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "unknown parse error";
    return reviewArtifact(
      "latest-doctor-report",
      "doctor_report",
      "invalid",
      toTargetRelativePath(targetRoot, reportPath),
      `Latest doctor report could not be parsed: ${message}`,
      ["docs/specs/krn-doctor/README.md", "docs/goals/goal-038.md"],
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
      ["docs/specs/krn-eval/README.md", "docs/goals/goal-038.md"],
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
      ["docs/specs/krn-eval/README.md", "docs/goals/goal-038.md"],
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "unknown parse error";
    return reviewArtifact(
      "latest-eval-report",
      "eval_report",
      "invalid",
      toTargetRelativePath(targetRoot, reportPath),
      `Latest aggregate eval report could not be parsed: ${message}`,
      ["docs/specs/krn-eval/README.md", "docs/goals/goal-038.md"],
    );
  }
}

function buildReviewFindings(artifacts: readonly ReviewArtifact[], application: KrnMemoryApplication): ReviewFinding[] {
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

  findings.push({
    id: "memory-selection-applied",
    severity: "info",
    artifact_id: null,
    summary: `Applied ${application.applied_memory_ids.length} selected memory IDs to krn review guidance.`,
    evidence_refs: [application.run_id],
    source_refs: ["docs/goals/goal-038.md", "docs/plans/canonical/SOURCES.md#C061"],
  });

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

function buildReviewProposals(artifacts: readonly ReviewArtifact[], application: KrnMemoryApplication): ReviewProposal[] {
  const evidenceRefs = artifacts.flatMap((artifact) => (artifact.path ? [artifact.path] : []));
  const proposals: ReviewProposal[] = [];
  const missingOrInvalid = artifacts.filter((artifact) => artifact.status !== "present");
  const memoryEvidenceRefs = [application.selection_run_id, application.run_id];

  if (missingOrInvalid.length > 0) {
    proposals.push(
      proposal(
        "repair-missing-runtime-evidence",
        "repair_record",
        "Regenerate missing or invalid runtime evidence before promotion.",
        "KRN review cannot promote runtime evidence when one or more required artifacts are missing or invalid.",
        missingOrInvalid.map((artifact) => artifact.id),
        ["docs/goals/goal-038.md", "docs/evals/STANDARD.md"],
        ["packages/mcp", "apps/dashboard", "runtime skills", "memory promotion"],
      ),
    );
  } else {
    proposals.push(
      proposal(
        "promote-reviewed-runtime-evidence",
        "source_claim_update",
        "Review and promote parsed runtime evidence into the source ledger.",
        "The latest init, doctor, and eval runtime artifacts all parse through KRN contracts; a human should review before durable promotion.",
        evidenceRefs,
        ["docs/goals/goal-038.md", "docs/plans/canonical/SOURCES.md"],
        ["broad API sync", "dashboard command surfaces", "runtime skills"],
      ),
    );
  }

  proposals.push(
    proposal(
      "apply-memory-store-boundary",
      "next_action",
      "Use selected memory IDs as review guidance before adding new product surfaces.",
      "The MemoryStore boundary is the active final-product slice; selected memory must produce application guidance and feedback before it counts as product memory.",
      memoryEvidenceRefs,
      ["docs/goals/goal-038.md", "docs/plans/canonical/SOURCES.md#C061"],
      ["repo-local memory core", "context dump", "dashboard expansion", "benchmark expansion", "cloud sync"],
    ),
  );

  return proposals;
}

function summarizeReview(
  artifacts: readonly ReviewArtifact[],
  findings: readonly ReviewFinding[],
  proposals: readonly ReviewProposal[],
): KrnReviewReport["summary"] {
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

export function buildKrnReviewReport(targetInput: string, now = new Date()): KrnReviewReport {
  const targetRoot = resolve(targetInput);
  const runId = createRunId(now);
  const runtimeReportPath = `.krn/review/${runId}/report.json`;
  const memory = buildReviewMemoryBundle(targetRoot, runId, now);
  const artifacts = [
    buildInitReviewArtifact(targetRoot),
    buildDoctorReviewArtifact(targetRoot),
    buildEvalReviewArtifact(targetRoot),
  ];
  const findings = buildReviewFindings(artifacts, memory.application);
  const proposals = buildReviewProposals(artifacts, memory.application);
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
    memory_selection: memory.selection,
    memory_application: memory.application,
    memory_feedback: memory.feedback,
    summary,
    no_touch_paths: ["AGENTS.md", ".codex", ".agents", "docs/memory", "docs/evals", "docs/plans"],
    runtime_report_path: runtimeReportPath,
    source_refs: [
      "docs/goals/goal-038.md",
      "docs/specs/krn-review/README.md",
      "docs/evals/STANDARD.md",
      "docs/plans/canonical/draft.md",
      "docs/plans/canonical/SOURCES.md#C061",
    ],
    interpretation_caveat:
      "This report applies selected memory IDs to local review guidance only; it does not approve memory/source changes, store authoritative memory in the repo, prove productivity lift, or unblock destructive API/MCP/dashboard behavior by itself.",
  };

  return parseKrnReviewReport(candidateReport);
}

export function writeKrnReviewReport(targetInput: string, report: KrnReviewReport): string {
  const targetRoot = resolve(targetInput);
  const reportDir = resolve(targetRoot, ".krn", "review", report.run_id);
  const reportPath = resolve(reportDir, "report.json");

  mkdirSync(reportDir, { recursive: true });
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  recordMemoryFeedback(report.memory_feedback);

  return reportPath;
}
