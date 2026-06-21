import { buildKrnOperatingBrief, parseBriefArgs, writeKrnOperatingBrief } from "./brief.js";
import { buildKrnContextPacket, parseContextBuildArgs, writeKrnContextPacket } from "./context.js";
import { buildDoctorReport, parseDoctorArgs, writeDoctorReport } from "./doctor.js";
import { buildKrnEvalReport, parseEvalArgs, writeKrnEvalReport } from "./eval.js";
import { buildKrnEngineeringGate, parseKrnGateArgs, writeKrnEngineeringGate } from "./gate.js";
import { initProposalCapabilityUsage, runKrnInit } from "./init.js";
import { parseMemoryFeedbackArgs, recordResolvedMemoryFeedback } from "./memory-feedback.js";
import { buildKrnResearchPack, parseResearchPackArgs, writeKrnResearchPack } from "./research-pack.js";
import { buildKrnReviewReport, parseReviewArgs, writeKrnReviewReport } from "./review.js";
import { buildKrnSourceCheck, parseSourceCheckArgs, writeKrnSourceCheck } from "./source-graph.js";

type CliResult = {
  exitCode: number;
  stdout: string;
  stderr: string;
};

function usage(): string {
  const initCapabilities = initProposalCapabilityUsage();
  return `Usage: krn <command>

Commands:
  init --dry-run [--target <path>]
  init --readiness [--target <path>]
  init --proposal ${initCapabilities} [--target <path>]
  init --apply ${initCapabilities} --proposal-path <path> --decision-path <path> [--target <path>]
  doctor [--target <path>]
  eval [--target <path>] [--lane core|current|lab|all] [--module <module-id>]
  review [--target <path>]
  brief --task <text> [--path <path>] [--target <path>]
  context build --task <text> [--path <path>] [--target <path>]
  memory feedback --artifact <path> --outcome used|ignored|harmful|missed|stale|blocked_bad_action --reason <text> [--memory-id <id>]
  sources check --context <path> --graph <path> [--target <path>]
  gate --task <text> [--path <path>] [--target <path>]
  research-pack --question <text> --decision <text> [--budget quick|standard|deep] [--target <path>]
`;
}

export function runKrnCli(argv: readonly string[] = process.argv.slice(2)): CliResult {
  const normalizedArgv = argv[0] === "--" ? argv.slice(1) : argv;

  if (normalizedArgv.length === 0 || normalizedArgv.includes("--help")) {
    return { exitCode: 0, stdout: usage(), stderr: "" };
  }

  try {
    if (normalizedArgv[0] === "init") {
      return runKrnInit(normalizedArgv);
    }

    if (normalizedArgv[0] === "doctor") {
      const args = parseDoctorArgs(normalizedArgv);
      const report = buildDoctorReport(args.target);
      const reportPath = writeDoctorReport(args.target, report);
      return { exitCode: 0, stdout: `${reportPath}\n`, stderr: "" };
    }

    if (normalizedArgv[0] === "eval") {
      const args = parseEvalArgs(normalizedArgv);
      const report = buildKrnEvalReport(args);
      const reportPath = writeKrnEvalReport(args.target, report);
      const exitCode = report.overall_status === "passed" ? 0 : 1;
      return { exitCode, stdout: `${reportPath}\n`, stderr: "" };
    }

    if (normalizedArgv[0] === "review") {
      const args = parseReviewArgs(normalizedArgv);
      const report = buildKrnReviewReport(args.target);
      const reportPath = writeKrnReviewReport(args.target, report);
      return { exitCode: 0, stdout: `${reportPath}\n`, stderr: "" };
    }

    if (normalizedArgv[0] === "brief") {
      const args = parseBriefArgs(normalizedArgv);
      const brief = buildKrnOperatingBrief(args);
      const briefPath = writeKrnOperatingBrief(args.target, brief);
      return { exitCode: 0, stdout: `${briefPath}\n`, stderr: "" };
    }

    if (normalizedArgv[0] === "context") {
      const args = parseContextBuildArgs(normalizedArgv);
      const packet = buildKrnContextPacket(args);
      const packetPath = writeKrnContextPacket(args.target, packet);
      return { exitCode: 0, stdout: `${packetPath}\n`, stderr: "" };
    }

    if (normalizedArgv[0] === "memory") {
      const args = parseMemoryFeedbackArgs(normalizedArgv);
      const feedback = recordResolvedMemoryFeedback(args);
      return { exitCode: 0, stdout: `${JSON.stringify(feedback, null, 2)}\n`, stderr: "" };
    }

    if (normalizedArgv[0] === "sources") {
      const args = parseSourceCheckArgs(normalizedArgv);
      const report = buildKrnSourceCheck(args);
      const reportPath = writeKrnSourceCheck(args.target, report);
      const exitCode = report.decision === "block" ? 1 : 0;
      return { exitCode, stdout: `${reportPath}\n`, stderr: "" };
    }

    if (normalizedArgv[0] === "gate") {
      const args = parseKrnGateArgs(normalizedArgv);
      const gate = buildKrnEngineeringGate(args);
      const gatePath = writeKrnEngineeringGate(args.target, gate);
      const exitCode = gate.gate_status === "blocked" ? 1 : 0;
      return { exitCode, stdout: `${gatePath}\n`, stderr: "" };
    }

    if (normalizedArgv[0] === "research-pack") {
      const args = parseResearchPackArgs(normalizedArgv);
      const pack = buildKrnResearchPack(args);
      const packPath = writeKrnResearchPack(args.target, pack);
      return { exitCode: 0, stdout: `${packPath}\n`, stderr: "" };
    }

    throw new Error(`Unknown command: ${normalizedArgv[0] ?? "<empty>"}`);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown CLI error";
    return { exitCode: 1, stdout: "", stderr: `${message}\n${usage()}` };
  }
}

export function main(argv: readonly string[] = process.argv.slice(2)): void {
  const result = runKrnCli(argv);
  process.stdout.write(result.stdout);
  process.stderr.write(result.stderr);
  process.exitCode = result.exitCode;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
