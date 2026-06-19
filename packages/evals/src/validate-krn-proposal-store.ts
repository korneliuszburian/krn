import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { parseKrnControlPlaneProposal, type KrnControlPlaneProposal } from "@krn/contracts";
import { storeKrnControlPlaneProposal, validateProposalSourceRefs } from "@krn/mcp";

type EvalCase = {
  id: string;
  expected_behavior: string;
  metrics: string[];
  failure_mode: string;
};

type CaseResult = {
  id: string;
  passed: boolean;
  assertions: string[];
  failure_mode: string;
  message: string;
};

type EvalReport = {
  schema_version: "krn-proposal-store-result.v1";
  kind: "krn_proposal_store_eval_result";
  run_id: string;
  created_at: string;
  total_cases: number;
  passed_cases: number;
  failed_cases: number;
  case_pass_rate: number;
  total_assertions: number;
  passed_assertions: number;
  failed_assertions: number;
  assertion_pass_rate: number;
  cases: CaseResult[];
  stored_proposal_path: string | null;
  interpretation_caveat: string;
};

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8")) as unknown;
}

function parseCases(input: unknown): EvalCase[] {
  if (!Array.isArray(input)) {
    throw new Error("cases.json must be an array");
  }

  return input.map((item, index) => {
    if (!item || typeof item !== "object") {
      throw new Error(`case ${index} must be an object`);
    }

    const record = item as Record<string, unknown>;
    const id = record.id;
    const expectedBehavior = record.expected_behavior;
    const metrics = record.metrics;
    const failureMode = record.failure_mode;

    if (typeof id !== "string" || id.length === 0) {
      throw new Error(`case ${index} missing id`);
    }
    if (typeof expectedBehavior !== "string" || expectedBehavior.length === 0) {
      throw new Error(`case ${id} missing expected_behavior`);
    }
    if (!Array.isArray(metrics) || !metrics.every((metric) => typeof metric === "string" && metric.length > 0)) {
      throw new Error(`case ${id} missing metrics`);
    }
    if (typeof failureMode !== "string" || failureMode.length === 0) {
      throw new Error(`case ${id} missing failure_mode`);
    }

    return {
      id,
      expected_behavior: expectedBehavior,
      metrics,
      failure_mode: failureMode,
    };
  });
}

function result(id: string, passed: boolean, assertions: string[], failureMode: string, message: string): CaseResult {
  return { id, passed, assertions, failure_mode: failureMode, message };
}

function createRunId(now: Date): string {
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  return `${stamp}-${process.pid}`;
}

function writeText(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
}

function createProposalTarget(): string {
  const targetRoot = mkdtempSync(join(tmpdir(), "krn-proposal-store-eval-"));
  writeText(join(targetRoot, "docs/goals/goal-006.md"), "# Goal 006\n");
  writeText(join(targetRoot, "docs/goals/goal-008.md"), "# Goal 008\n");
  writeText(join(targetRoot, "docs/specs/krn-mcp-read-model/README.md"), "# MCP read model\n");
  writeText(
    join(targetRoot, "docs/plans/canonical/SOURCES.md"),
    [
      "# Canonical Sources",
      "",
      "| ID | Tier | Sector | Source | Use / caveat |",
      "|---|---|---|---|---|",
      "| S007 | A | MCP | https://developers.openai.com/codex/mcp | MCP resources/tools/prompts, config, auth, approvals. |",
      "",
      "| Claim ID | Claim | Source IDs | Evidence grade | Used for decision? | Risk if wrong |",
      "|---|---|---|---|---|---|",
      "| C004 | MCP/API writes need schemas, approvals, idempotency, and audit. | S007 | A | yes | Unsafe state mutation. |",
      "| C015 | Cookbook links must become mechanism/artifact/eval/failure mappings, not bibliography. | S010-S021 | A | yes | Memory becomes a link list. |",
      "",
      "| ID | Evidence | Product implication |",
      "|---|---|---|",
      "| LOCAL015 | Control-plane proposal contract exists. | Proposal tools still need persistence and evals. |",
      "",
    ].join("\n"),
  );
  return targetRoot;
}

function collectFiles(targetRoot: string, prefix = ""): string[] {
  const absoluteRoot = join(targetRoot, prefix);
  return readdirSync(absoluteRoot, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = join(prefix, entry.name);
    if (entry.isDirectory()) {
      return collectFiles(targetRoot, entryPath);
    }
    return entryPath.replaceAll("\\", "/");
  });
}

function validProposalWithLedgerIds(): KrnControlPlaneProposal {
  const proposal = parseKrnControlPlaneProposal(
    readJson(resolve("docs/specs/krn-control-plane-proposal/examples/control-plane-proposal.example.json")),
  );

  return parseKrnControlPlaneProposal({
    ...proposal,
    source_refs: [...proposal.source_refs, "S007", "C004", "LOCAL015", "https://developers.openai.com/codex/mcp"],
  });
}

