import { describe, expect, it } from "vitest";
import { krnContextPointerIndexJsonSchema, parseKrnContextPointerIndex } from "../src/index.js";

function validContextPointerIndex() {
  return {
    schema_version: "krn-context-pointer-index.v1",
    kind: "krn_context_pointer_index",
    pointer_id: "krn-init-context-pointer-seed",
    created_at: "1970-01-01T00:00:00.000Z",
    runtime_root: ".krn/context",
    packet_glob: ".krn/context/*/context-packet.json",
    latest_packet_ref: null,
    build_command: "krn context build --task <text> [--path <path>]",
    memory_policy: {
      store_memory_bodies: false,
      require_selected_memory_ids: true,
      require_application_guidance: true,
      max_selected_context: 5,
    },
    rejected_context_refs: ["docs/memory/** full scan", "historical benchmark/lab goals by default"],
    source_refs: ["krn://context/bootstrap-policy"],
    overclaim_boundary:
      "This seed points to bounded context packet runtime locations only; it is not an active context packet, memory body store, task intent, or proof of context quality.",
  };
}

describe("KRN context pointer index contract", () => {
  it("parses a valid context pointer index through the public parser", () => {
    const index = parseKrnContextPointerIndex(validContextPointerIndex());

    expect(index.kind).toBe("krn_context_pointer_index");
    expect(index.runtime_root).toBe(".krn/context");
    expect(index.packet_glob).toBe(".krn/context/*/context-packet.json");
    expect(index.memory_policy.store_memory_bodies).toBe(false);
    expect(index.memory_policy.require_selected_memory_ids).toBe(true);
    expect(index.memory_policy.require_application_guidance).toBe(true);
    expect(index.rejected_context_refs).toContain("docs/memory/** full scan");
    expect(index.overclaim_boundary).toContain("not an active context packet");
  });

  it("rejects broad docs/memory latest packet refs", () => {
    expect(() =>
      parseKrnContextPointerIndex({
        ...validContextPointerIndex(),
        latest_packet_ref: "docs/memory/INDEX.md",
      }),
    ).toThrow();
  });

  it("rejects memory-body storage policy", () => {
    expect(() =>
      parseKrnContextPointerIndex({
        ...validContextPointerIndex(),
        memory_policy: {
          store_memory_bodies: true,
          require_selected_memory_ids: true,
          require_application_guidance: true,
          max_selected_context: 5,
        },
      }),
    ).toThrow();
  });

  it("rejects selected memory without application guidance", () => {
    expect(() =>
      parseKrnContextPointerIndex({
        ...validContextPointerIndex(),
        memory_policy: {
          store_memory_bodies: false,
          require_selected_memory_ids: true,
          require_application_guidance: false,
          max_selected_context: 5,
        },
      }),
    ).toThrow();
  });

  it("rejects pointers that do not route through krn context build", () => {
    expect(() =>
      parseKrnContextPointerIndex({
        ...validContextPointerIndex(),
        build_command: "read docs/memory/INDEX.md",
      }),
    ).toThrow();
  });

  it("exports a JSON schema for downstream bootstrap tools", () => {
    expect(krnContextPointerIndexJsonSchema).toMatchObject({
      type: "object",
      properties: expect.objectContaining({
        schema_version: expect.any(Object),
        runtime_root: expect.any(Object),
        memory_policy: expect.any(Object),
      }),
    });
  });
});
