# Goal 006: KRN Final Product Build

## Status

Active parent execution contract. Slice 1 is complete enough to support product implementation, and Slice 2 typed CLI/runtime commands are implemented and locally verified. The parent goal remains incomplete until Slice 3 control-plane surfaces and measured lift evidence exist.

This goal supersedes `goal-005` as the product direction. `goal-005` remains useful as the Slice 2 `krn init --dry-run` contract, but it must not drive the whole repo.

## Current Progress

- `docs/product/final-product-plan.md` exists as the canonical final-product plan.
- KRN is the product/tool name and `krn` is the CLI; Gas Town is the repo/codename only.
- `goal-005` is superseded as the active product direction and retained as Slice 2 context.
- Slice 1 operator skills have static contract coverage:
  - `domain-grill-interviewer`
  - `product-requirements-writer`
  - `adr-writer`
  - `issue-slice-writer`
  - `release-verifier`
- Latest static operator skill contract validation passed for 11/11 skills.
- Operator skill impact validation now covers 10 fixtures, including the five new Slice 1 skills.
- `docs/evals/operator-skill-impact/fixtures/bad-premature-completion-claim.md` is a known-bad fixture for release verification.
- Impact eval validation runs, but live A/B impact and review-burden proof remain future work and must not be treated as productivity proof.
- Slice 2 now has four TypeScript runtime paths:
  - `krn init --dry-run` emits schema-backed manifests under `.krn/init/`.
  - `krn doctor` emits schema-backed readiness reports under `.krn/doctor/`.
  - `krn eval` emits schema-backed aggregate eval reports under `.krn/eval/`.
  - `krn review` emits schema-backed proposal-only review reports under `.krn/review/`.
- Latest Slice 2 local proof:
  - `pnpm typecheck` passed.
  - `pnpm test` passed with 8/8 files and 16/16 tests.
