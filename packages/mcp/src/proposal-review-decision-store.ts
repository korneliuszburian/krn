import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { relative, resolve } from "node:path";
import { parseKrnProposalReviewDecision, type KrnProposalReviewDecision } from "@krn/contracts";
import { listKrnProposalStoreRecords, validateSourceRefs } from "./proposal-store.js";

export type ProposalReviewDecisionStoreResult = {
  schema_version: "krn-proposal-review-decision-store-result.v1";
  kind: "krn_proposal_review_decision_store_result";
  target_root: string;
  decision_id: string;
  proposal_id: string;
  decision_path: string;
  idempotency_key: string;
  status: "stored" | "already_stored";
  source_refs_validated: string[];
  created_at: string;
  interpretation_caveat: string;
};

export type ValidProposalReviewDecisionStoreRecord = {
  decision_path: string;
  idempotency_key: string;
  decision: KrnProposalReviewDecision;
};

export type InvalidProposalReviewDecisionStoreRecord = {
  decision_path: string;
  error_summary: string;
};

export type ProposalReviewDecisionStoreRecordList = {
  target_root: string;
  review_root: string;
  total_records: number;
  valid_records: ValidProposalReviewDecisionStoreRecord[];
  invalid_records: InvalidProposalReviewDecisionStoreRecord[];
  interpretation_caveat: string;
};

type StoreOptions = {
  targetInput?: string;
  now?: Date;
};

function readJsonFile(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8")) as unknown;
}

function safePathSegment(input: string): string {
  const slug = input
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  const digest = createHash("sha256").update(input).digest("hex").slice(0, 12);
  return `${slug || "review-decision"}-${digest}`;
}

function normalizedDecisionJson(decision: KrnProposalReviewDecision): string {
  return `${JSON.stringify(decision, null, 2)}\n`;
}

function collectDecisionFiles(reviewRoot: string): string[] {
  if (!existsSync(reviewRoot) || !statSync(reviewRoot).isDirectory()) {
    return [];
  }

  return readdirSync(reviewRoot, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = resolve(reviewRoot, entry.name);
    if (entry.isDirectory()) {
      const decisionPath = resolve(entryPath, "decision.json");
      return existsSync(decisionPath) && statSync(decisionPath).isFile() ? [decisionPath] : [];
    }
    return [];
  }).sort();
}

function assertReferencedProposalExists(decision: KrnProposalReviewDecision, targetRoot: string): void {
  const proposalRecords = listKrnProposalStoreRecords(targetRoot);
  const referencedProposal = proposalRecords.valid_records.find(
    (record) => record.proposal.proposal_id === decision.proposal_id && record.proposal_path === decision.proposal_path,
  );

  if (!referencedProposal) {
    throw new Error(`Review decision references missing proposal: ${decision.proposal_id} at ${decision.proposal_path}`);
  }
}

function assertNoExistingTerminalDecision(
  decision: KrnProposalReviewDecision,
  targetRoot: string,
  currentDecisionPath: string,
): void {
  const reviewRecords = listKrnProposalReviewDecisionStoreRecords(targetRoot);
  const existingDecision = reviewRecords.valid_records.find(
    (record) => record.decision.proposal_id === decision.proposal_id && record.decision_path !== currentDecisionPath,
  );

  if (existingDecision) {
    throw new Error(
      `Proposal already has a review decision: ${decision.proposal_id} at ${existingDecision.decision_path}`,
    );
  }
}

function buildStoreResult(
  decision: KrnProposalReviewDecision,
  targetRoot: string,
  decisionPath: string,
  status: ProposalReviewDecisionStoreResult["status"],
  now: Date,
): ProposalReviewDecisionStoreResult {
  return {
    schema_version: "krn-proposal-review-decision-store-result.v1",
    kind: "krn_proposal_review_decision_store_result",
    target_root: targetRoot,
    decision_id: decision.decision_id,
    proposal_id: decision.proposal_id,
    decision_path: relative(targetRoot, decisionPath).replaceAll("\\", "/"),
    idempotency_key: decision.write_policy.idempotency_key,
    status,
    source_refs_validated: [...decision.source_refs],
    created_at: now.toISOString(),
    interpretation_caveat:
      "The proposal review decision was persisted as append-only review state under .krn/proposal-reviews only; this does not mutate the proposal target, promote memory/source changes, expose dashboard commands, or prove productivity lift.",
  };
}

export function storeKrnProposalReviewDecision(
  input: unknown,
  options: StoreOptions = {},
): ProposalReviewDecisionStoreResult {
  const decision = parseKrnProposalReviewDecision(input);
  const targetRoot = resolve(options.targetInput ?? ".");
  const now = options.now ?? new Date();

  assertReferencedProposalExists(decision, targetRoot);

  const sourceValidation = validateSourceRefs(decision.source_refs, targetRoot);
  if (!sourceValidation.valid) {
    throw new Error(`Review decision source_refs are not backed by target sources: ${sourceValidation.rejected.join(", ")}`);
  }

  const decisionDir = resolve(
    targetRoot,
    ".krn",
    "proposal-reviews",
    safePathSegment(decision.write_policy.idempotency_key),
  );
  const decisionPath = resolve(decisionDir, "decision.json");
  const decisionJson = normalizedDecisionJson(decision);
  const decisionRelativePath = relative(targetRoot, decisionPath).replaceAll("\\", "/");

  if (existsSync(decisionPath)) {
    const existingDecision = parseKrnProposalReviewDecision(readJsonFile(decisionPath));
    const existingJson = normalizedDecisionJson(existingDecision);
    if (
      existingDecision.write_policy.idempotency_key !== decision.write_policy.idempotency_key ||
      existingJson !== decisionJson
    ) {
      throw new Error(`Conflicting review decision for idempotency_key: ${decision.write_policy.idempotency_key}`);
    }

    return buildStoreResult(decision, targetRoot, decisionPath, "already_stored", now);
  }

  assertNoExistingTerminalDecision(decision, targetRoot, decisionRelativePath);

  mkdirSync(decisionDir, { recursive: true });
  writeFileSync(decisionPath, decisionJson, { encoding: "utf8", flag: "wx" });

  return buildStoreResult(decision, targetRoot, decisionPath, "stored", now);
}

export function listKrnProposalReviewDecisionStoreRecords(targetInput = "."): ProposalReviewDecisionStoreRecordList {
  const targetRoot = resolve(targetInput);
  const reviewRoot = resolve(targetRoot, ".krn", "proposal-reviews");
  const validRecords: ValidProposalReviewDecisionStoreRecord[] = [];
  const invalidRecords: InvalidProposalReviewDecisionStoreRecord[] = [];

  for (const decisionPath of collectDecisionFiles(reviewRoot)) {
    const decisionRelativePath = relative(targetRoot, decisionPath).replaceAll("\\", "/");
    try {
      const decision = parseKrnProposalReviewDecision(readJsonFile(decisionPath));
      validRecords.push({
        decision_path: decisionRelativePath,
        idempotency_key: decision.write_policy.idempotency_key,
        decision,
      });
    } catch (error: unknown) {
      invalidRecords.push({
        decision_path: decisionRelativePath,
        error_summary: error instanceof Error ? error.message : "unknown review decision parse error",
      });
    }
  }

  return {
    target_root: targetRoot,
    review_root: relative(targetRoot, reviewRoot).replaceAll("\\", "/"),
    total_records: validRecords.length + invalidRecords.length,
    valid_records: validRecords,
    invalid_records: invalidRecords,
    interpretation_caveat:
      "This list reports local proposal review decision records only; it does not mutate targets, promote memory/source changes, or prove human review quality.",
  };
}
