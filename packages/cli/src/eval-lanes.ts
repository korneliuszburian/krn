import type { EvalLane, EvalLaneSelection } from "@krn/contracts";

export const DEFAULT_EVAL_LANE_POLICY =
  "Default current runs core plus current eval modules. Lab modules require --lane lab, --lane all, or explicit --module selection.";

export function uniqueEvalLanes(laneValues: readonly EvalLane[]): EvalLane[] {
  const lanes: EvalLane[] = [];
  for (const lane of laneValues) {
    if (!lanes.includes(lane)) {
      lanes.push(lane);
    }
  }
  return lanes;
}

export function includedLanesForSelection(selection: EvalLaneSelection): EvalLane[] {
  if (selection === "core") {
    return ["core"];
  }
  if (selection === "current") {
    return ["core", "current"];
  }
  if (selection === "lab") {
    return ["lab"];
  }
  if (selection === "all") {
    return ["core", "current", "lab"];
  }
  return ["core", "current", "lab"];
}

export function excludedLanesForSelection(selection: EvalLaneSelection, includedLanes: readonly EvalLane[]): EvalLane[] {
  if (selection === "custom" || selection === "all") {
    return [];
  }

  return (["core", "current", "lab"] as const).filter((lane) => !includedLanes.includes(lane));
}