- Latest Slice 3 progress:
  - `packages/mcp` exists as a read-only resource model over typed `.krn` runtime reports.
  - `packages/mcp` now also has a local STDIO MCP server entrypoint over that read-only resource model.
  - `krn://runtime/summary`, `krn://runtime/init/latest`, `krn://runtime/doctor/latest`, `krn://runtime/eval/latest`, `krn://runtime/review/latest`, and `krn://runtime/benchmark/latest` are the current allowlisted resources.
  - `pnpm run eval:krn-mcp` passed 3/3 cases and 7/7 assertions.
  - The initial `krn-mcp-transport` eval proved the local STDIO resource transport before proposal tools were added; the current transport evidence is listed below.
  - `pnpm run krn -- review` generated `.krn/review/20260619T230302Z-1808550/report.json` with `ready_for_human_review`, 3/3 artifacts present, and 2 proposal-only proposals.
  - The STDIO transport now advertises exactly one proposal-only MCP tool: `krn_store_control_plane_proposal`.
  - `packages/contracts` now exports the standalone `KrnControlPlaneProposal` contract with valid and known-bad fixtures under `docs/specs/krn-control-plane-proposal/`.
  - `pnpm test -- packages/contracts/test/control-plane-proposal.test.ts` passed with the known-bad approved mutation fixture rejected.
  - `packages/contracts` now exports the standalone `KrnDashboardViewModel` contract with valid and known-bad fixtures under `docs/specs/krn-dashboard-view-model/`.
  - `packages/mcp` now exports `buildKrnDashboardViewModel`, which builds the first dashboard input from real read-only MCP/runtime resources and the latest `krn review` report.
  - `pnpm test -- packages/contracts/test/dashboard-view-model.test.ts packages/mcp/test/dashboard-view-model.test.ts packages/mcp/test/read-model.test.ts packages/mcp/test/stdio-server.test.ts` passed with 14/14 files and 33/33 tests.
  - `packages/mcp` now exports `validateProposalSourceRefs` and `storeKrnControlPlaneProposal` for source-backed append-only proposal persistence under `.krn/proposals`.
  - `pnpm run eval:krn-proposal-store` generated `.krn/evals/krn-proposal-store/20260619T231608Z-1828089/report.json` with 4/4 cases and 9/9 assertions passing.
  - `krn eval` now includes `krn-proposal-store` as a deterministic Slice 3 module.
  - `packages/contracts` now exports `KrnMcpProposalToolResult` and `KRN_STORE_CONTROL_PLANE_PROPOSAL_TOOL` for the first MCP proposal-only tool result boundary.
  - `packages/mcp` registers exactly one MCP tool, `krn_store_control_plane_proposal`, which parses `KrnControlPlaneProposal`, calls `storeKrnControlPlaneProposal`, and returns `approved: false` / `mutated_target: false`.
  - `pnpm run eval:krn-mcp-transport` generated `.krn/evals/krn-mcp-transport/20260620T000555Z-1943987/report.json` with 3/3 cases and 7/7 assertions after the transport began advertising the proposal-only tool.
  - `pnpm run eval:krn-mcp-proposal-tool` generated `.krn/evals/krn-mcp-proposal-tool/20260620T000445Z-1940364/report.json` with 5/5 cases and 16/16 assertions.
  - `pnpm run krn -- eval` generated `.krn/eval/20260620T000445Z-1940365/report.json` with 7/7 modules, 24/24 cases, and 62/62 assertions, including `krn-mcp-proposal-tool`.
  - `packages/contracts` now exports `KrnPendingReviewViewModel` for dashboard Pending Review over proposal-store records.
  - `packages/mcp` now exports `buildKrnPendingReviewViewModel`, which reads `.krn/proposals`, parses records as `KrnControlPlaneProposal`, revalidates source refs, and surfaces invalid/stale records.
  - `buildKrnDashboardViewModel` now uses proposal-store state for its Pending Review count instead of the latest `krn review` report.
  - `pnpm run eval:krn-pending-review-view-model` generated `.krn/evals/krn-pending-review-view-model/20260620T002555Z-1998197/report.json` with 4/4 cases and 14/14 assertions.
  - `pnpm run krn -- eval` generated `.krn/eval/20260620T002555Z-1998210/report.json` with 8/8 modules, 28/28 cases, and 76/76 assertions, including `krn-pending-review-view-model`.
  - `apps/dashboard` now exists as the first local dashboard surface over generated typed Pending Review data.
  - `apps/dashboard/scripts/write-dashboard-data.ts` writes `krn-dashboard-data.json` from `buildKrnPendingReviewViewModel`; generated dashboard data is ignored by git.
  - `apps/dashboard/src/PendingReviewDashboard.tsx` renders Pending Review rows with owner, source refs, next action, and failure mode, and does not expose approve/reject/mutate commands.
  - `pnpm --filter @krn/dashboard typecheck`, `pnpm --filter @krn/dashboard test`, and `pnpm --filter @krn/dashboard build` passed.
  - `pnpm run eval:krn-dashboard-pending-review-ui` generated `.krn/evals/krn-dashboard-pending-review-ui/20260620T005027Z-2048035/report.json` with 5/5 cases and 19/19 assertions.
  - `pnpm run krn -- eval` generated `.krn/eval/20260620T005117Z-2051988/report.json` with 9/9 modules, 33/33 cases, and 95/95 assertions, including `krn-dashboard-pending-review-ui`.
  - `packages/contracts` now exports `KrnProposalReviewDecision`, the first typed terminal review decision object for proposal-store records.
  - `packages/mcp` now exports `storeKrnProposalReviewDecision` and `listKrnProposalReviewDecisionStoreRecords` for append-only review state under `.krn/proposal-reviews`.
  - `buildKrnPendingReviewViewModel` now reads proposal review decision records, excludes proposals with one valid terminal decision, and blocks readiness for invalid or conflicting decision records.
  - `apps/dashboard/src/PendingReviewDashboard.tsx` now renders reviewed and review-error metrics from the same typed Pending Review view model without adding approve/reject/mutate commands.
  - `pnpm run eval:krn-proposal-review-decision` generated `.krn/evals/krn-proposal-review-decision/20260620T013214Z-2143548/report.json` with 8/8 cases and 25/25 assertions.
  - `pnpm typecheck` passed.
  - `pnpm test -- packages/mcp/test/pending-review-view-model.test.ts` passed with 20/20 test files and 63/63 tests after the manual conflict regression case was added.
  - `pnpm test` passed with 20/20 test files and 63/63 tests.
  - `pnpm run eval:krn-dashboard-pending-review-ui` generated `.krn/evals/krn-dashboard-pending-review-ui/20260620T013215Z-2143558/report.json` with 5/5 cases and 19/19 assertions after the Pending Review contract gained review-decision fields.
  - `pnpm run eval:krn-eval` generated `.krn/eval/20260620T013233Z-2144081/report.json` with 10/10 modules, 41/41 cases, and 120/120 assertions, including `krn-proposal-review-decision`.
  - This still does not prove promotion correctness, human approval quality, dashboard command readiness, complete dashboard coverage, HTTP/API readiness, ChatGPT connector behavior, target mutation safety beyond `.krn/proposals` and `.krn/proposal-reviews`, or measured lift.
  - `KrnControlPlaneProposal` can now carry an optional exact `memory_update` `promotion_payload` with target content and hash.
  - `packages/contracts` now exports `KrnProposalPromotion`, the first typed promotion record after an approved review decision.
  - `packages/mcp` now exports `storeKrnProposalPromotion` and `listKrnProposalPromotionStoreRecords` for append-only promotion state under `.krn/promotions`.
  - `storeKrnProposalPromotion` validates existing proposal records, `approved_for_promotion` review decisions, exact payload content/hash, source refs, idempotency, and target path safety.
  - Explicit `apply_exact_target_write` mode writes exact target content for absent `memory_update` target paths only; record-only mode remains the default.
  - `pnpm test -- packages/contracts/test/control-plane-proposal.test.ts packages/contracts/test/proposal-promotion.test.ts packages/mcp/test/proposal-store.test.ts packages/mcp/test/proposal-promotion-store.test.ts` passed with 22/22 test files and 73/73 tests.
  - `pnpm typecheck` passed.
  - `pnpm run eval:krn-proposal-promotion` generated `.krn/evals/krn-proposal-promotion/20260620T015701Z-2203468/report.json` with 7/7 cases and 22/22 assertions.
  - `pnpm run eval:krn-eval` generated `.krn/eval/20260620T015701Z-2203458/report.json` with 11/11 modules, 48/48 cases, and 142/142 assertions, including `krn-proposal-promotion`.
  - This still does not prove general promotion correctness, human approval quality, dashboard command readiness, complete dashboard coverage, HTTP/API readiness, ChatGPT connector behavior, safe overwrite/update semantics for existing target files, or measured lift.
  - `packages/contracts` now exports `KrnPromotionReviewViewModel`, the first dashboard review model over `.krn/promotions`.
  - `packages/contracts` now exports `KrnDashboardData`, the first multi-view dashboard data envelope for Pending Review and Promotion Review.
  - `packages/mcp` now exports `buildKrnPromotionReviewViewModel`, which reads promotion-store records, validates referenced proposal/review decision records, validates source refs, and compares target files against exact promotion payload content.
  - `apps/dashboard/src/PromotionReviewDashboard.tsx` now renders promotion audit rows, invalid promotion records, and target drift states without apply/promote/write commands.
  - `pnpm run eval:krn-dashboard-promotion-review-ui` generated `.krn/evals/krn-dashboard-promotion-review-ui/20260620T043648Z-2297921/report.json` with 5/5 cases and 19/19 assertions.
  - `pnpm run eval:krn-eval` generated `.krn/eval/20260620T043611Z-2296702/report.json` with 12/12 modules, 53/53 cases, and 161/161 assertions, including `krn-dashboard-promotion-review-ui`.
  - This still does not prove dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, human review quality, broad promotion correctness, safe overwrite semantics, or measured lift.
  - `packages/contracts` now exports `KrnEvalRunsViewModel`, the first typed dashboard review model over latest aggregate `.krn/eval/**/report.json` state.
  - `KrnDashboardData` now includes Pending Review, Promotion Review, and Eval Runs view models.
  - `packages/mcp` now exports `buildKrnEvalRunsViewModel`, which reads the latest aggregate eval report, parses it through `KrnEvalReport`, and surfaces ready, missing, invalid, and failed-module states without mutation.
  - `apps/dashboard/src/EvalRunsDashboard.tsx` renders eval module evidence, source refs, next actions, failure modes, caveats, and invalid-report state without rerun, repair, write, or lift command claims.
  - `pnpm run eval:krn-dashboard-eval-runs-ui` generated `.krn/evals/krn-dashboard-eval-runs-ui/20260620T051305Z-2375941/report.json` with 5/5 cases and 20/20 assertions.
  - `pnpm run eval:krn-eval` generated `.krn/eval/20260620T051314Z-2376293/report.json` with 13/13 modules, 58/58 cases, and 181/181 assertions, including `krn-dashboard-eval-runs-ui`.
  - This still does not prove benchmark lift, productivity improvement, repair-loop quality, HTTP/API readiness, ChatGPT connector behavior, human review quality, or dashboard command readiness.
  - `packages/contracts` now exports `KrnBenchmarkReport`, the first typed benchmark report spine for baseline Codex versus KRN-assisted Codex task evidence.
  - `KrnBenchmarkReport` rejects fixture-contract productivity lift claims and requires no-lift/non-positive-lift states to carry repair targets.
  - `docs/specs/krn-benchmark-report/` contains a valid no-lift fixture and a known-bad fixture that claims productivity lift from fixture data.
  - `packages/evals/src/validate-krn-benchmark-spine.ts` writes generated benchmark reports under `.krn/benchmarks/krn-benchmark-spine/{run_id}/report.json` and eval reports under `.krn/evals/krn-benchmark-spine/{run_id}/report.json`.
  - `pnpm run eval:krn-benchmark-spine` generated `.krn/evals/krn-benchmark-spine/20260620T052834Z-2409080/report.json` with 4/4 cases and 14/14 assertions.
  - `pnpm run eval:krn-eval` generated `.krn/eval/20260620T052950Z-2410440/report.json` with 14/14 modules, 62/62 cases, and 195/195 assertions, including `krn-benchmark-spine`.
  - This proves the benchmark report contract and no-lift gate only. It still does not prove measured productivity lift, live Codex benchmark quality, repair-loop quality, HTTP/API readiness, ChatGPT connector behavior, human review quality, or dashboard command readiness.
  - `docs/evals/krn-benchmark-live-pilot/` and `packages/evals/src/validate-krn-benchmark-live-pilot.ts` implement the first explicit live `codex exec` benchmark pilot with separate validate and live modes.
  - The live pilot runs one baseline prompt and one KRN-assisted prompt in read-only `codex exec`, constrains final output with `docs/evals/krn-benchmark-live-pilot/codex-output.schema.json`, scores both deterministically, and writes a `KrnBenchmarkReport` with `measurement_mode: "live_codex_exec"`.
  - `pnpm run eval:krn-benchmark-live-pilot` generated `.krn/evals/krn-benchmark-live-pilot/20260620T060328Z-2492624/report.json` with 2/2 cases and 6/6 assertions.
  - `pnpm run eval:krn-benchmark-live-pilot:live` generated `.krn/evals/krn-benchmark-live-pilot/20260620T060340Z-2493285/report.json` with 4/4 cases and 15/15 assertions.
  - The generated benchmark report `.krn/benchmarks/krn-benchmark-live-pilot/20260620T060340Z-2493285/report.json` parsed through `KrnBenchmarkReport`, used `measurement_mode: "live_codex_exec"`, kept `productivity_lift_claimed: false`, and reported baseline score 0.95, assisted score 0.85, delta -0.1.
  - This proves the live worker-to-typed-benchmark evidence path only. It still does not prove measured productivity lift, statistical benchmark validity, repair-loop quality, HTTP/API readiness, ChatGPT connector behavior, human review quality, or dashboard command readiness.
  - `packages/contracts` now exports `KrnBenchmarkReportsViewModel`, the first typed dashboard/control-plane review model over `.krn/benchmarks/**/report.json`.
  - `packages/mcp` now exports `buildKrnBenchmarkReportsViewModel`, which reads benchmark report files, parses them through `KrnBenchmarkReport`, and surfaces ready, empty, blocked, invalid, no-lift, and negative-delta state.
  - The MCP read model now exposes `krn://runtime/benchmark/latest` as a read-only resource for the latest parsed benchmark report.
  - `KrnDashboardData` now includes `benchmark_reports`, and `apps/dashboard/src/BenchmarkReportsDashboard.tsx` renders benchmark rows, source refs, score deltas, repair targets, next actions, and failure modes without run/repair/write commands.
  - `pnpm run eval:krn-dashboard-benchmark-reports-ui` generated `.krn/evals/krn-dashboard-benchmark-reports-ui/20260620T063805Z-2567754/report.json` with 5/5 cases and 28/28 assertions.
  - `pnpm run eval:krn-eval` generated `.krn/eval/20260620T063841Z-2568949/report.json` with 15/15 modules, 67/67 cases, and 224/224 assertions, including `krn-dashboard-benchmark-reports-ui`.
  - `pnpm test` passed with 30/30 test files and 100/100 tests, and `pnpm typecheck` passed.
  - This proves read-only review of parsed benchmark reports through MCP/dashboard surfaces only. It still does not prove measured productivity lift, benchmark statistical validity, repair-loop quality, HTTP/API readiness, ChatGPT connector behavior, human review quality, or dashboard command readiness.
  - `docs/evals/krn-benchmark-live-suite/` and `packages/evals/src/validate-krn-benchmark-live-suite.ts` now implement a fixed three-task benchmark suite with deterministic validate mode and explicit live `codex exec` mode.
  - `pnpm run eval:krn-benchmark-live-suite` generated `.krn/evals/krn-benchmark-live-suite/20260620T072146Z-2674923/report.json` with 4/4 cases and 16/16 assertions.
  - `pnpm run eval:krn-benchmark-live-suite:live` generated `.krn/evals/krn-benchmark-live-suite/20260620T072154Z-2675156/report.json` with 5/5 cases and 22/22 assertions, including evidence-file existence checks.
  - The generated benchmark report `.krn/benchmarks/krn-benchmark-live-suite/20260620T072154Z-2675156/report.json` parsed through `KrnBenchmarkReport`, used `measurement_mode: "live_codex_exec"`, kept `productivity_lift_claimed: false`, and reported 3/3 completed tasks, baseline score `0.9433`, assisted score `0.94`, and delta `-0.0033`.
  - `krn eval` now includes `krn-benchmark-live-suite` validate mode as deterministic aggregate coverage, while live mode remains explicit and outside default `krn eval`.
  - This proves the multi-task benchmark harness and no-lift guard only. It still does not prove measured productivity lift, benchmark statistical validity, repair-loop quality, HTTP/API readiness, ChatGPT connector behavior, human review quality, dashboard command readiness, or `krn benchmark` CLI readiness.
  - `packages/contracts` now exports `KrnRepairRecord`, the first typed repair handoff object for benchmark no-lift evidence.
  - `docs/specs/krn-repair-record/` contains a valid proposed no-lift repair fixture, a known-bad validated-overclaim fixture, and a benchmark no-lift fixture.
  - `packages/evals/src/validate-krn-repair-record.ts` generates parseable proposed repair records under `.krn/repairs/krn-repair-record/{run_id}/repair-record.json` from benchmark no-lift evidence.
  - `pnpm run eval:krn-repair-record` generated `.krn/evals/krn-repair-record/20260620T075903Z-2754248/report.json` with 3/3 cases and 9/9 assertions.
  - `pnpm run eval:krn-eval` generated `.krn/eval/20260620T080015Z-2757479/report.json` with 17/17 modules, 74/74 cases, and 249/249 assertions, including `krn-repair-record`.
  - This proves typed no-lift repair handoff only. It still does not prove repair quality, measured productivity lift, prompt improvement, benchmark statistical validity, HTTP/API readiness, ChatGPT connector behavior, human review quality, dashboard command readiness, or `krn repair` CLI readiness.
  - `docs/goals/goal-022.md` applied the first bounded repair attempt from the no-lift `KrnRepairRecord` by making live-suite current-parent/latest-child scoring data-driven, routing assisted fixtures through `goal-021`, and adding fallback final-output JSON for live timeout/spawn-error paths.
  - `pnpm run eval:krn-benchmark-live-suite` generated `.krn/evals/krn-benchmark-live-suite/20260620T083211Z-2826332/report.json` with 4/4 cases and 16/16 assertions after the repair.
  - The first explicit live repair rerun generated `.krn/evals/krn-benchmark-live-suite/20260620T081426Z-2776468/report.json` with 4/5 cases and 13/22 assertions, exposing a missing-final-artifact defect when `goal006-next-benchmark-action.assisted` timed out; its benchmark report showed baseline `0.9367`, assisted `0.6533`, and delta `-0.2834`.
  - The final explicit live repair rerun generated `.krn/evals/krn-benchmark-live-suite/20260620T083233Z-2828288/report.json` with 5/5 cases and 22/22 assertions, plus `.krn/benchmarks/krn-benchmark-live-suite/20260620T083233Z-2828288/report.json` with baseline `0.9644`, assisted `0.62`, and delta `-0.3444`.
  - `pnpm run eval:krn-eval` generated `.krn/eval/20260620T085427Z-2888524/report.json` with 17/17 modules, 74/74 cases, and 249/249 assertions after the repair-attempt changes.
  - This proves repair-attempt measurement and timeout observability only. It still does not prove repair success, productivity lift, benchmark statistical validity, dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, human review quality, or `krn benchmark`/`krn repair` CLI readiness.
  - `docs/goals/goal-023.md` applied a bounded assisted prompt-load repair by making the live-suite assisted prompt use task-owned `source_refs` and `assisted_guidance` instead of a universal read list.
  - `pnpm run eval:krn-benchmark-live-suite` generated `.krn/evals/krn-benchmark-live-suite/20260620T090328Z-2900409/report.json` with 4/4 cases and 16/16 assertions after the prompt-load repair.
  - `pnpm run eval:krn-benchmark-live-suite:live` generated `.krn/evals/krn-benchmark-live-suite/20260620T090346Z-2900772/report.json` with 5/5 cases and 22/22 assertions, plus `.krn/benchmarks/krn-benchmark-live-suite/20260620T090346Z-2900772/report.json` with 3/3 completed tasks, baseline `0.9456`, assisted `0.94`, and delta `-0.0056`.
  - `pnpm run eval:krn-eval` generated `.krn/eval/20260620T092221Z-2969002/report.json` with 17/17 modules, 74/74 cases, and 249/249 assertions after the prompt-load repair.
  - This repairs the specific first-task assisted timeout and stabilizes the benchmark evidence compared with `-0.3444`, but still does not prove productivity lift, statistical validity, dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, human review quality, or `krn benchmark`/`krn repair` CLI readiness.
  - `docs/goals/goal-024.md` applied a bounded memory-layer next-action repair by updating `memory-layers-vs-file-substrate` to use `goal-023`, the prompt-load repair memory note, and source-backed memory/control/eval benchmark repair guidance instead of stale prompt-load guidance.
  - `pnpm run eval:krn-benchmark-live-suite` generated `.krn/evals/krn-benchmark-live-suite/20260620T093329Z-2982842/report.json` with 4/4 cases and 16/16 assertions after the memory-layer repair.
  - `pnpm typecheck` passed after the memory-layer repair.
  - The first explicit live memory-layer repair rerun generated `.krn/evals/krn-benchmark-live-suite/20260620T093350Z-2983111/report.json` with 5/5 cases and 22/22 assertions, plus `.krn/benchmarks/krn-benchmark-live-suite/20260620T093350Z-2983111/report.json` with 2/3 completed tasks, 1 failed baseline timeout, baseline `0.5589`, assisted `0.9733`, and delta `+0.4144`.
  - In that first live rerun, `memory-layers-vs-file-substrate` completed with baseline `1`, assisted `1`, and assisted `next_action_score` `1`, improving the target metric from the previous assisted `0.5`.
  - The repeat live memory-layer repair rerun generated `.krn/evals/krn-benchmark-live-suite/20260620T094837Z-3002586/report.json` with 5/5 cases and 22/22 assertions, plus `.krn/benchmarks/krn-benchmark-live-suite/20260620T094837Z-3002586/report.json` with 1/3 completed tasks, 2 failed baseline timeouts, baseline `0.2756`, assisted `0.9733`, and delta `+0.6977`.
  - In that repeat live rerun, `memory-layers-vs-file-substrate` completed with baseline `0.8267`, assisted `1`, and assisted `next_action_score` `1`.
  - This keeps the memory-layer repair because the target assisted metric improved and repeated, but the positive suite deltas are not clean productivity evidence because non-target baseline tasks timed out. The next benchmark repair should target live runner timeout/concurrency/stability before suite expansion or lift claims.
  - `docs/goals/goal-025.md` hardened `KrnBenchmarkReport` so `lift_status: "positive_lift"` is rejected unless the report is `live_codex_exec`, has enough tasks, has zero blocked/failed tasks, and has positive delta.
  - `docs/specs/krn-benchmark-report/fixtures/bad-positive-lift-status-with-failed-task.example.json` is the known-bad regression for dirty positive-lift status when `productivity_lift_claimed` is false.
  - `pnpm run eval:krn-benchmark-spine` generated `.krn/evals/krn-benchmark-spine/20260620T102007Z-3090855/report.json` with 5/5 cases and 15/15 assertions after the status gate.
  - `pnpm run eval:krn-benchmark-live-suite` generated `.krn/evals/krn-benchmark-live-suite/20260620T102111Z-3093271/report.json` with 4/4 cases and 16/16 assertions after the status gate.
  - `pnpm run eval:krn-benchmark-live-suite:live` generated `.krn/evals/krn-benchmark-live-suite/20260620T102133Z-3093693/report.json` with 5/5 cases and 22/22 assertions, plus `.krn/benchmarks/krn-benchmark-live-suite/20260620T102133Z-3093693/report.json` with `measurement_mode: "live_codex_exec"`, 1/3 completed tasks, 2 failed tasks, baseline `0.2144`, assisted `0.9367`, delta `+0.7223`, `lift_status: "no_lift_evidence"`, and `productivity_lift_claimed: false`.
  - This proves benchmark lift-status overclaim protection only. It still does not prove productivity lift, clean live runner stability, statistical validity, dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, human review quality, or `krn benchmark`/`krn repair` CLI readiness. The next benchmark repair should harden live runner timeout/concurrency/stability and stale task guidance before suite expansion or lift claims.
  - `docs/goals/goal-026.md` hardened the live-suite task registry and runner policy by adding typed `live_run_policy`, per-task `current_child_goal_ref`, and `superseded_latest_child_goal_refs`.
  - `pnpm run eval:krn-benchmark-live-suite` generated `.krn/evals/krn-benchmark-live-suite/20260620T111349Z-3200927/report.json` with 5/5 cases and 22/22 assertions after the registry/policy gate.
  - This proves deterministic stale-context and hidden-runner-policy protection only. It still does not prove productivity lift, clean repeated live-run stability, statistical validity, suite expansion readiness, dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, human review quality, or `krn benchmark`/`krn repair` CLI readiness.
  - `docs/goals/goal-027.md` added `krn-benchmark-live-stability`, a default deterministic eval module over existing live-suite benchmark reports.
  - `pnpm run eval:krn-benchmark-live-stability` generated `.krn/evals/krn-benchmark-live-stability/20260620T113858Z-3249851/report.json` with 6/6 cases and 20/20 assertions.
  - `pnpm run krn -- eval --module krn-benchmark-live-stability` generated `.krn/eval/20260620T113907Z-3250087/report.json`.
  - `pnpm run eval:krn-eval` generated `.krn/eval/20260620T113916Z-3250294/report.json` with 18/18 modules, 82/82 cases, and 276/276 assertions, including `krn-benchmark-live-stability`.
  - `pnpm typecheck` and `pnpm test` passed after adding the stability module to runtime and aggregate eval test expectations.
  - `python3 scripts/evals/codex_memory_compliance.py --mode validate` generated `.krn/evals/codex-memory-compliance/20260620T114024550186Z-3253880/report.json` with 4/4 cases.
  - The stability gate classified current local live evidence as 8 live reports, 2 clean, 6 dirty, latest live report `.krn/benchmarks/krn-benchmark-live-suite/20260620T102133Z-3093693/report.json`, `suite_expansion_ready: false`, and `productivity_lift_ready: false`.
  - This proves deterministic live-report readiness classification only. It still does not prove measured productivity lift, clean repeated live execution in the current runtime, statistical validity, suite expansion completion, dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, or human review quality.
  - `docs/goals/goal-028.md` repaired live-runner stability by adding typed output-capture and bounded baseline-scope policy to the live-suite registry and runner.
  - `pnpm run eval:krn-benchmark-live-suite` generated `.krn/evals/krn-benchmark-live-suite/20260620T115002Z-3281262/report.json` with 5/5 cases and 24/24 assertions after the typed runner-policy repair.
  - `pnpm run eval:krn-benchmark-live-suite:live` generated `.krn/evals/krn-benchmark-live-suite/20260620T115037Z-3282001/report.json` with 6/6 cases and 30/30 assertions, plus `.krn/benchmarks/krn-benchmark-live-suite/20260620T115037Z-3282001/report.json` with 3/3 completed tasks, 0 failed tasks, baseline `0.8457`, assisted `0.91`, delta `+0.0643`, `lift_status: "no_lift_evidence"`, and `productivity_lift_claimed: false`.
  - `pnpm run eval:krn-benchmark-live-stability` generated `.krn/evals/krn-benchmark-live-stability/20260620T120047Z-3298454/report.json` with 6/6 cases and 20/20 assertions; it classified current local evidence as 9 live reports, 3 clean, 6 dirty, latest live report clean, `suite_expansion_ready: false`, and `productivity_lift_ready: false`.
  - `pnpm run eval:krn-eval` generated `.krn/eval/20260620T121036Z-3328080/report.json` with 18/18 modules, 82/82 cases, and 278/278 assertions, including the updated live-suite and live-stability modules.
  - `pnpm typecheck` passed after the live-runner repair.
  - `pnpm test` passed with 31/31 test files and 106/106 tests.
  - `python3 scripts/evals/codex_memory_compliance.py --mode validate` generated `.krn/evals/codex-memory-compliance/20260620T121148932746Z-3330438/report.json` with 4/4 cases.
  - This proves one clean latest explicit three-task live run after typed output-capture/baseline-scope repair only. It still does not prove repeated clean live execution, measured productivity lift, statistical validity, suite expansion completion, dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, or human review quality.
  - `docs/goals/goal-029.md` repeated the explicit live-suite run under the typed policy and moved the task registry current child context to `goal-029`.
  - `pnpm run eval:krn-benchmark-live-suite` generated `.krn/evals/krn-benchmark-live-suite/20260620T121920Z-3339493/report.json` with 5/5 cases and 24/24 assertions.
  - `pnpm run eval:krn-benchmark-live-suite:live` generated `.krn/evals/krn-benchmark-live-suite/20260620T121951Z-3340034/report.json` with 6/6 cases and 30/30 assertions, plus `.krn/benchmarks/krn-benchmark-live-suite/20260620T121951Z-3340034/report.json` with 3/3 completed tasks, 0 failed tasks, baseline `0.8717`, assisted `0.8967`, delta `+0.025`, `lift_status: "no_lift_evidence"`, and `productivity_lift_claimed: false`.
  - `pnpm run eval:krn-benchmark-live-stability` generated `.krn/evals/krn-benchmark-live-stability/20260620T123540Z-3385093/report.json` with 6/6 cases and 20/20 assertions; it classified current local evidence as 10 live reports, 4 clean, 6 dirty, latest live report clean, `suite_expansion_ready: true`, and `productivity_lift_ready: false`.
  - `pnpm run eval:krn-eval` generated `.krn/eval/20260620T123940Z-3393698/report.json` with 18/18 modules, 82/82 cases, and 278/278 assertions after the repeat-clean slice.
  - `pnpm typecheck`, `pnpm test`, `python3 scripts/evals/codex_memory_compliance.py --mode validate`, and `git diff --check` passed after the repeat-clean slice.
  - This proves repeated clean explicit three-task live evidence for suite-expansion review only. It still does not prove measured productivity lift, statistical validity, suite expansion completion, dashboard command readiness, HTTP/API readiness, ChatGPT connector behavior, or human review quality.

