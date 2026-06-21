import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, isAbsolute, relative, resolve } from "node:path";
import {
  parseKrnProposalPromotion,
  type ControlPlanePromotionPayload,
  type KrnControlPlaneProposal,
  type KrnProposalPromotion,
} from "@krn/contracts";
import { listKrnProposalReviewDecisionStoreRecords } from "./proposal-review-decision-store.js";
import { listKrnProposalStoreRecords, validateSourceRefs } from "./proposal-store.js";

export type ProposalPromotionStoreResult = {
  schema_version: "krn-proposal-promotion-store-result.v1";
  kind: "krn_proposal_promotion_store_result";
  target_root: string;
  promotion_id: string;
  proposal_id: string;
  decision_id: string;
  promotion_path: string;
  idempotency_key: string;
  status: "stored" | "already_stored";
  target_written: boolean;
  source_refs_validated: string[];
  created_at: string;
  interpretation_caveat: string;
};

export type ValidProposalPromotionStoreRecord = {
  promotion_path: string;
  idempotency_key: string;
  promotion: KrnProposalPromotion;
};

export type InvalidProposalPromotionStoreRecord = {
  promotion_path: string;
  error_summary: string;
};

export type ProposalPromotionStoreRecordList = {
  target_root: string;
  promotion_root: string;
  total_records: number;
  valid_records: ValidProposalPromotionStoreRecord[];
  invalid_records: InvalidProposalPromotionStoreRecord[];
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
  return `${slug || "proposal-promotion"}-${digest}`;
}

function normalizedPromotionJson(promotion: KrnProposalPromotion): string {
  return `${JSON.stringify(promotion, null, 2)}\n`;
}

function sha256(content: string): string {
  return createHash("sha256").update(content).digest("hex");
}

function isInsideTarget(targetRoot: string, candidatePath: string): boolean {
  const relativePath = relative(targetRoot, candidatePath);
  return relativePath.length === 0 || (!relativePath.startsWith("..") && !isAbsolute(relativePath));
}

function collectPromotionFiles(promotionRoot: string): string[] {
  if (!existsSync(promotionRoot) || !statSync(promotionRoot).isDirectory()) {
    return [];
  }

  return readdirSync(promotionRoot, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = resolve(promotionRoot, entry.name);
    if (entry.isDirectory()) {
      const promotionPath = resolve(entryPath, "promotion.json");
      return existsSync(promotionPath) && statSync(promotionPath).isFile() ? [promotionPath] : [];
    }
    return [];
  }).sort();
}

function assertSafePromotionTarget(promotion: KrnProposalPromotion, targetRoot: string): string {
  if (promotion.target.path.includes("\0")) {
    throw new Error(`Promotion target path is unsafe: ${promotion.target.path}`);
  }

  const targetPath = resolve(targetRoot, promotion.target.path);
  if (!isInsideTarget(targetRoot, targetPath)) {
    throw new Error(`Promotion target path must stay inside target root: ${promotion.target.path}`);
  }

  return targetPath;
}

function promotionPayloadForProposal(proposal: KrnControlPlaneProposal): ControlPlanePromotionPayload {
  if (!proposal.promotion_payload) {
    throw new Error(`Promotion requires a machine-applicable proposal payload: ${proposal.proposal_id}`);
  }

  if (proposal.proposal_kind === "memory_update" && proposal.promotion_payload.payload_type !== "memory_entry") {
    throw new Error(`Memory update promotion requires a memory_entry payload: ${proposal.proposal_id}`);
  }

  if (
    proposal.proposal_kind === "init_bootstrap" &&
    proposal.promotion_payload.payload_type !== "init_agent_instructions" &&
    proposal.promotion_payload.payload_type !== "init_local_config" &&
    proposal.promotion_payload.payload_type !== "init_source_pointers" &&
    proposal.promotion_payload.payload_type !== "init_context_pointers" &&
    proposal.promotion_payload.payload_type !== "init_eval_baseline"
  ) {
    throw new Error(`Init bootstrap promotion requires an init bootstrap payload: ${proposal.proposal_id}`);
  }

  if (proposal.proposal_kind !== "memory_update" && proposal.proposal_kind !== "init_bootstrap") {
    throw new Error(`Promotion currently supports memory_update and init_bootstrap proposals only: ${proposal.proposal_kind}`);
  }

  return proposal.promotion_payload;
}

