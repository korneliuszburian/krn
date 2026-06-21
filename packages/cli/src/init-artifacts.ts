import type { InitManifest } from "@krn/contracts";
import { pathKind } from "./runtime-utils.js";

type InitDetectedArtifact = InitManifest["detected_artifacts"][number];

const INIT_DETECTED_PATHS = [
  "AGENTS.md",
  ".krn/config.toml",
  ".krn/sources/index.json",
  ".krn/context/index.json",
  ".krn/evals/baseline.json",
  ".agents/skills/README.md",
  ".krn/policies/boundaries.json",
  ".codex",
  ".agents",
  "docs/memory/INDEX.md",
  ".krn",
] as const;

function artifactReason(relativePath: string, exists: boolean): string {
  if (!exists) {
    return `${relativePath} is absent and can be planned safely.`;
  }

  switch (relativePath) {
    case "AGENTS.md":
      return "Root Codex instructions already exist and must not be overwritten by dry-run init.";
    case ".krn/config.toml":
      return "KRN local config already exists and must not be overwritten by dry-run init.";
    case ".krn/sources/index.json":
      return "KRN source graph seed already exists and must not be overwritten by dry-run init.";
    case ".krn/context/index.json":
      return "KRN context pointer index already exists and must not be overwritten by dry-run init.";
    case ".krn/evals/baseline.json":
      return "KRN eval baseline seed already exists and must not be overwritten by dry-run init.";
    case ".agents/skills/README.md":
      return "KRN skill wiring seed already exists and must not be overwritten by dry-run init.";
    case ".krn/policies/boundaries.json":
      return "KRN policy boundary seed already exists and must not be overwritten by dry-run init.";
    case ".codex":
      return "Project-local Codex config/hooks directory already exists.";
    case ".agents":
      return "Repo-local skill directory already exists.";
    case "docs/memory/INDEX.md":
      return "Reviewed memory index already exists.";
    case ".krn":
      return "KRN runtime artifact directory already exists.";
    default:
      return `${relativePath} exists in the target project.`;
  }
}

export function buildInitDetectedArtifacts(targetRoot: string): InitDetectedArtifact[] {
  return INIT_DETECTED_PATHS.map((relativePath) => {
    const kind = pathKind(targetRoot, relativePath);
    const exists = kind !== "missing";

    return {
      path: relativePath,
      kind,
      exists,
      reason: artifactReason(relativePath, exists),
    };
  });
}

export function initArtifactExists(
  detectedArtifacts: readonly InitDetectedArtifact[],
  relativePath: string,
): boolean {
  return detectedArtifacts.find((artifact) => artifact.path === relativePath)?.exists ?? false;
}
