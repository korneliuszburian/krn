import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import {
  KRN_STORE_CONTROL_PLANE_PROPOSAL_TOOL,
  parseKrnControlPlaneProposal,
  parseKrnControlPlaneResource,
  parseKrnMcpProposalToolResult,
  type KrnControlPlaneProposal,
} from "@krn/contracts";

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
  schema_version: "krn-mcp-proposal-tool-eval-result.v1";
  kind: "krn_mcp_proposal_tool_eval_result";
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
  tool_name: typeof KRN_STORE_CONTROL_PLANE_PROPOSAL_TOOL;
  interpretation_caveat: string;
};

const REQUIRED_URIS = [
  "krn://runtime/summary",
  "krn://runtime/init/latest",
  "krn://runtime/doctor/latest",
  "krn://runtime/eval/latest",
  "krn://runtime/review/latest",
] as const;

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

function copyJsonFixture(targetRoot: string, fixturePath: string, runtimePath: string): void {
  const absoluteRuntimePath = join(targetRoot, runtimePath);
  mkdirSync(dirname(absoluteRuntimePath), { recursive: true });
  writeFileSync(absoluteRuntimePath, readFileSync(resolve(fixturePath), "utf8"), "utf8");
}

function createMcpTarget(): string {
  const targetRoot = mkdtempSync(join(tmpdir(), "krn-mcp-proposal-tool-eval-"));
  copyJsonFixture(
    targetRoot,
    "docs/specs/krn-init/examples/init-manifest.example.json",
    ".krn/init/20260619T220000Z-tool/manifest.json",
  );
  copyJsonFixture(
    targetRoot,
    "docs/specs/krn-doctor/examples/doctor-report.example.json",
    ".krn/doctor/20260619T220100Z-tool/report.json",
  );
  copyJsonFixture(
    targetRoot,
    "docs/specs/krn-eval/examples/krn-eval-report.example.json",
    ".krn/eval/20260619T220200Z-tool/report.json",
  );
  copyJsonFixture(
    targetRoot,
    "docs/specs/krn-review/examples/krn-review-report.example.json",
    ".krn/review/20260619T220300Z-tool/report.json",
  );
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
      "",
      "| ID | Evidence | Product implication |",
      "|---|---|---|",
      "| LOCAL017 | Source-backed proposal store exists. | Proposal tools must reuse the store. |",
      "",
    ].join("\n"),
  );
  return targetRoot;
}

function collectFiles(targetRoot: string, prefix = ""): string[] {
  const absoluteRoot = join(targetRoot, prefix);
  if (!existsSync(absoluteRoot)) {
    return [];
  }
  return readdirSync(absoluteRoot, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = join(prefix, entry.name);
    if (entry.isDirectory()) {
      return collectFiles(targetRoot, entryPath);
    }
    return entryPath.replaceAll("\\", "/");
  });
}

function proposalFiles(targetRoot: string): string[] {
  return collectFiles(targetRoot, ".krn/proposals").filter((file) => file.endsWith("proposal.json"));
}

function validProposal(): KrnControlPlaneProposal {
  return parseKrnControlPlaneProposal(
    readJson(resolve("docs/specs/krn-control-plane-proposal/examples/control-plane-proposal.example.json")),
  );
}

function badSourceRefProposal(): KrnControlPlaneProposal {
  return parseKrnControlPlaneProposal(
    readJson(resolve("docs/specs/krn-control-plane-proposal/fixtures/bad-unbacked-source-ref.example.json")),
  );
}

function resourceText(content: unknown): string {
  if (!content || typeof content !== "object") {
    throw new Error("MCP resource content missing text payload");
  }

  const text = (content as { text?: unknown }).text;
  if (typeof text !== "string") {
    throw new Error("MCP resource content missing text payload");
  }

  return text;
}

function hasRequiredUris(uris: readonly string[]): boolean {
  return REQUIRED_URIS.every((uri) => uris.includes(uri));
}