## Objective

Build KRN as the final TypeScript-first Codex operating memory, eval, and control-plane product.

Naming rule: KRN is the product/tool name and `krn` is the CLI. Gas Town is the repo/codename only, used knowingly as a reference to the Steve Yegge AI-agent orchestration discourse.

Do not build a PoC, MVP, demo, or isolated bootstrapper. Build the final architecture in dependency order through three slices:

1. Operator Build System.
2. Typed Runtime Spine.
3. Control Plane And Measured Lift.

## Product Outcome

KRN is complete only when Codex work can flow through this loop:

```text
repo/task intake
  -> operator skill workflow
  -> typed product objects
  -> CLI/runtime reports
  -> eval/repair loop
  -> reviewed memory/source/decision updates
  -> MCP/API/dashboard review surface
  -> baseline-vs-assisted benchmark evidence
```

## Required Read Order

Before executing this goal, read:

1. `AGENTS.md`
2. `docs/memory/INDEX.md`
3. `docs/product/final-product-plan.md`
4. `docs/specs/technology-stack/decision.md`
5. `docs/skills/operator-pipeline.md`
6. `docs/evals/STANDARD.md`
7. `docs/plans/canonical/pattern-matrix.md`
8. `docs/plans/canonical/SOURCES.md`
9. `CONTEXT.md`