function assertPromotionReferencesApprovedProposal(promotion: KrnProposalPromotion, targetRoot: string): void {
  const proposalRecords = listKrnProposalStoreRecords(targetRoot);
  const proposalRecord = proposalRecords.valid_records.find(
    (record) => record.proposal.proposal_id === promotion.proposal_id && record.proposal_path === promotion.proposal_path,
  );
  if (!proposalRecord) {
    throw new Error(`Promotion references missing proposal: ${promotion.proposal_id} at ${promotion.proposal_path}`);
  }

  const decisionRecords = listKrnProposalReviewDecisionStoreRecords(targetRoot);
  const decisionRecord = decisionRecords.valid_records.find(
    (record) => record.decision.decision_id === promotion.decision_id && record.decision_path === promotion.decision_path,
  );
  if (!decisionRecord) {
    throw new Error(`Promotion references missing review decision: ${promotion.decision_id} at ${promotion.decision_path}`);
  }

  if (decisionRecord.decision.decision !== "approved_for_promotion") {
    throw new Error(`Promotion requires approved_for_promotion decision: ${promotion.decision_id}`);
  }

  if (
    decisionRecord.decision.proposal_id !== promotion.proposal_id ||
    decisionRecord.decision.proposal_path !== promotion.proposal_path
  ) {
    throw new Error("Promotion review decision does not reference the same proposal");
  }

  const proposal = proposalRecord.proposal;
  const promotionPayload = promotionPayloadForProposal(proposal);

  if (proposal.target.target_type !== "path") {
    throw new Error("Promotion requires a path proposal target");
  }

  if (
    promotion.proposal_kind !== proposal.proposal_kind ||
    promotion.target.path !== proposal.target.path ||
    promotion.target.path !== promotionPayload.target_path ||
    promotion.target.file_content !== promotionPayload.file_content ||
    promotion.target.content_sha256 !== promotionPayload.content_sha256 ||
    sha256(promotion.target.file_content) !== promotion.target.content_sha256
  ) {
    throw new Error("Promotion target content must exactly match the proposal promotion payload");
  }
}

function assertSourceRefs(promotion: KrnProposalPromotion, targetRoot: string): void {
  const sourceValidation = validateSourceRefs(promotion.source_refs, targetRoot);
  if (!sourceValidation.valid) {
    throw new Error(`Promotion source_refs are not backed by target sources: ${sourceValidation.rejected.join(", ")}`);
  }
}

function assertNoExistingPromotion(promotion: KrnProposalPromotion, targetRoot: string, currentPromotionPath: string): void {
  const promotionRecords = listKrnProposalPromotionStoreRecords(targetRoot);
  const existingPromotion = promotionRecords.valid_records.find(
    (record) => record.promotion.proposal_id === promotion.proposal_id && record.promotion_path !== currentPromotionPath,
  );

  if (existingPromotion) {
    throw new Error(`Proposal already has a promotion record: ${promotion.proposal_id} at ${existingPromotion.promotion_path}`);
  }
}

function writeTargetIfRequested(promotion: KrnProposalPromotion, targetRoot: string): boolean {
  if (promotion.apply_mode === "record_only") {
    return false;
  }

  const targetPath = assertSafePromotionTarget(promotion, targetRoot);
  if (existsSync(targetPath)) {
    throw new Error(`Promotion target already exists and will not be overwritten: ${promotion.target.path}`);
  }

  mkdirSync(dirname(targetPath), { recursive: true });
  writeFileSync(targetPath, promotion.target.file_content, { encoding: "utf8", flag: "wx" });
  return true;
}

function buildStoreResult(
  promotion: KrnProposalPromotion,
  targetRoot: string,
  promotionPath: string,
  status: ProposalPromotionStoreResult["status"],
  targetWritten: boolean,
  now: Date,
): ProposalPromotionStoreResult {
  return {
    schema_version: "krn-proposal-promotion-store-result.v1",
    kind: "krn_proposal_promotion_store_result",
    target_root: targetRoot,
    promotion_id: promotion.promotion_id,
    proposal_id: promotion.proposal_id,
    decision_id: promotion.decision_id,
    promotion_path: relative(targetRoot, promotionPath).replaceAll("\\", "/"),
    idempotency_key: promotion.write_policy.idempotency_key,
    status,
    target_written: targetWritten,
    source_refs_validated: [...promotion.source_refs],
    created_at: now.toISOString(),
    interpretation_caveat:
      "The proposal promotion was persisted under .krn/promotions; target writes happen only in explicit apply_exact_target_write mode and do not prove dashboard/API readiness, human review quality, or productivity lift.",
  };
}

