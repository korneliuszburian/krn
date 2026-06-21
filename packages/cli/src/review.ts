import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  parseKrnReviewReport,
  type KrnSourceCheck,
  type KrnMemoryApplication,
  type KrnReviewReport,
  type ReviewArtifact,
  type ReviewFinding,
  type ReviewProposal,
} from "@krn/contracts";
import { buildReviewMemoryBundle, recordMemoryFeedback } from "./memory-store.js";
import { buildReviewRuntimeArtifacts, type SourceCheckReviewArtifact } from "./review-artifacts.js";

export type ReviewArgs = {
  target: string;
};

export function parseReviewArgs(argv: readonly string[]): ReviewArgs {
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

function createRunId(now: Date): string {
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  return `${stamp}-${process.pid}`;
}

function artifactPathForEvidence(path: string | null): string[] {
  if (!path) {
    return [];
  }
  return [path];
}

function unique(values: readonly string[]): string[] {
  return [...new Set(values)];
}

function sourceCheckFindingSummary(report: KrnSourceCheck): string {
  const affectedRefs = report.decision === "block" ? report.blocked_refs : report.warning_refs;
  return `Source check ${report.run_id} returned ${report.decision} for ${affectedRefs.join(", ")}. Required actions: ${report.required_actions.join(" ")}`;
}

function buildReviewFindings(
  artifacts: readonly ReviewArtifact[],
  application: KrnMemoryApplication,
  memorySourceRefs: readonly string[],
  sourceCheck: SourceCheckReviewArtifact,
): ReviewFinding[] {
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

  if (sourceCheck.report && sourceCheck.report.decision !== "pass") {
    findings.push({
      id: `latest-source-check-${sourceCheck.report.decision}`,
      severity: sourceCheck.report.decision === "block" ? "blocking" : "warning",
      artifact_id: sourceCheck.artifact.id,
      summary: sourceCheckFindingSummary(sourceCheck.report),
      evidence_refs: artifactPathForEvidence(sourceCheck.artifact.path),
      source_refs: sourceCheck.report.source_refs,
    });
  }

  findings.push({
    id: "memory-selection-applied",
    severity: "info",
    artifact_id: null,
    summary: `Applied ${application.applied_memory_ids.length} selected memory IDs to krn review guidance.`,
    evidence_refs: [application.run_id],
    source_refs: [...memorySourceRefs],
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

function buildReviewProposals(
  artifacts: readonly ReviewArtifact[],
  application: KrnMemoryApplication,
  memorySourceRefs: readonly string[],
  sourceCheck: SourceCheckReviewArtifact,
): ReviewProposal[] {
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
        unique([...memorySourceRefs, "docs/evals/STANDARD.md"]),
        ["packages/mcp", "apps/dashboard", "runtime skills", "memory promotion"],
      ),
    );
  } else {
    proposals.push(
      proposal(
        "promote-reviewed-runtime-evidence",
        "source_claim_update",
        "Review and promote parsed runtime evidence into the source ledger.",
        "The latest init, doctor, eval, and source-check runtime artifacts all parse through KRN contracts; a human should review before durable promotion.",
        evidenceRefs,
        unique([...memorySourceRefs, "docs/plans/canonical/SOURCES.md"]),
        ["broad API sync", "dashboard command surfaces", "runtime skills"],
      ),
    );
  }

  if (sourceCheck.report && sourceCheck.report.decision !== "pass") {
    proposals.push(
      proposal(
        `repair-source-check-${sourceCheck.report.decision}`,
        "repair_record",
        "Resolve source graph check warnings before promoting runtime evidence.",
        sourceCheckFindingSummary(sourceCheck.report),
        artifactPathForEvidence(sourceCheck.artifact.path),
        sourceCheck.report.source_refs,
        ["source promotion", "memory promotion", "broad API sync", "dashboard command surfaces"],
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
      memorySourceRefs,
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
  const memorySourceRefs = unique(memory.selectedRecords.flatMap((record) => record.source_lineage));
  const { artifacts, sourceCheck } = buildReviewRuntimeArtifacts(targetRoot);
  const findings = buildReviewFindings(artifacts, memory.application, memorySourceRefs, sourceCheck);
  const proposals = buildReviewProposals(artifacts, memory.application, memorySourceRefs, sourceCheck);
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
    source_refs: unique(["docs/specs/krn-review/README.md", "docs/evals/STANDARD.md", ...memorySourceRefs]),
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
