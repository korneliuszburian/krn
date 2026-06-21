import {
  initCapabilityList,
  parseInitCapability,
  type InitProposalCapability,
} from "./init-targets.js";

export type InitArgs = {
  target: string;
} & (
  | {
      mode: "dry-run";
    }
  | {
      mode: "readiness";
    }
  | {
      mode: "proposal";
      capability: InitProposalCapability;
    }
  | {
      mode: "apply";
      capability: InitProposalCapability;
      proposalPath: string;
      decisionPath: string;
    }
);

function readOptionValue(argv: readonly string[], index: number, option: string): string {
  const value = argv[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`Missing value for ${option}`);
  }
  return value;
}

export function parseInitArgs(argv: readonly string[]): InitArgs {
  if (argv[0] !== "init") {
    throw new Error("Expected command: init");
  }

  let target = ".";
  let sawDryRun = false;
  let sawReadiness = false;
  let proposalCapability: InitProposalCapability | null = null;
  let applyCapability: InitProposalCapability | null = null;
  let proposalPath: string | null = null;
  let decisionPath: string | null = null;

  for (let index = 1; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--dry-run") {
      sawDryRun = true;
      continue;
    }

    if (arg === "--readiness") {
      sawReadiness = true;
      continue;
    }

    if (arg === "--proposal") {
      proposalCapability = parseInitCapability(readOptionValue(argv, index, arg), "proposal");
      index += 1;
      continue;
    }

    if (arg === "--apply") {
      applyCapability = parseInitCapability(readOptionValue(argv, index, arg), "apply");
      index += 1;
      continue;
    }

    if (arg === "--proposal-path") {
      proposalPath = readOptionValue(argv, index, arg);
      index += 1;
      continue;
    }

    if (arg === "--decision-path") {
      decisionPath = readOptionValue(argv, index, arg);
      index += 1;
      continue;
    }

    if (arg === "--target") {
      target = readOptionValue(argv, index, arg);
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument: ${arg ?? "<empty>"}`);
  }

  if (sawDryRun && sawReadiness) {
    throw new Error("krn init accepts either --dry-run or --readiness, not both");
  }

  if ((sawDryRun || sawReadiness) && proposalCapability) {
    throw new Error("krn init accepts only one of --dry-run, --readiness, or --proposal");
  }

  if ((sawDryRun || sawReadiness || proposalCapability) && applyCapability) {
    throw new Error("krn init accepts only one of --dry-run, --readiness, --proposal, or --apply");
  }

  if ((proposalPath || decisionPath) && !applyCapability) {
    throw new Error("--proposal-path and --decision-path are only valid with --apply");
  }

  if (applyCapability) {
    if (!proposalPath || !decisionPath) {
      throw new Error("krn init --apply requires --proposal-path and --decision-path");
    }
    return { target, mode: "apply", capability: applyCapability, proposalPath, decisionPath };
  }

  if (proposalCapability) {
    return { target, mode: "proposal", capability: proposalCapability };
  }

  if (sawReadiness) {
    return { target, mode: "readiness" };
  }

  if (!sawDryRun) {
    throw new Error(`krn init currently requires --dry-run, --readiness, or --proposal ${initCapabilityList()}`);
  }

  return { target, mode: "dry-run" };
}
