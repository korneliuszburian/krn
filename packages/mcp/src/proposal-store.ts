import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { isAbsolute, relative, resolve } from "node:path";
import { parseKrnControlPlaneProposal, type KrnControlPlaneProposal } from "@krn/contracts";

type SourceRefStatus = "source_id" | "ledger_url" | "local_path";

export type SourceRefValidationResult = {
  valid: boolean;
  accepted: Array<{ ref: string; status: SourceRefStatus }>;
  rejected: string[];
  checked_against: string[];
  interpretation_caveat: string;
};

export type ProposalStoreResult = {
  schema_version: "krn-proposal-store-result.v1";
  kind: "krn_proposal_store_result";
  target_root: string;
  proposal_id: string;
  proposal_path: string;
  idempotency_key: string;
  status: "stored" | "already_stored";
  source_refs_validated: string[];
  created_at: string;
  interpretation_caveat: string;
};

type StoreOptions = {
  targetInput?: string;
  now?: Date;
};

const SOURCE_ID_PATTERN = /^(?:S|C|LOCAL)\d{3}$/;

function readJsonFile(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8")) as unknown;
}

function readOptionalText(path: string): string | null {
  if (!existsSync(path) || !statSync(path).isFile()) {
    return null;
  }
  return readFileSync(path, "utf8");
}

function sourceIdsFromLedger(ledgerText: string | null): Set<string> {
  return new Set(ledgerText?.match(/\b(?:S|C|LOCAL)\d{3}\b/g) ?? []);
}

function isInsideTarget(targetRoot: string, candidatePath: string): boolean {
  const relativePath = relative(targetRoot, candidatePath);
  return relativePath.length === 0 || (!relativePath.startsWith("..") && !isAbsolute(relativePath));
}

function existingLocalSourceRef(targetRoot: string, sourceRef: string): boolean {
  if (sourceRef.includes("\0") || sourceRef.startsWith("http://") || sourceRef.startsWith("https://")) {
    return false;
  }

  const candidatePath = resolve(targetRoot, sourceRef);
  return isInsideTarget(targetRoot, candidatePath) && existsSync(candidatePath) && statSync(candidatePath).isFile();
}

function sourceRefStatus(
  targetRoot: string,
  sourceRef: string,
  sourceIds: ReadonlySet<string>,
  sourceLedgerText: string | null,
): SourceRefStatus | null {
  if (SOURCE_ID_PATTERN.test(sourceRef) && sourceIds.has(sourceRef)) {
    return "source_id";
  }

  if ((sourceRef.startsWith("http://") || sourceRef.startsWith("https://")) && sourceLedgerText?.includes(sourceRef)) {
    return "ledger_url";
  }

  if (existingLocalSourceRef(targetRoot, sourceRef)) {
    return "local_path";
  }

  return null;
}

export function validateProposalSourceRefs(
  proposal: KrnControlPlaneProposal,
  targetInput = ".",
): SourceRefValidationResult {
  const targetRoot = resolve(targetInput);
  const sourceLedgerPath = resolve(targetRoot, "docs/plans/canonical/SOURCES.md");
  const sourceLedgerText = readOptionalText(sourceLedgerPath);
  const sourceIds = sourceIdsFromLedger(sourceLedgerText);
  const accepted: SourceRefValidationResult["accepted"] = [];
  const rejected: string[] = [];

  for (const sourceRef of proposal.source_refs) {
    const status = sourceRefStatus(targetRoot, sourceRef, sourceIds, sourceLedgerText);
    if (status) {
      accepted.push({ ref: sourceRef, status });
    } else {
      rejected.push(sourceRef);
    }
  }

  return {
    valid: rejected.length === 0,
    accepted,
    rejected,
    checked_against: [relative(targetRoot, sourceLedgerPath).replaceAll("\\", "/"), "existing target-root files"],
    interpretation_caveat:
      "This validation proves proposal source_refs resolve to the target source ledger or existing target-root files only; it does not approve the proposal or verify evidence_refs.",
  };
}

function safePathSegment(input: string): string {
  const slug = input
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
  const digest = createHash("sha256").update(input).digest("hex").slice(0, 12);
  return `${slug || "proposal"}-${digest}`;
}

function normalizedProposalJson(proposal: KrnControlPlaneProposal): string {
  return `${JSON.stringify(proposal, null, 2)}\n`;
}

function assertSafeTarget(proposal: KrnControlPlaneProposal, targetRoot: string): void {
  if (proposal.target.target_type === "resource_uri") {
    if (!proposal.target.uri.startsWith("krn://")) {
      throw new Error(`Proposal target resource URI is not a KRN URI: ${proposal.target.uri}`);
    }
    return;
  }

  const candidatePath = resolve(targetRoot, proposal.target.path);
  if (proposal.target.path.includes("\0") || !isInsideTarget(targetRoot, candidatePath)) {
    throw new Error(`Proposal target path must stay inside target root: ${proposal.target.path}`);
  }
}

function buildStoreResult(
  proposal: KrnControlPlaneProposal,
  targetRoot: string,
  proposalPath: string,
  status: ProposalStoreResult["status"],
  now: Date,
): ProposalStoreResult {
  return {
    schema_version: "krn-proposal-store-result.v1",
    kind: "krn_proposal_store_result",
    target_root: targetRoot,
    proposal_id: proposal.proposal_id,
    proposal_path: relative(targetRoot, proposalPath).replaceAll("\\", "/"),
    idempotency_key: proposal.write_policy.idempotency_key,
    status,
    source_refs_validated: [...proposal.source_refs],
    created_at: now.toISOString(),
    interpretation_caveat:
      "The proposal was persisted as append-only review input under .krn/proposals only; this does not approve the proposal, mutate its target, publish a dashboard event, or expose an MCP write tool.",
  };
}

export function storeKrnControlPlaneProposal(input: unknown, options: StoreOptions = {}): ProposalStoreResult {
  const proposal = parseKrnControlPlaneProposal(input);
  const targetRoot = resolve(options.targetInput ?? ".");
  const now = options.now ?? new Date();
  const sourceValidation = validateProposalSourceRefs(proposal, targetRoot);

  if (!sourceValidation.valid) {
    throw new Error(`Proposal source_refs are not backed by target sources: ${sourceValidation.rejected.join(", ")}`);
  }

  assertSafeTarget(proposal, targetRoot);

  const proposalDir = resolve(targetRoot, ".krn", "proposals", safePathSegment(proposal.write_policy.idempotency_key));
  const proposalPath = resolve(proposalDir, "proposal.json");
  const proposalJson = normalizedProposalJson(proposal);

  if (existsSync(proposalPath)) {
    const existingProposal = parseKrnControlPlaneProposal(readJsonFile(proposalPath));
    const existingJson = normalizedProposalJson(existingProposal);
    if (
      existingProposal.write_policy.idempotency_key !== proposal.write_policy.idempotency_key ||
      existingJson !== proposalJson
    ) {
      throw new Error(`Conflicting proposal for idempotency_key: ${proposal.write_policy.idempotency_key}`);
    }

    return buildStoreResult(proposal, targetRoot, proposalPath, "already_stored", now);
  }

  mkdirSync(proposalDir, { recursive: true });
  writeFileSync(proposalPath, proposalJson, { encoding: "utf8", flag: "wx" });

  return buildStoreResult(proposal, targetRoot, proposalPath, "stored", now);
}
