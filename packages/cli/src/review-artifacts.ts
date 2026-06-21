import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { relative, resolve } from "node:path";
import {
  parseDoctorReport,
  parseInitManifest,
  parseKrnEvalReport,
  parseKrnSourceCheck,
  type KrnSourceCheck,
  type ReviewArtifact,
} from "@krn/contracts";

const INIT_ARTIFACT_SOURCE_REFS = ["docs/specs/krn-init/README.md"] as const;
const DOCTOR_ARTIFACT_SOURCE_REFS = ["docs/specs/krn-doctor/README.md"] as const;
const EVAL_ARTIFACT_SOURCE_REFS = ["docs/specs/krn-eval/README.md"] as const;
const SOURCE_CHECK_ARTIFACT_SOURCE_REFS = ["docs/specs/krn-source-graph/README.md"] as const;

export type SourceCheckReviewArtifact = {
  artifact: ReviewArtifact;
  report: KrnSourceCheck | null;
};

export type ReviewRuntimeArtifacts = {
  artifacts: ReviewArtifact[];
  sourceCheck: SourceCheckReviewArtifact;
};

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
      [...INIT_ARTIFACT_SOURCE_REFS],
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
      manifest.source_refs,
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "unknown parse error";
    return reviewArtifact(
      "latest-init-manifest",
      "init_manifest",
      "invalid",
      toTargetRelativePath(targetRoot, manifestPath),
      `Latest init manifest could not be parsed: ${message}`,
      [...INIT_ARTIFACT_SOURCE_REFS],
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
      [...DOCTOR_ARTIFACT_SOURCE_REFS],
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
      report.source_refs,
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "unknown parse error";
    return reviewArtifact(
      "latest-doctor-report",
      "doctor_report",
      "invalid",
      toTargetRelativePath(targetRoot, reportPath),
      `Latest doctor report could not be parsed: ${message}`,
      [...DOCTOR_ARTIFACT_SOURCE_REFS],
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
      [...EVAL_ARTIFACT_SOURCE_REFS],
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
      report.source_refs,
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "unknown parse error";
    return reviewArtifact(
      "latest-eval-report",
      "eval_report",
      "invalid",
      toTargetRelativePath(targetRoot, reportPath),
      `Latest aggregate eval report could not be parsed: ${message}`,
      [...EVAL_ARTIFACT_SOURCE_REFS],
    );
  }
}

function buildSourceCheckReviewArtifact(targetRoot: string): SourceCheckReviewArtifact {
  const reportPath = latestRuntimeFile(targetRoot, ".krn/sources", "source-check.json");
  if (!reportPath) {
    return {
      artifact: reviewArtifact(
        "latest-source-check",
        "source_check",
        "missing",
        null,
        "No source graph check was found.",
        [...SOURCE_CHECK_ARTIFACT_SOURCE_REFS],
      ),
      report: null,
    };
  }

  try {
    const report = parseKrnSourceCheck(readJsonFile(reportPath));
    return {
      artifact: reviewArtifact(
        "latest-source-check",
        "source_check",
        "present",
        toTargetRelativePath(targetRoot, reportPath),
        `Latest source check ${report.run_id} parsed with ${report.decision} decision across ${report.checked_refs.length} refs.`,
        report.source_refs,
      ),
      report,
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "unknown parse error";
    return {
      artifact: reviewArtifact(
        "latest-source-check",
        "source_check",
        "invalid",
        toTargetRelativePath(targetRoot, reportPath),
        `Latest source check could not be parsed: ${message}`,
        [...SOURCE_CHECK_ARTIFACT_SOURCE_REFS],
      ),
      report: null,
    };
  }
}

export function buildReviewRuntimeArtifacts(targetRoot: string): ReviewRuntimeArtifacts {
  const sourceCheck = buildSourceCheckReviewArtifact(targetRoot);
  return {
    artifacts: [
      buildInitReviewArtifact(targetRoot),
      buildDoctorReviewArtifact(targetRoot),
      buildEvalReviewArtifact(targetRoot),
      sourceCheck.artifact,
    ],
    sourceCheck,
  };
}