Read OpenAI/Codex official docs before changing any Codex-specific surface such as skills, hooks, MCP, subagents, `AGENTS.md`, or `codex exec` workflow.

## Constraints

- Project-local only unless the user explicitly asks for global config.
- TypeScript-first product code on Node.js runtime.
- No new Python product foundation.
- No PoC/MVP/v1/v2 language in execution artifacts.
- No dashboard/API/MCP/runtime-skill work before typed product objects exist.
- No productivity claims without benchmark evidence.
- No semantic reviewer hooks.
- No destructive writes by default.
- No hidden product truth in chat, global memory, or unindexed docs.

## Boundaries

In scope:

- repo-local operator skills,
- TypeScript workspace and product contracts,
- CLI/runtime reports,
- eval/repair loop,
- compact continuity as deterministic project-local mechanism,
- MCP/API read model and proposal tools,
- dashboard over real product objects,
- benchmark harness.

Out of scope unless a later ADR changes it:

- generic multi-agent swarm,
- global Codex setup,
- SaaS auth/billing,
- public plugin distribution before local skill/product contracts are stable,
- vector DB or temporal graph store before file-backed product objects prove the workflow.

## Iteration Policy

Work slice by slice. Within each slice, implement vertical behavior through final standards:

```text
contract -> parser/schema -> fixture -> behavior test/eval -> runtime artifact -> memory/plan update
```

