import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  krnMemoryApplicationJsonSchema,
  krnMemoryFeedbackJsonSchema,
  krnMemoryRecordJsonSchema,
  krnMemorySelectionJsonSchema,
  parseKrnMemoryApplication,
  parseKrnMemoryFeedback,
  parseKrnMemoryRecord,
  parseKrnMemorySelection,
} from "../src/index.js";

const root = process.cwd();

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(join(root, path), "utf8")) as unknown;
}

describe("KRN MemoryStore contracts", () => {
  it("parses valid memory records, selections, applications, and feedback through public parsers", () => {
    const record = parseKrnMemoryRecord(readJson("docs/specs/krn-memory-store/examples/krn-memory-record.example.json"));
    const selection = parseKrnMemorySelection(readJson("docs/specs/krn-memory-store/examples/krn-memory-selection.example.json"));
    const application = parseKrnMemoryApplication(readJson("docs/specs/krn-memory-store/examples/krn-memory-application.example.json"));
    const feedback = parseKrnMemoryFeedback(readJson("docs/specs/krn-memory-store/examples/krn-memory-feedback.example.json"));

    expect(record.id).toBe("mem-goal-038-memory-boundary");
    expect(record.kernel_terms).toContain("memory-operative");
    expect(selection.selected).toHaveLength(1);
    expect(selection.rejected_context.map((context) => context.ref)).toContain("docs/memory/** full scan");
    expect(application.applied_memory_ids).toEqual(["mem-goal-038-memory-boundary"]);
    expect(feedback.memory_outcomes[0]?.outcome).toBe("pending_review");
  });

  it("rejects known-bad context dump selection", () => {
    expect(() =>
      parseKrnMemorySelection(readJson("docs/specs/krn-memory-store/fixtures/bad-context-dump-selection.example.json")),
    ).toThrow();
  });

  it("rejects selected memory without application guidance", () => {
    expect(() =>
      parseKrnMemoryApplication(readJson("docs/specs/krn-memory-store/fixtures/bad-memory-application-no-guidance.example.json")),
    ).toThrow();
  });

  it("exports JSON schemas for downstream tools", () => {
    expect(krnMemoryRecordJsonSchema).toMatchObject({ type: "object" });
    expect(krnMemorySelectionJsonSchema).toMatchObject({ type: "object" });
    expect(krnMemoryApplicationJsonSchema).toMatchObject({ type: "object" });
    expect(krnMemoryFeedbackJsonSchema).toMatchObject({ type: "object" });
  });
});