export function storeKrnProposalPromotion(input: unknown, options: StoreOptions = {}): ProposalPromotionStoreResult {
  const promotion = parseKrnProposalPromotion(input);
  const targetRoot = resolve(options.targetInput ?? ".");
  const now = options.now ?? new Date();

  assertSafePromotionTarget(promotion, targetRoot);
  assertPromotionReferencesApprovedProposal(promotion, targetRoot);
  assertSourceRefs(promotion, targetRoot);

  const promotionDir = resolve(targetRoot, ".krn", "promotions", safePathSegment(promotion.write_policy.idempotency_key));
  const promotionPath = resolve(promotionDir, "promotion.json");
  const promotionJson = normalizedPromotionJson(promotion);
  const promotionRelativePath = relative(targetRoot, promotionPath).replaceAll("\\", "/");

  if (existsSync(promotionPath)) {
    const existingPromotion = parseKrnProposalPromotion(readJsonFile(promotionPath));
    const existingJson = normalizedPromotionJson(existingPromotion);
    if (
      existingPromotion.write_policy.idempotency_key !== promotion.write_policy.idempotency_key ||
      existingJson !== promotionJson
    ) {
      throw new Error(`Conflicting proposal promotion for idempotency_key: ${promotion.write_policy.idempotency_key}`);
    }

    if (promotion.apply_mode === "apply_exact_target_write") {
      const targetPath = assertSafePromotionTarget(promotion, targetRoot);
      if (!existsSync(targetPath) || readFileSync(targetPath, "utf8") !== promotion.target.file_content) {
        throw new Error(`Existing apply promotion has no matching target content: ${promotion.target.path}`);
      }
    }

    return buildStoreResult(promotion, targetRoot, promotionPath, "already_stored", false, now);
  }

  assertNoExistingPromotion(promotion, targetRoot, promotionRelativePath);

  mkdirSync(promotionDir, { recursive: true });
  writeFileSync(promotionPath, promotionJson, { encoding: "utf8", flag: "wx" });

  try {
    const targetWritten = writeTargetIfRequested(promotion, targetRoot);
    return buildStoreResult(promotion, targetRoot, promotionPath, "stored", targetWritten, now);
  } catch (error: unknown) {
    rmSync(promotionDir, { recursive: true, force: true });
    throw error;
  }
}

export function listKrnProposalPromotionStoreRecords(targetInput = "."): ProposalPromotionStoreRecordList {
  const targetRoot = resolve(targetInput);
  const promotionRoot = resolve(targetRoot, ".krn", "promotions");
  const validRecords: ValidProposalPromotionStoreRecord[] = [];
  const invalidRecords: InvalidProposalPromotionStoreRecord[] = [];

  for (const promotionPath of collectPromotionFiles(promotionRoot)) {
    const promotionRelativePath = relative(targetRoot, promotionPath).replaceAll("\\", "/");
    try {
      const promotion = parseKrnProposalPromotion(readJsonFile(promotionPath));
      validRecords.push({
        promotion_path: promotionRelativePath,
        idempotency_key: promotion.write_policy.idempotency_key,
        promotion,
      });
    } catch (error: unknown) {
      invalidRecords.push({
        promotion_path: promotionRelativePath,
        error_summary: error instanceof Error ? error.message : "unknown proposal promotion parse error",
      });
    }
  }

  return {
    target_root: targetRoot,
    promotion_root: relative(targetRoot, promotionRoot).replaceAll("\\", "/"),
    total_records: validRecords.length + invalidRecords.length,
    valid_records: validRecords,
    invalid_records: invalidRecords,
    interpretation_caveat:
      "This list reports local proposal promotion records only; it does not prove dashboard/API readiness, ChatGPT connector behavior, human review quality, or productivity lift.",
  };
}