async function withClient<T>(targetRoot: string, callback: (client: Client) => Promise<T>): Promise<T> {
  const client = new Client({ name: "krn-mcp-proposal-tool-eval", version: "0.0.0" });
  const transport = new StdioClientTransport({
    command: "pnpm",
    args: ["--silent", "exec", "tsx", "packages/mcp/src/stdio.ts", "--target", targetRoot],
    cwd: process.cwd(),
    stderr: "pipe",
  });

  await client.connect(transport);
  try {
    return await callback(client);
  } finally {
    await client.close();
  }
}

async function runValidation(): Promise<EvalReport> {
  const now = new Date();
  const runId = createRunId(now);
  const cases = parseCases(readJson(resolve("docs/evals/krn-mcp-proposal-tool/cases.json")));
  const caseById = new Map(cases.map((testCase) => [testCase.id, testCase]));
  const results: CaseResult[] = [];
  let storedProposalPath: string | null = null;

  const listCase = caseById.get("proposal-tool-listed-with-read-resources");
  if (!listCase) {
    throw new Error("Missing case proposal-tool-listed-with-read-resources");
  }
  try {
    const targetRoot = createMcpTarget();
    await withClient(targetRoot, async (client) => {
      const resources = await client.listResources();
      const tools = await client.listTools();
      const uris = resources.resources.map((resource) => resource.uri);
      const toolNames = tools.tools.map((tool) => tool.name);
      const annotations = tools.tools[0]?.annotations;
      results.push(
        result(
          listCase.id,
          hasRequiredUris(uris) &&
            uris.length === REQUIRED_URIS.length &&
            toolNames.length === 1 &&
            toolNames[0] === KRN_STORE_CONTROL_PLANE_PROPOSAL_TOOL &&
            annotations?.destructiveHint === false &&
            annotations.idempotentHint === true,
          ["allowlisted resources remain listed", "one proposal tool listed", "tool annotations are non-destructive hints only"],
          listCase.failure_mode,
          "STDIO MCP server listed read-only resources and the single proposal-store tool.",
        ),
      );
    });
  } catch (error: unknown) {
    results.push(
      result(
        listCase.id,
        false,
        ["proposal tool listed with read resources"],
        listCase.failure_mode,
        error instanceof Error ? error.message : "unknown tool listing error",
      ),
    );
  }

  const storeCase = caseById.get("source-backed-proposal-tool-stores");
  if (!storeCase) {
    throw new Error("Missing case source-backed-proposal-tool-stores");
  }
  try {
    const targetRoot = createMcpTarget();
    await withClient(targetRoot, async (client) => {
      const proposal = validProposal();
      const toolCall = await client.callTool({
        name: KRN_STORE_CONTROL_PLANE_PROPOSAL_TOOL,
        arguments: proposal,
      });
      if (!("structuredContent" in toolCall)) {
        throw new Error("MCP proposal tool result missing structuredContent");
      }
      const toolResult = parseKrnMcpProposalToolResult(toolCall.structuredContent);
      storedProposalPath = toolResult.proposal_store.proposal_path;
      const targetPath = proposal.target.target_type === "path" ? proposal.target.path : null;
      results.push(
        result(
          storeCase.id,
          toolCall.isError !== true &&
            toolResult.status === "stored" &&
            existsSync(join(targetRoot, toolResult.proposal_store.proposal_path)) &&
            (targetPath === null || !existsSync(join(targetRoot, targetPath))) &&
            toolResult.approved === false &&
            toolResult.mutated_target === false,
          [
            "tool call succeeds",
            "typed tool result parses",
            "proposal stored under .krn/proposals",
            "target path not mutated",
            "result does not approve proposal",
          ],
          storeCase.failure_mode,
          "MCP proposal tool stored a source-backed proposal through the append-only store.",
        ),
      );
    });
  } catch (error: unknown) {
    results.push(
      result(
        storeCase.id,
        false,
        ["source-backed proposal tool stores"],
        storeCase.failure_mode,
        error instanceof Error ? error.message : "unknown proposal tool store error",
      ),
    );
  }

  const duplicateCase = caseById.get("duplicate-idempotency-through-tool-stable");
  if (!duplicateCase) {
    throw new Error("Missing case duplicate-idempotency-through-tool-stable");
  }
  try {
    const targetRoot = createMcpTarget();
    await withClient(targetRoot, async (client) => {
      const first = await client.callTool({
        name: KRN_STORE_CONTROL_PLANE_PROPOSAL_TOOL,
        arguments: validProposal(),
      });
      const second = await client.callTool({
        name: KRN_STORE_CONTROL_PLANE_PROPOSAL_TOOL,
        arguments: validProposal(),
      });
      if (!("structuredContent" in first) || !("structuredContent" in second)) {
        throw new Error("MCP duplicate call missing structuredContent");
      }
      const firstResult = parseKrnMcpProposalToolResult(first.structuredContent);
      const secondResult = parseKrnMcpProposalToolResult(second.structuredContent);

      results.push(
        result(
          duplicateCase.id,
          firstResult.status === "stored" &&
            secondResult.status === "already_stored" &&
            firstResult.proposal_store.proposal_path === secondResult.proposal_store.proposal_path &&
            proposalFiles(targetRoot).length === 1,
          ["first call stored", "second call already stored", "same proposal path returned", "single proposal record exists"],
          duplicateCase.failure_mode,
          "Duplicate MCP proposal tool call returned the same proposal path.",
        ),
      );
    });
  } catch (error: unknown) {
    results.push(
      result(
        duplicateCase.id,
        false,
        ["duplicate proposal tool call stable"],
        duplicateCase.failure_mode,
        error instanceof Error ? error.message : "unknown duplicate tool call error",
      ),
    );
  }

  const unbackedCase = caseById.get("unbacked-source-ref-tool-error");
  if (!unbackedCase) {
    throw new Error("Missing case unbacked-source-ref-tool-error");
  }
  try {
    const targetRoot = createMcpTarget();
    await withClient(targetRoot, async (client) => {
      const toolCall = await client.callTool({
        name: KRN_STORE_CONTROL_PLANE_PROPOSAL_TOOL,
        arguments: badSourceRefProposal(),
      });

      results.push(
        result(
          unbackedCase.id,
          toolCall.isError === true && proposalFiles(targetRoot).length === 0,
          ["tool call returns error", "no proposal record created"],
          unbackedCase.failure_mode,
          "Schema-valid proposal with unbacked source refs returned an MCP tool error.",
        ),
      );
    });
  } catch (error: unknown) {
    results.push(
      result(
        unbackedCase.id,
        false,
        ["unbacked source ref tool error"],
        unbackedCase.failure_mode,
        error instanceof Error ? error.message : "unknown unbacked tool call error",
      ),
    );
  }

  const unsafePathCase = caseById.get("unsafe-target-path-tool-error");
  if (!unsafePathCase) {
    throw new Error("Missing case unsafe-target-path-tool-error");
  }
  try {
    const targetRoot = createMcpTarget();
    await withClient(targetRoot, async (client) => {
      const proposal = validProposal();
      const toolCall = await client.callTool({
        name: KRN_STORE_CONTROL_PLANE_PROPOSAL_TOOL,
        arguments: {
          ...proposal,
          target: {
            target_type: "path",
            path: "../outside.md",
          },
        },
      });

      results.push(
        result(
          unsafePathCase.id,
          toolCall.isError === true && proposalFiles(targetRoot).length === 0,
          ["tool call returns error", "no proposal record created"],
          unsafePathCase.failure_mode,
          "Unsafe proposal target path returned an MCP tool error.",
        ),
      );
    });
  } catch (error: unknown) {
    results.push(
      result(
        unsafePathCase.id,
        false,
        ["unsafe target path tool error"],
        unsafePathCase.failure_mode,
        error instanceof Error ? error.message : "unknown unsafe path tool call error",
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
    schema_version: "krn-mcp-proposal-tool-eval-result.v1",
    kind: "krn_mcp_proposal_tool_eval_result",
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
    tool_name: KRN_STORE_CONTROL_PLANE_PROPOSAL_TOOL,
    interpretation_caveat:
      "This eval proves the local STDIO MCP proposal-tool boundary only; it does not prove human approval quality, dashboard UI readiness, HTTP/API readiness, ChatGPT connector behavior, target mutation safety beyond .krn/proposals, or productivity lift.",
  };
}

export async function main(): Promise<void> {
  const report = await runValidation();
  const reportDir = resolve(".krn/evals/krn-mcp-proposal-tool", report.run_id);
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
  await main();
}