Before any non-trivial implementation slice, run a lightweight research/plan checkpoint using the OpenAI Cookbook patterns already indexed in `docs/plans/canonical/SOURCES.md`. This is a hard gate for child goals: a child goal may not move from planning into implementation, and may not be closed, unless it records the selected source-backed mechanisms, resulting artifacts, eval/falsification path, and overclaim boundary.

- S010 Goals in Codex: state outcome, verification surface, constraints, boundaries, iteration policy, and blocked stop condition.
- S011 Codex ExecPlans: keep multi-hour work self-contained, restartable, and evidence-driven.
- S012 Code modernization: split broad changes into bounded pilot, overview/design, validation/parity, implementation, and reusable template when the slice is broad enough.
- S087 Related resources: use as discovery only; promote a pattern only after primary-source inspection and mechanism extraction.

The checkpoint must name the product layer, selected source-backed mechanism, rejected alternatives, required skills, validation or falsification path, and overclaim boundary. Cookbook links are not sufficient by themselves; they must be converted into KRN behavior, contracts, tests/evals, memory/source updates, or rejected alternatives. Tiny mechanical edits can skip the checkpoint, but architecture, memory, eval, MCP/API, dashboard, runtime-skill, benchmark, and long-running-goal work cannot.

Do not make broad horizontal dumps such as "all docs first", "all schemas first", or "dashboard shell first" unless the slice explicitly needs that artifact to unblock the next verified behavior.

