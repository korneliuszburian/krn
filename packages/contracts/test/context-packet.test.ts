import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { krnContextPacketJsonSchema, parseKrnContextPacket } from "../src/index.js";

const root = process.cwd();

function readJson(path: string): unknown {
  return JSON.parse(readFileSync(join(root, path), "utf8")) as unknown;
}

describe("KRN context packet contract", () => {
  it("parses the valid context packet fixture", () => {
    const packet = parseKrnContextPacket(
      readJson("docs/specs/krn-context-packet/examples/context-packet.example.json"),
    );

    expect(packet.command).toBe("krn context build");
    expect(packet.context_budget.selected_context_count).toBe(packet.selected_context.length);
    expect(packet.selected_context.map((context) => context.ref)).toEqual(["memory:mem-goal-038-memory-boundary"]);
    expect(packet.memory_application.surface).toBe("krn_context");
    expect(packet.context_sections.map((section) => section.id)).toEqual([
      "task",
      "memory",
      "policy",
      "verification",
    ]);
  });

  it("rejects context packets that select broad memory dumps", () => {
    expect(() =>
      parseKrnContextPacket(
        readJson("docs/specs/krn-context-packet/fixtures/bad-context-packet-selected-dump.example.json"),
      ),
    ).toThrow();
  });

  it("rejects context packets that select broad goal ranges without hardcoded goal numbers", () => {
    const packet = parseKrnContextPacket(
      readJson("docs/specs/krn-context-packet/examples/context-packet.example.json"),
    );

    expect(() =>
      parseKrnContextPacket({
        ...packet,
        selected_context: [
          {
            ...packet.selected_context[0],
            ref: "docs/goals/goal-001.md..goal-999.md",
          },
        ],
      }),
    ).toThrow(/broad context dump/);
  });

  it("rejects selected memory without application guidance", () => {
    const packet = parseKrnContextPacket(
      readJson("docs/specs/krn-context-packet/examples/context-packet.example.json"),
    );

    expect(() =>
      parseKrnContextPacket({
        ...packet,
        memory_application: {
          ...packet.memory_application,
          applied_memory_ids: ["mem-other"],
        },
      }),
    ).toThrow(/application guidance/);
  });

  it("exports a JSON schema for downstream tools", () => {
    expect(krnContextPacketJsonSchema).toMatchObject({
      type: "object",
      properties: expect.objectContaining({
        context_budget: expect.any(Object),
        selected_context: expect.any(Object),
      }),
    });
  });
});
