import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { relative, resolve } from "node:path";
import {
  parseDoctorReport,
  parseInitManifest,
  parseKrnBenchmarkReport,
  parseKrnControlPlaneResource,
  parseKrnControlPlaneResourceIndex,
  parseKrnEvalReport,
  parseKrnReviewReport,
  type ControlPlaneResourceDescriptor,
  type ControlPlaneResourcePayload,
  type KrnControlPlaneResource,
  type KrnControlPlaneResourceIndex,
} from "@krn/contracts";

type ArtifactSpec = {
  uri: string;
  name: string;
  description: string;
  resourceKind: Exclude<ControlPlaneResourceDescriptor["resource_kind"], "runtime_summary">;
  runtimeDir: string;
  fileName: string;
  sourceRefs: readonly string[];
  parse: (input: unknown) => ControlPlaneResourcePayload;
};

const RESOURCE_SOURCE_REFS = [
  "docs/specs/krn-mcp-read-model/README.md",
  "https://developers.openai.com/codex/mcp",
] as const;

const ARTIFACT_SPECS: readonly ArtifactSpec[] = [
  {
    uri: "krn://runtime/init/latest",
    name: "Latest KRN init manifest",
    description: "Latest schema-backed krn init --dry-run manifest.",
    resourceKind: "init_manifest",
    runtimeDir: ".krn/init",
    fileName: "manifest.json",
    sourceRefs: ["docs/specs/krn-init/README.md"],
    parse: parseInitManifest,
  },
  {
    uri: "krn://runtime/doctor/latest",
    name: "Latest KRN doctor report",
    description: "Latest schema-backed krn doctor readiness report.",
    resourceKind: "doctor_report",
    runtimeDir: ".krn/doctor",
    fileName: "report.json",
    sourceRefs: ["docs/specs/krn-doctor/README.md"],
    parse: parseDoctorReport,
  },
  {
    uri: "krn://runtime/eval/latest",
    name: "Latest KRN eval aggregate",
    description: "Latest schema-backed krn eval aggregate report.",
    resourceKind: "eval_report",
    runtimeDir: ".krn/eval",
    fileName: "report.json",
    sourceRefs: ["docs/specs/krn-eval/README.md"],
    parse: parseKrnEvalReport,
  },
  {
    uri: "krn://runtime/review/latest",
    name: "Latest KRN review report",
    description: "Latest schema-backed proposal-only krn review report.",
    resourceKind: "review_report",
    runtimeDir: ".krn/review",
    fileName: "report.json",
    sourceRefs: ["docs/specs/krn-review/README.md"],
    parse: parseKrnReviewReport,
  },
  {
    uri: "krn://runtime/benchmark/latest",
    name: "Latest KRN benchmark report",
    description: "Latest schema-backed KRN benchmark report.",
    resourceKind: "benchmark_report",
    runtimeDir: ".krn/benchmarks",
    fileName: "report.json",
    sourceRefs: ["docs/specs/krn-benchmark-report/README.md"],
    parse: parseKrnBenchmarkReport,
  },
] as const;

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

function collectRuntimeFiles(root: string, fileName: string): string[] {
  return readdirSync(root, { withFileTypes: true }).flatMap((entry) => {
    const entryPath = resolve(root, entry.name);
    if (entry.isDirectory()) {
      return collectRuntimeFiles(entryPath, fileName);
    }
    return entry.name === fileName ? [entryPath] : [];
  });
}

function runtimeFileSortKey(path: string): string {
  const segments = path.replaceAll("\\", "/").split("/");
  return `${segments.at(-2) ?? ""}/${path}`;
}

function latestRuntimeFile(targetRoot: string, runtimeDir: string, fileName: string): string | null {
  const absoluteRuntimeDir = resolve(targetRoot, runtimeDir);
  if (!existsSync(absoluteRuntimeDir) || !statSync(absoluteRuntimeDir).isDirectory()) {
    return null;
  }

  const candidates = collectRuntimeFiles(absoluteRuntimeDir, fileName).sort((left, right) =>
    runtimeFileSortKey(left).localeCompare(runtimeFileSortKey(right)),
  );

  return candidates.at(-1) ?? null;
}

function baseResource(
  targetRoot: string,
  uri: string,
  name: string,
  resourceKind: ControlPlaneResourceDescriptor["resource_kind"],
  latestReportPath: string | null,
  sourceRefs: readonly string[],
  now: Date,
): Omit<KrnControlPlaneResource, "status" | "payload" | "error_summary"> {
  return {
    schema_version: "krn-control-plane-resource.v1",
    kind: "krn_control_plane_resource",
    uri,
    name,
    target_root: targetRoot,
    generated_at: now.toISOString(),
    resource_kind: resourceKind,
    mime_type: "application/json",
    read_only: true,
    latest_report_path: latestReportPath,
    source_refs: [...sourceRefs],
    interpretation_caveat:
      "This resource exposes read-only local KRN runtime state only; it does not approve proposals, mutate memory/source ledgers, prove productivity lift, or enable destructive MCP/API behavior.",
  };
}

function descriptorFromResource(
  resource: KrnControlPlaneResource,
  description: string,
): ControlPlaneResourceDescriptor {
  return {
    uri: resource.uri,
    name: resource.name,
    description,
    resource_kind: resource.resource_kind,
    mime_type: resource.mime_type,
    read_only: resource.read_only,
    status: resource.status,
    latest_report_path: resource.latest_report_path,
    source_refs: resource.source_refs,
  };
}

