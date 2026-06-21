import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import {
  KRN_STORE_CONTROL_PLANE_PROPOSAL_TOOL,
  parseKrnControlPlaneProposal,
  parseKrnControlPlaneResource,
  parseKrnMcpProposalToolResult,
  type KrnControlPlaneProposal,
} from "@krn/contracts";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function copyJsonFixture(targetRoot: string, fixturePath: string, runtimePath: string): void {
  const absoluteRuntimePath = join(targetRoot, runtimePath);
  mkdirSync(dirname(absoluteRuntimePath), { recursive: true });
  writeFileSync(absoluteRuntimePath, readFileSync(join(root, fixturePath), "utf8"), "utf8");
}

function writeText(path: string, content: string): void {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, content, "utf8");
}

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(join(root, path), "utf8")) as unknown;
}

function createRuntimeTarget(): string {
  const targetRoot = mkdtempSync(join(tmpdir(), "krn-mcp-stdio-"));
  copyJsonFixture(
    targetRoot,
    "docs/specs/krn-init/examples/init-manifest.example.json",
    ".krn/init/20260619T220000Z-test/manifest.json",
  );
  copyJsonFixture(
    targetRoot,
    "docs/specs/krn-doctor/examples/doctor-report.example.json",
    ".krn/doctor/20260619T220100Z-test/report.json",
  );
  copyJsonFixture(
    targetRoot,
    "docs/specs/krn-eval/examples/krn-eval-report.example.json",
    ".krn/eval/20260619T220200Z-test/report.json",
  );
  copyJsonFixture(
    targetRoot,
    "docs/specs/krn-review/examples/krn-review-report.example.json",
    ".krn/review/20260619T220300Z-test/report.json",
  );
  copyJsonFixture(
    targetRoot,
    "docs/specs/krn-benchmark-report/examples/benchmark-report.example.json",
    ".krn/benchmarks/krn-benchmark-spine/20260619T220400Z-test/report.json",
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
    readJson("docs/specs/krn-control-plane-proposal/examples/control-plane-proposal.example.json"),
  );
}

function badSourceRefProposal(): KrnControlPlaneProposal {
  return parseKrnControlPlaneProposal(
    readJson("docs/specs/krn-control-plane-proposal/fixtures/bad-unbacked-source-ref.example.json"),
  );
}

async function withClient<T>(targetRoot: string, callback: (client: Client) => Promise<T>): Promise<T> {
  const client = new Client({ name: "krn-mcp-stdio-test", version: "0.0.0" });
  const transport = new StdioClientTransport({
    command: "pnpm",
    args: ["--silent", "exec", "tsx", "packages/mcp/src/stdio.ts", "--target", targetRoot],
    cwd: root,
    stderr: "pipe",
  });

  await client.connect(transport);
  try {
    return await callback(client);
  } finally {
    await client.close();
  }
}