When an eval or review fails:

```text
failure -> repair record -> smallest fix -> rerun -> keep/refine/remove decision
```

Do not tune prompts, skills, or `AGENTS.md` from a single failure without adding a regression case or repair record.

## Blocked Stop Condition

Mark this goal blocked only if one of these repeats after three concrete attempts:

- official Codex docs contradict a required Codex surface and no safe project-local alternative exists,
- TypeScript workspace setup cannot be made runnable in this repo,
- required product object contracts cannot represent the dashboard/API/runtime flow without changing product identity,
- benchmark/eval execution cannot be run or simulated locally enough to produce actionable evidence.

If blocked, write the failed attempts, exact blocker, and two viable alternatives into this goal before stopping.

## Slice 1: Operator Build System

### Mission

Create the operator layer that will build the product without prompt sprawl or docs rot.

### Required Work

- Mark `goal-005` as superseded active direction and preserve it as Slice 2 context.
- Keep `docs/product/final-product-plan.md` as the canonical product plan.
- Complete the missing operator skills needed for product implementation:
  - domain/grill interviewer,
  - PRD/product requirement writer,
  - ADR writer,
  - issue/slice writer,
  - reviewer/release verifier.
- Update operator skill evals so every operator skill has static contract coverage.
- Add or update at least one impact fixture that compares baseline Codex vs skill-assisted Codex on final-product planning or TypeScript-contract work.
- Keep `AGENTS.md` small and point to the active goal and final product plan.

