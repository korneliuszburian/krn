export type KrnRequiredSkill = {
  name: string;
  reason: string;
};

type SkillRule = {
  pattern: RegExp;
  name: string;
  reason: string;
  targetPathMatches?: (targetPath: string | null) => boolean;
};

const SKILL_RULES: readonly SkillRule[] = [
  {
    pattern: /\b(type|typescript|contract|parser|cli|mcp|api|dashboard|view model|schema)\b/,
    name: "typescript-contract-engineer",
    reason: "The task touches TypeScript contracts, parsers, CLI, MCP/API, dashboard, or package boundaries.",
    targetPathMatches: isTypeScriptTargetPath,
  },
  {
    pattern: /\b(eval|fixture|known-bad|metric|assertion|validation|gate)\b/,
    name: "eval-designer",
    reason: "The task changes eval behavior, fixtures, metrics, assertions, or validation gates.",
    targetPathMatches: isEvalTargetPath,
  },
  {
    pattern: /\b(goal|execplan|resume|long-running|final product|slice)\b/,
    name: "goal-execplan",
    reason: "The task changes a restartable goal, plan, or final-product slice boundary.",
  },
  {
    pattern: /\b(research|source|paper|pattern|adr|decision)\b/,
    name: "research-synthesis",
    reason: "The task needs source-backed synthesis or canonical decision updates.",
  },
];

function normalizeTargetPath(path: string | null): string | null {
  return path?.replaceAll("\\", "/") ?? null;
}

function isTypeScriptTargetPath(path: string | null): boolean {
  const normalized = normalizeTargetPath(path);
  return normalized !== null && /\.(?:ts|tsx|mts|cts)$/.test(normalized);
}

function isEvalTargetPath(path: string | null): boolean {
  const normalized = normalizeTargetPath(path);
  return normalized !== null && (normalized.startsWith("packages/evals/") || normalized.startsWith("docs/evals/"));
}

export function resolveKrnRequiredSkills(input: {
  task: string;
  targetPath: string | null;
  includeGoalExecplan?: string;
}): KrnRequiredSkill[] {
  const lowerTask = input.task.toLowerCase();
  const skills: KrnRequiredSkill[] = input.includeGoalExecplan
    ? [
        {
          name: "goal-execplan",
          reason: input.includeGoalExecplan,
        },
      ]
    : [];
  const existingSkillNames = new Set(skills.map((skill) => skill.name));

  for (const rule of SKILL_RULES) {
    const matches = rule.pattern.test(lowerTask) || rule.targetPathMatches?.(input.targetPath) === true;
    if (matches && !existingSkillNames.has(rule.name)) {
      skills.push({
        name: rule.name,
        reason: rule.reason,
      });
      existingSkillNames.add(rule.name);
    }
  }

  return skills;
}