describe("KRN MCP stdio server", () => {
  it("lists and reads allowlisted read-only runtime resources over stdio", async () => {
    const targetRoot = createRuntimeTarget();

    await withClient(targetRoot, async (client) => {
      const resources = await client.listResources();
      expect(resources.resources.map((resource) => resource.uri)).toEqual([
        "krn://runtime/summary",
        "krn://runtime/init/latest",
        "krn://runtime/doctor/latest",
        "krn://runtime/eval/latest",
        "krn://runtime/review/latest",
        "krn://runtime/benchmark/latest",
      ]);

      const summary = await client.readResource({ uri: "krn://runtime/summary" });
      const latestReview = await client.readResource({ uri: "krn://runtime/review/latest" });
      const latestBenchmark = await client.readResource({ uri: "krn://runtime/benchmark/latest" });
      const parsedSummary = parseKrnControlPlaneResource(JSON.parse(summary.contents[0]?.text ?? "null") as unknown);
      const parsedReview = parseKrnControlPlaneResource(JSON.parse(latestReview.contents[0]?.text ?? "null") as unknown);
      const parsedBenchmark = parseKrnControlPlaneResource(
        JSON.parse(latestBenchmark.contents[0]?.text ?? "null") as unknown,
      );

      expect(parsedSummary.read_only).toBe(true);
      expect(parsedSummary.payload?.kind).toBe("runtime_summary");
      expect(parsedSummary.payload?.write_tools_enabled).toBe(false);
      expect(parsedSummary.payload?.proposal_tools_enabled).toBe(false);
      expect(parsedReview.read_only).toBe(true);
      expect(parsedReview.resource_kind).toBe("review_report");
      expect(parsedBenchmark.read_only).toBe(true);
      expect(parsedBenchmark.resource_kind).toBe("benchmark_report");
    });
  }, 15_000);

  it("rejects unknown resource URIs and exposes only the proposal store tool", async () => {
    const targetRoot = createRuntimeTarget();

    await withClient(targetRoot, async (client) => {
      const tools = await client.listTools();
      expect(tools.tools.map((tool) => tool.name)).toEqual([KRN_STORE_CONTROL_PLANE_PROPOSAL_TOOL]);
      expect(tools.tools[0]?.annotations).toMatchObject({
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      });
      await expect(client.readResource({ uri: "krn://runtime/unknown" })).rejects.toThrow();
    });
  }, 15_000);

  it("stores a source-backed proposal through the MCP tool without mutating the target path", async () => {
    const targetRoot = createRuntimeTarget();

    await withClient(targetRoot, async (client) => {
      const proposal = validProposal();
      const targetPath = proposal.target.target_type === "path" ? proposal.target.path : null;
      const first = await client.callTool({
        name: KRN_STORE_CONTROL_PLANE_PROPOSAL_TOOL,
        arguments: proposal,
      });
      if (!("structuredContent" in first)) {
        throw new Error("MCP tool result did not include structuredContent");
      }
      const firstResult = parseKrnMcpProposalToolResult(first.structuredContent);

      expect(first.isError).not.toBe(true);
      expect(firstResult.status).toBe("stored");
      expect(firstResult.approved).toBe(false);
      expect(firstResult.mutated_target).toBe(false);
      expect(firstResult.source_refs).not.toContain("docs/goals/goal-038.md");
      expect(firstResult.proposal_store.proposal_path).toMatch(/^\.krn\/proposals\/.+\/proposal\.json$/);
      expect(existsSync(join(targetRoot, firstResult.proposal_store.proposal_path))).toBe(true);
      expect(targetPath === null || existsSync(join(targetRoot, targetPath))).toBe(false);

      const second = await client.callTool({
        name: KRN_STORE_CONTROL_PLANE_PROPOSAL_TOOL,
        arguments: proposal,
      });
      if (!("structuredContent" in second)) {
        throw new Error("MCP duplicate result did not include structuredContent");
      }
      const secondResult = parseKrnMcpProposalToolResult(second.structuredContent);

      expect(secondResult.status).toBe("already_stored");
      expect(secondResult.proposal_store.proposal_path).toBe(firstResult.proposal_store.proposal_path);
      expect(proposalFiles(targetRoot)).toHaveLength(1);
    });
  }, 15_000);

  it("returns tool errors for invalid proposals without creating proposal records", async () => {
    const badSourceTarget = createRuntimeTarget();
    await withClient(badSourceTarget, async (client) => {
      const result = await client.callTool({
        name: KRN_STORE_CONTROL_PLANE_PROPOSAL_TOOL,
        arguments: badSourceRefProposal(),
      });

      expect(result.isError).toBe(true);
      expect(proposalFiles(badSourceTarget)).toEqual([]);
    });

    const unsafePathTarget = createRuntimeTarget();
    await withClient(unsafePathTarget, async (client) => {
      const proposal = validProposal();
      const result = await client.callTool({
        name: KRN_STORE_CONTROL_PLANE_PROPOSAL_TOOL,
        arguments: {
          ...proposal,
          target: {
            target_type: "path",
            path: "../outside.md",
          },
        },
      });

      expect(result.isError).toBe(true);
      expect(proposalFiles(unsafePathTarget)).toEqual([]);
    });
  }, 20_000);
});