### Acceptance Evidence

- `python3 scripts/evals/operator_skill_contracts.py --mode validate` passes.
- `python3 scripts/evals/operator_skill_impact.py --mode validate` passes.
- New skill docs use trigger/input/output/phase-boundary/when-not-to-use/eval-case structure.
- `docs/skills/operator-pipeline.md` lists active skills and the remaining measurable gaps.

### Disproves Completion

- A skill is a broad prompt dump.
- Skills are added without eval coverage.
- The product plan is duplicated into several conflicting docs.
- Product runtime implementation starts before this slice can evaluate its own operator layer.

## Slice 2: Typed Runtime Spine

### Mission

Build the final local runtime foundation that produces typed evidence for later MCP/API/dashboard work.

### Required Work

- Create pnpm TypeScript workspace.
- Add strict TypeScript configuration and test/typecheck scripts.
- Create packages:
  - `packages/contracts`,
  - `packages/cli`,
  - `packages/evals`.
- Migrate or wrap existing product-spine objects as TypeScript parsers and exported schemas.
- Implement CLI commands:
  - `krn init --dry-run`,
  - `krn doctor`,
  - `krn eval`,
  - `krn review`.
- Treat all external inputs as `unknown` until parsed.
- Add valid and known-bad fixtures for every durable object.
- Keep runtime outputs under `.krn/`.