function loadArtifactResource(targetRoot: string, spec: ArtifactSpec, now: Date): KrnControlPlaneResource {
  const latestPath = latestRuntimeFile(targetRoot, spec.runtimeDir, spec.fileName);
  const latestReportPath = latestPath ? toTargetRelativePath(targetRoot, latestPath) : null;
  const base = baseResource(targetRoot, spec.uri, spec.name, spec.resourceKind, latestReportPath, spec.sourceRefs, now);

  if (!latestPath) {
    return parseKrnControlPlaneResource({
      ...base,
      status: "missing",
      payload: null,
      error_summary: `No ${spec.fileName} found under ${spec.runtimeDir}.`,
    });
  }

  try {
    return parseKrnControlPlaneResource({
      ...base,
      status: "available",
      payload: spec.parse(readJsonFile(latestPath)),
      error_summary: null,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "unknown parse error";
    return parseKrnControlPlaneResource({
      ...base,
      status: "invalid",
      payload: null,
      error_summary: `Latest ${spec.resourceKind} resource failed to parse: ${message}`,
    });
  }
}

function loadArtifactResources(targetRoot: string, now: Date): KrnControlPlaneResource[] {
  return ARTIFACT_SPECS.map((spec) => loadArtifactResource(targetRoot, spec, now));
}

function summaryItems(resources: readonly KrnControlPlaneResource[]): ControlPlaneResourcePayload & { kind: "runtime_summary" } {
  const items = resources.map((resource) => ({
    uri: resource.uri,
    resource_kind: resource.resource_kind as Exclude<ControlPlaneResourceDescriptor["resource_kind"], "runtime_summary">,
    status: resource.status,
    report_path: resource.latest_report_path,
    summary:
      resource.status === "available"
        ? `${resource.name} is available.`
        : resource.error_summary ?? `${resource.name} is not available.`,
    source_refs: resource.source_refs,
  }));

  return {
    kind: "runtime_summary",
    target_root: resources[0]?.target_root ?? resolve("."),
    generated_at: resources[0]?.generated_at ?? new Date().toISOString(),
    resources: items,
    available_resources: resources.filter((resource) => resource.status === "available").length,
    missing_resources: resources.filter((resource) => resource.status === "missing").length,
    invalid_resources: resources.filter((resource) => resource.status === "invalid").length,
    write_tools_enabled: false,
    proposal_tools_enabled: false,
    next_allowed_surfaces: ["read-only MCP resources", "proposal-only tool contracts", "dashboard view models"],
    blocked_surfaces: ["destructive MCP tools", "unreviewed memory writes", "mocked dashboard state"],
    interpretation_caveat:
      "The summary is a read-only view over local runtime reports; it is not human approval, productivity proof, or permission for destructive tools.",
  };
}

export function listKrnControlPlaneResources(targetInput = ".", now = new Date()): KrnControlPlaneResourceIndex {
  const targetRoot = resolve(targetInput);
  const artifactResources = loadArtifactResources(targetRoot, now);
  const summaryResource = readKrnControlPlaneResource("krn://runtime/summary", targetRoot, now);
  const resources = [
    descriptorFromResource(summaryResource, "Read-only summary of latest KRN runtime reports."),
    ...artifactResources.map((resource) => {
      const spec = ARTIFACT_SPECS.find((candidate) => candidate.uri === resource.uri);
      return descriptorFromResource(resource, spec?.description ?? resource.name);
    }),
  ];

  const candidateIndex: unknown = {
    schema_version: "krn-control-plane-resource-index.v1",
    kind: "krn_control_plane_resource_index",
    target_root: targetRoot,
    generated_at: now.toISOString(),
    resources,
    summary: {
      total_resources: resources.length,
      available_resources: resources.filter((resource) => resource.status === "available").length,
      missing_resources: resources.filter((resource) => resource.status === "missing").length,
      invalid_resources: resources.filter((resource) => resource.status === "invalid").length,
      write_tools_enabled: false,
      proposal_tools_enabled: false,
    },
    allowlisted_uris: resources.map((resource) => resource.uri),
    source_refs: [...RESOURCE_SOURCE_REFS],
    interpretation_caveat:
      "This index lists read-only KRN control-plane resources only; it does not expose write tools, approve proposals, or prove productivity lift.",
  };

  return parseKrnControlPlaneResourceIndex(candidateIndex);
}

export function readKrnControlPlaneResource(
  uri: string,
  targetInput = ".",
  now = new Date(),
): KrnControlPlaneResource {
  const targetRoot = resolve(targetInput);

  if (uri === "krn://runtime/summary") {
    const artifactResources = loadArtifactResources(targetRoot, now);
    const payload = summaryItems(artifactResources);
    return parseKrnControlPlaneResource({
      ...baseResource(
        targetRoot,
        uri,
        "KRN runtime summary",
        "runtime_summary",
        null,
        RESOURCE_SOURCE_REFS,
        now,
      ),
      status: payload.invalid_resources > 0 ? "invalid" : payload.missing_resources > 0 ? "missing" : "available",
      payload,
      error_summary: null,
    });
  }

  const spec = ARTIFACT_SPECS.find((candidate) => candidate.uri === uri);
  if (!spec) {
    throw new Error(`Unknown KRN control-plane resource URI: ${uri}`);
  }

  return loadArtifactResource(targetRoot, spec, now);
}