function runValidation(): EvalReport {
  const now = new Date();
  const runId = createRunId(now);
  const cases = parseCases(readJson(resolve("docs/evals/krn-proposal-store/cases.json")));
  const caseById = new Map(cases.map((testCase) => [testCase.id, testCase]));
  const results: CaseResult[] = [];
  let storedProposalPath: string | null = null;

  const storeCase = caseById.get("source-backed-proposal-store");
  if (!storeCase) {
    throw new Error("Missing case source-backed-proposal-store");
  }
  try {
    const targetRoot = createProposalTarget();
    const beforeFiles = collectFiles(targetRoot);
    const proposal = validProposalWithLedgerIds();
    const validation = validateProposalSourceRefs(proposal, targetRoot);
    const stored = storeKrnControlPlaneProposal(proposal, { targetInput: targetRoot, now });
    storedProposalPath = stored.proposal_path;
    const afterFiles = collectFiles(targetRoot);
    const newFiles = afterFiles.filter((file) => !beforeFiles.includes(file));

    results.push(
      result(
        storeCase.id,
        validation.valid &&
          stored.status === "stored" &&
          stored.proposal_path.startsWith(".krn/proposals/") &&
          existsSync(join(targetRoot, stored.proposal_path)) &&
          newFiles.length === 1 &&
          newFiles[0] === stored.proposal_path,
        ["proposal source refs validated", "proposal stored under .krn/proposals", "target files outside .krn/proposals unchanged"],
        storeCase.failure_mode,
        "Source-backed proposal stored append-only under .krn/proposals in an isolated target.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        storeCase.id,
        false,
        ["source-backed proposal stores"],
        storeCase.failure_mode,
        error instanceof Error ? error.message : "unknown proposal store error",
      ),
    );
  }

  const duplicateCase = caseById.get("duplicate-idempotency-key-is-stable");
  if (!duplicateCase) {
    throw new Error("Missing case duplicate-idempotency-key-is-stable");
  }
  try {
    const targetRoot = createProposalTarget();
    const first = storeKrnControlPlaneProposal(validProposalWithLedgerIds(), { targetInput: targetRoot, now });
    const second = storeKrnControlPlaneProposal(validProposalWithLedgerIds(), { targetInput: targetRoot, now });
    results.push(
      result(
        duplicateCase.id,
        first.status === "stored" && second.status === "already_stored" && first.proposal_path === second.proposal_path,
        ["first write stored", "duplicate write already stored", "duplicate write uses same path"],
        duplicateCase.failure_mode,
        "Duplicate proposal write returned the existing path for the same idempotency key and content.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        duplicateCase.id,
        false,
        ["duplicate idempotency key stable"],
        duplicateCase.failure_mode,
        error instanceof Error ? error.message : "unknown duplicate proposal error",
      ),
    );
  }

  const unbackedCase = caseById.get("unbacked-source-ref-rejected");
  if (!unbackedCase) {
    throw new Error("Missing case unbacked-source-ref-rejected");
  }
  try {
    const targetRoot = createProposalTarget();
    const badProposal = parseKrnControlPlaneProposal(
      readJson(resolve("docs/specs/krn-control-plane-proposal/fixtures/bad-unbacked-source-ref.example.json")),
    );
    let rejected = false;
    try {
      storeKrnControlPlaneProposal(badProposal, { targetInput: targetRoot, now });
    } catch {
      rejected = true;
    }

    results.push(
      result(
        unbackedCase.id,
        rejected,
        ["known-bad source-ref fixture parses as proposal", "known-bad source-ref fixture rejected by store"],
        unbackedCase.failure_mode,
        "Schema-valid proposal with unbacked source refs was rejected before persistence.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        unbackedCase.id,
        false,
        ["unbacked source ref rejected"],
        unbackedCase.failure_mode,
        error instanceof Error ? error.message : "unknown unbacked source-ref error",
      ),
    );
  }

  const unsafePathCase = caseById.get("unsafe-target-path-rejected");
  if (!unsafePathCase) {
    throw new Error("Missing case unsafe-target-path-rejected");
  }
  try {
    const targetRoot = createProposalTarget();
    const proposal = validProposalWithLedgerIds();
    let rejected = false;
    try {
      storeKrnControlPlaneProposal(
        {
          ...proposal,
          target: {
            target_type: "path",
            path: "../outside.md",
          },
        },
        { targetInput: targetRoot, now },
      );
    } catch {
      rejected = true;
    }

    results.push(
      result(
        unsafePathCase.id,
        rejected,
        ["unsafe target path rejected"],
        unsafePathCase.failure_mode,
        "Proposal target path traversal was rejected before persistence.",
      ),
    );
  } catch (error: unknown) {
    results.push(
      result(
        unsafePathCase.id,
        false,
        ["unsafe target path rejected"],
        unsafePathCase.failure_mode,
        error instanceof Error ? error.message : "unknown target path validation error",
      ),
    );
  }

  const totalCases = results.length;
  const passedCases = results.filter((caseResult) => caseResult.passed).length;
  const totalAssertions = results.reduce((count, caseResult) => count + caseResult.assertions.length, 0);
  const passedAssertions = results.reduce(
    (count, caseResult) => count + (caseResult.passed ? caseResult.assertions.length : 0),
    0,
  );

  return {
    schema_version: "krn-proposal-store-result.v1",
    kind: "krn_proposal_store_eval_result",
    run_id: runId,
    created_at: now.toISOString(),
    total_cases: totalCases,
    passed_cases: passedCases,
    failed_cases: totalCases - passedCases,
    case_pass_rate: totalCases === 0 ? 0 : passedCases / totalCases,
    total_assertions: totalAssertions,
    passed_assertions: passedAssertions,
    failed_assertions: totalAssertions - passedAssertions,
    assertion_pass_rate: totalAssertions === 0 ? 0 : passedAssertions / totalAssertions,
    cases: results,
    stored_proposal_path: storedProposalPath,
    interpretation_caveat:
      "This eval proves local source-backed append-only proposal persistence only; it does not prove MCP/API proposal tool safety, human approval, dashboard readiness, ChatGPT connector behavior, or productivity lift.",
  };
}

export function main(): void {
  const report = runValidation();
  const reportDir = resolve(".krn/evals/krn-proposal-store", report.run_id);
  const reportPath = resolve(reportDir, "report.json");

  mkdirSync(reportDir, { recursive: true });
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
  process.stdout.write(`report: ${reportPath}\n`);

  if (report.failed_cases > 0) {
    process.exitCode = 1;
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