### Acceptance Evidence

- `pnpm typecheck` passes.
- `pnpm test` passes.
- valid fixtures pass and known-bad fixtures fail.
- `krn init --dry-run` produces a manifest without mutating target files.
- `krn doctor` reports AGENTS/memory/skills/hooks/eval readiness.
- `krn eval` emits schema-backed reports.
- `krn review` emits proposal-only review reports over typed local runtime artifacts.
- No new Python product code is introduced.

### Disproves Completion

- CLI output is human prose without machine-readable contracts.
- Product objects are reimplemented separately by CLI/evals/dashboard.
- Any command silently mutates target project files.
- Dashboard/API/MCP code starts before typed reports exist.

## Slice 3: Control Plane And Measured Lift

### Mission

Expose the product loop to humans and other agents, then prove whether it improves Codex work.

### Required Work

- Add `packages/mcp` read-only resource gateway.
- Add proposal-only tools for memory/source/eval/repair/dashboard events.
- Add `apps/dashboard` using typed view models from contracts.
- Build dashboard views:
  - Memory Core,
  - Pending Review,
  - Knowledge Gaps,
  - Source/Claim Ledger,
  - Eval Runs,
  - Skill Impact,
  - Goal/Continuity Health.
- Add runtime/product skills only after they use typed API/MCP contracts.
- Keep ChatGPT reviewer bridge deferred and optional. It may become a static/read-only external reviewer only after the local Codex/KRN loop proves useful.
- Add benchmark harness for baseline Codex vs KRN-assisted Codex.

### Acceptance Evidence

- Dashboard renders real generated product objects only.
- Every dashboard metric has source, owner, action, and failure mode.
- MCP/API resources are allowlisted and schema-backed.
- Proposal writes are append-only, idempotent, and reviewable.
- Benchmark report states measured lift or no-lift with repair targets.

### Disproves Completion

- Dashboard reads chat state or mocked product state.
- MCP exposes destructive tools.
- Runtime skills bypass contracts.
- Lift is claimed from anecdotes, screenshots, or one green eval.

## Completion Criteria

This goal is complete only when all three slices pass their acceptance evidence and the final product loop can be demonstrated with generated artifacts from this repo.

Do not mark complete for:

- a nice plan,
- a CLI bootstrap alone,
- a dashboard screenshot,
- passing unit tests without eval/repair evidence,
- a skill pack without impact measurement.

## Next Concrete Action

Continue Slice 3 by creating the next bounded child goal from the latest completed child goal:

```bash
docs/goals/goal-029.md
```

Next child-goal candidates after `goal-029` are suite expansion review toward the 20-task lift gate with benchmark pipeline ergonomics and coding-quality rubric dimensions, read-only repair-record MCP/dashboard surfacing, HTTP/API read model hardening, or Skill Impact / Goal Continuity surfaces. Expanding the fixed live suite is now review-ready because the stability gate reports repeated clean completed live evidence, but productivity lift remains blocked until a larger suite satisfies the lift gate with positive clean live evidence. The expanded suite should measure not only task-answer quality, but also assumptions, simplicity, surgical diffs, verification quality, and human review burden. Run the research/plan checkpoint first. Do not add explicit live benchmark runner mode to default deterministic `krn eval`, expose destructive MCP/API tools, mocked dashboard state, broad promotion mutation, dashboard rerun/repair commands, or productivity claims from three-task live benchmark evidence, a proposed repair record, a green live shape report, a stability classifier pass, repeated clean small-suite evidence, or positive suite deltas below the lift gate.
