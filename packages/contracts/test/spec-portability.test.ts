import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const specsRoot = join(root, "docs/specs");
const localPathPatterns = [/\/home\/krn\//, /C:\\Users\\krnij/i, /\/mnt\/c\/Users\/krnij/i];

function collectFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);

    if (entry.isDirectory()) {
      return collectFiles(path);
    }

    if (entry.isFile()) {
      return [path];
    }

    return [];
  });
}

describe("docs/specs portability", () => {
  it("does not commit user-specific local workspace paths in spec examples or fixtures", () => {
    const offendingFiles = collectFiles(specsRoot).filter((path) => {
      if (statSync(path).size === 0) {
        return false;
      }

      const content = readFileSync(path, "utf8");
      return localPathPatterns.some((pattern) => pattern.test(content));
    });

    expect(offendingFiles.map((path) => relative(root, path))).toEqual([]);
  });
});
