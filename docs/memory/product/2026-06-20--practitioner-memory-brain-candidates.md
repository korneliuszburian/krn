# Practitioner Memory Brain Candidates

Status: hypothesis

Sources:

- User-provided Facebook excerpts attributed to Adam Jesionkiewicz / Bobbin AI Memory Core, pasted in the 2026-06-20 operator thread. Primary post URL not yet verified.
- Public identity/search candidate only, not the source of the pasted Memory Core claims: https://pl.linkedin.com/in/jesionkiewicz
- Adrian Polubinski async AI workflow post: https://www.linkedin.com/posts/adrian-po%C5%82ubi%C5%84ski-281ab2172_im-experimenting-heavily-with-an-asynchronous-activity-7448965640121479168-_fvi
- Adrian Polubinski frontend EDA/TypeScript post: https://www.linkedin.com/posts/adrian-po%C5%82ubi%C5%84ski-281ab2172_eda-activity-7471142971233558529-zLyi
- Adrian Polubinski profile/site: https://polubinski.dev/

Useful pattern:

Treat strong practitioner claims from Facebook/LinkedIn/blog posts as source candidates that must be decomposed into mechanisms before adoption. The Memory Core direction should be futurist, temporal, and synthesis-first, but still pass the KRN source graph, eval, and overclaim gates.

Extracted mechanisms:

- `temporal memory`: each knowledge item carries time context, validity, freshness, and supersession.
- `ingest -> synthesis/distillation -> structure`: raw data is not memory; it becomes useful after condensation and schema-backed structure.
- `entity/relationship graph`: knowledge nodes and edges can expose semantic links, gaps, duplicates, and anomalies.
- `heartbeat`: recurring maintenance job that checks stale, contradictory, duplicate, or low-confidence knowledge.
- `dreaming`: offline compaction/synthesis job that creates more durable structures from noisy runtime evidence.
- `consensus`: multiple evaluators or policies compare arguments, source quality, owner, and confidence before promotion.
- `small fast helper model`: candidate optimization layer for scoring, clustering, routing, or maintenance, not a trusted judge by default.
- `event-structured TypeScript`: explicit events/states/transitions make AI edits smaller and easier to review than implicit UI/control-flow mutation.
- `async small-task queue`: capture small improvements, run focused discovery/implementation later, then human-review the patch.

KRN implication:

The final Memory Core should not be a repo folder, a vector search wrapper, or raw transcript storage. It should become a service/store-backed lifecycle with temporal metadata, source lineage, entity/relationship projection, selection/application feedback, maintenance jobs, and consensus/review gates.

For near-term slices, these mechanisms must remain behind typed boundaries:

- `MemoryStore` stores and selects IDs, metadata, source lineage, confidence, TTL, and application feedback.
- `.krn/**` stores runtime evidence and memory IDs only, not authoritative memory bodies.
- `docs/memory/**` stores reviewed pattern-bank/audit exports only.
- Graph/dreaming/heartbeat/consensus are future behaviors unless a slice gives them a current consumer, eval, and rollback path.

KRN also should use Adrian Polubinski's AI coding workflow signals carefully:

- Favor explicit TypeScript event contracts for complex stateful behavior because AI can operate on visible transitions and outcomes.
- Keep React/UI presentation thin where possible; put feature logic in plain TypeScript/event/state contracts when it reduces review scope.
- Use async task capture only for small, reviewable work; unrelated debt goes into a queue, not into opportunistic edits.
- Treat the "unmaintainable pile of markdown" warning as a hard skill lifecycle constraint: skill docs need owner, version, eval, trigger tests, and deletion criteria.

Failure mode:

- Promoting an unverified social post into product truth.
- Mistaking "living brain" language for implementable architecture.
- Building a graph/vector/neural subsystem before memory selection/application and review feedback prove useful.
- Treating a local helper model as a trusted judge without calibration.
- Letting skills grow by appending bullets after every miss instead of improving trigger tests, examples, and evals.

Review trigger:

- A direct primary source URL for the Adam Jesionkiewicz/Bobbin Memory Core posts is available.
- A Memory Core slice proposes graph, heartbeat, dreaming, consensus, or helper-model behavior.
- A TypeScript/React slice touches stateful UI logic that could be represented through explicit events/states.
- A skill update adds more procedural markdown without an eval or deletion criterion.
