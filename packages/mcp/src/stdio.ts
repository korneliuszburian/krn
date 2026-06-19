import { serveKrnMcpStdio } from "./server.js";

function targetRootFromArgs(args: readonly string[]): string {
  const targetIndex = args.indexOf("--target");
  if (targetIndex === -1) {
    return ".";
  }

  const target = args[targetIndex + 1];
  if (!target) {
    throw new Error("--target requires a path");
  }

  return target;
}

try {
  await serveKrnMcpStdio({ targetRoot: targetRootFromArgs(process.argv.slice(2)) });
} catch (error: unknown) {
  const message = error instanceof Error ? error.message : "unknown KRN MCP stdio server error";
  process.stderr.write(`krn mcp stdio failed: ${message}\n`);
  process.exitCode = 1;
}
