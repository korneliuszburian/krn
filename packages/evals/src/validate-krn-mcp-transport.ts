import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { parseKrnControlPlaneResource } from "@krn/contracts";

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
  schema_version: "krn-mcp-transport-result.v1";
  kind: "krn_mcp_transport_result";
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
  generated_resource_uri: string | null;
  interpretation_caveat: string;
};

const REQUIRED_URIS = [
  "krn://runtime/summary",
  "krn://runtime/init/latest",
  "krn://runtime/doctor/latest",
  "krn://runtime/eval/latest",
  "krn://runtime/review/latest",
];

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

function hasRequiredUris(uris: readonly string[]): boolean {
  return REQUIRED_URIS.every((uri) => uris.includes(uri));
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

function copyJsonFixture(targetRoot: string, fixturePath: string, runtimePath: string): void {
  const absoluteRuntimePath = join(targetRoot, runtimePath);
  mkdirSync(dirname(absoluteRuntimePath), { recursive: true });
  writeFileSync(absoluteRuntimePath, readFileSync(resolve(fixturePath), "utf8"), "utf8");
}

function createRuntimeTarget(): string {
  const targetRoot = mkdtempSync(join(tmpdir(), "krn-mcp-transport-eval-"));
  copyJsonFixture(
    targetRoot,
    "docs/specs/krn-init/examples/init-manifest.example.json",
    ".krn/init/20260619T220000Z-transport/manifest.json",
  );
  copyJsonFixture(
    targetRoot,
    "docs/specs/krn-doctor/examples/doctor-report.example.json",
    ".krn/doctor/20260619T220100Z-transport/report.json",
  );
  copyJsonFixture(
    targetRoot,
    "docs/specs/krn-eval/examples/krn-eval-report.example.json",
    ".krn/eval/20260619T220200Z-transport/report.json",
  );
  copyJsonFixture(
    targetRoot,
    "docs/specs/krn-review/examples/krn-review-report.example.json",
    ".krn/review/20260619T220300Z-transport/report.json",
  );
  return targetRoot;
}

async function withClient<T>(targetRoot: string, callback: (client: Client) => Promise<T>): Promise<T> {
  const client = new Client({ name: "krn-mcp-transport-eval", version: "0.0.0" });
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
  const cases = parseCases(readJson(resolve("docs/evals/krn-mcp-transport/cases.json")));
  const caseById = new Map(cases.map((testCase) => [testCase.id, testCase]));
  const results: CaseResult[] = [];
  let generatedResourceUri: string | null = null;

  const listCase = caseById.get("stdio-server-lists-allowlisted-resources");
  if (!listCase) {
    throw new Error("Missing case stdio-server-lists-allowlisted-resources");
  }
  try {
    const targetRoot = createRuntimeTarget();
    await withClient(targetRoot, async (client) => {
      const resources = await client.listResources();
      const uris = resources.resources.map((resource) => resource.uri);
      const noToolsCapability = client.getServerCapabilities()?.tools === undefined;
      results.push(
        result(
          listCase.id,
          hasRequiredUris(uris) && uris.length === REQUIRED_URIS.length && noToolsCapability,
          ["stdio server starts", "allowlisted resources listed", "no tools capability advertised"],
          listCase.failure_mode,
          "STDIO MCP server listed allowlisted resources and advertised no tools capability.",
        ),
      );
    });
  } catch (error: unknown) {
    results.push(
      result(
        listCase.id,
        false,
        ["stdio server lists resources"],
        listCase.failure_mode,
        error instanceof Error ? error.message : "unknown stdio list error",
      ),
    );
  }

  const readCase = caseById.get("stdio-server-reads-schema-backed-resources");
  if (!readCase) {
    throw new Error("Missing case stdio-server-reads-schema-backed-resources");
  }
  try {
    const targetRoot = createRuntimeTarget();
    await withClient(targetRoot, async (client) => {
      const summaryResult = await client.readResource({ uri: "krn://runtime/summary" });
      const reviewResult = await client.readResource({ uri: "krn://runtime/review/latest" });
      const summary = parseKrnControlPlaneResource(JSON.parse(resourceText(summaryResult.contents[0])) as unknown);
      const review = parseKrnControlPlaneResource(JSON.parse(resourceText(reviewResult.contents[0])) as unknown);
      generatedResourceUri = summary.uri;
      results.push(
        result(
          readCase.id,
          summary.read_only &&
            summary.payload?.kind === "runtime_summary" &&
            summary.payload.write_tools_enabled === false &&
            summary.payload.proposal_tools_enabled === false &&
            review.read_only &&
            review.resource_kind === "review_report",
          ["summary resource parses", "latest review resource parses", "write and proposal tools disabled"],
          readCase.failure_mode,
          "STDIO MCP server returned schema-backed read-only summary and review resources.",
        ),
      );
    });
  } catch (error: unknown) {
    results.push(
      result(
        readCase.id,
        false,
        ["stdio server reads resources"],
        readCase.failure_mode,
        error instanceof Error ? error.message : "unknown stdio read error",
      ),
    );
  }

  const unknownUriCase = caseById.get("stdio-server-rejects-unknown-uri");
  if (!unknownUriCase) {
    throw new Error("Missing case stdio-server-rejects-unknown-uri");
  }
  try {
    const targetRoot = createRuntimeTarget();
    await withClient(targetRoot, async (client) => {
      let rejected = false;
      try {
        await client.readResource({ uri: "krn://runtime/unknown" });
      } catch {
        rejected = true;
      }

      results.push(
        result(
          unknownUriCase.id,
          rejected,
          ["unknown URI rejected"],
          unknownUriCase.failure_mode,
          "STDIO MCP server rejected an unknown resource URI.",
        ),
      );
    });
  } catch (error: unknown) {
    results.push(
      result(
        unknownUriCase.id,
        false,
        ["unknown URI rejected"],
        unknownUriCase.failure_mode,
        error instanceof Error ? error.message : "unknown URI rejection check failed",
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
    schema_version: "krn-mcp-transport-result.v1",
    kind: "krn_mcp_transport_result",
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
    generated_resource_uri: generatedResourceUri,
    interpretation_caveat:
      "This eval proves the local KRN MCP STDIO transport for read-only resources only; it does not prove ChatGPT connector behavior, dashboard readiness, write-tool safety, human approval, or productivity lift.",
  };
}

export async function main(): Promise<void> {
  const report = await runValidation();
  const reportDir = resolve(".krn/evals/krn-mcp-transport", report.run_id);
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
