import { existsSync, statSync } from "node:fs";
import { resolve } from "node:path";

export function createRunId(now: Date): string {
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  return `${stamp}-${process.pid}`;
}

export function pathKind(targetRoot: string, relativePath: string): "file" | "directory" | "missing" {
  const absolutePath = resolve(targetRoot, relativePath);
  if (!existsSync(absolutePath)) {
    return "missing";
  }
  return statSync(absolutePath).isDirectory() ? "directory" : "file";
}
