import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { parseKrnLocalMemoryStore, type KrnLocalMemoryStore } from "@krn/contracts";

export function resolveLocalMemoryStorePath(): string {
  const explicitPath = process.env["KRN_MEMORY_STORE_PATH"];
  if (explicitPath && explicitPath.trim().length > 0) {
    return resolve(explicitPath);
  }
  return join(homedir(), ".krn", "memory-store.json");
}

export function localMemoryStoreRef(storePath: string): string {
  return `local-dev-json:${storePath}`;
}

function readJsonFile(path: string): unknown {
  return JSON.parse(readFileSync(path, "utf8")) as unknown;
}

export function loadLocalMemoryStore(storePath: string): KrnLocalMemoryStore {
  if (!existsSync(storePath)) {
    throw new Error(
      `KRN MemoryStore not found at ${storePath}. Set KRN_MEMORY_STORE_PATH to a local store file outside the target repo before running memory-aware review.`,
    );
  }
  return parseKrnLocalMemoryStore(readJsonFile(storePath));
}

export function writeLocalMemoryStore(storePath: string, storeFile: KrnLocalMemoryStore): void {
  mkdirSync(dirname(storePath), { recursive: true });
  writeFileSync(storePath, `${JSON.stringify(storeFile, null, 2)}\n`, "utf8");
}
