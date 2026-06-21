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

export function localMemoryStorePathFromRef(storeRef: string): string {
  const prefix = "local-dev-json:";
  if (!storeRef.startsWith(prefix)) {
    throw new Error(`Unsupported KRN MemoryStore ref: ${storeRef}`);
  }
  const storePath = storeRef.slice(prefix.length).trim();
  if (storePath.length === 0) {
    throw new Error("KRN MemoryStore ref is missing a local path.");
  }
  return resolve(storePath);
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
