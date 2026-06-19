import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { parseKrnControlPlaneResource } from "@krn/contracts";
import { describe, expect, it } from "vitest";

const root = process.cwd();

function copyJsonFixture(targetRoot: string, fixturePath: string, runtimePath: string): void {
  const absoluteRuntimePath = join(targetRoot, runtimePath);
  mkdirSync(dirname(absoluteRuntimePath), { recursive: true });
  writeFileSync(absoluteRuntimePath, readFileSync(join(root, fixturePath), "utf8"), "utf8");
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
  return targetRoot;
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
      ]);

      const summary = await client.readResource({ uri: "krn://runtime/summary" });
      const latestReview = await client.readResource({ uri: "krn://runtime/review/latest" });
      const parsedSummary = parseKrnControlPlaneResource(JSON.parse(summary.contents[0]?.text ?? "null") as unknown);
      const parsedReview = parseKrnControlPlaneResource(JSON.parse(latestReview.contents[0]?.text ?? "null") as unknown);

      expect(parsedSummary.read_only).toBe(true);
      expect(parsedSummary.payload?.kind).toBe("runtime_summary");
      expect(parsedSummary.payload?.write_tools_enabled).toBe(false);
      expect(parsedSummary.payload?.proposal_tools_enabled).toBe(false);
      expect(parsedReview.read_only).toBe(true);
      expect(parsedReview.resource_kind).toBe("review_report");
    });
  }, 15_000);

  it("rejects unknown resource URIs and exposes no tools", async () => {
    const targetRoot = createRuntimeTarget();

    await withClient(targetRoot, async (client) => {
      expect(client.getServerCapabilities()?.tools).toBeUndefined();
      await expect(client.readResource({ uri: "krn://runtime/unknown" })).rejects.toThrow();
    });
  }, 15_000);
});
