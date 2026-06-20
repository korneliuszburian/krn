import { z } from "zod";

const ProposalStoreStatusSchema = z.enum(["stored", "already_stored"]);

const ProposalStoreResultSchema = z
  .object({
    schema_version: z.literal("krn-proposal-store-result.v1"),
    kind: z.literal("krn_proposal_store_result"),
    target_root: z.string().min(1),
    proposal_id: z.string().min(1),
    proposal_path: z.string().min(1),
    idempotency_key: z.string().min(1),
    status: ProposalStoreStatusSchema,
    source_refs_validated: z.array(z.string().min(1)).min(1),
    created_at: z.string().min(1),
    interpretation_caveat: z.string().min(1),
  })
  .strict();

export const KRN_STORE_CONTROL_PLANE_PROPOSAL_TOOL = "krn_store_control_plane_proposal" as const;

export const KrnMcpProposalToolResultSchema = z
  .object({
    schema_version: z.literal("krn-mcp-proposal-tool-result.v1"),
    kind: z.literal("krn_mcp_proposal_tool_result"),
    tool_name: z.literal(KRN_STORE_CONTROL_PLANE_PROPOSAL_TOOL),
    status: ProposalStoreStatusSchema,
    proposal_store: ProposalStoreResultSchema,
    approved: z.literal(false),
    mutated_target: z.literal(false),
    blocked_surfaces: z.array(z.string().min(1)).min(1),
    source_refs: z.array(z.string().min(1)).min(1),
    interpretation_caveat: z.string().min(1),
  })
  .strict();

export type KrnMcpProposalToolResult = z.infer<typeof KrnMcpProposalToolResultSchema>;

export function parseKrnMcpProposalToolResult(input: unknown): KrnMcpProposalToolResult {
  return KrnMcpProposalToolResultSchema.parse(input);
}

export const krnMcpProposalToolResultJsonSchema = z.toJSONSchema(KrnMcpProposalToolResultSchema, {
  target: "draft-2020-12",
});
