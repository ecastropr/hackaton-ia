import stackPolicy from "../../policy/STACK_POLICY.json";

const ALIASES: Record<string, string> = {
  node: "Node.js",
  js: "JavaScript",
  javascript: "JavaScript",
  ts: "TypeScript",
  typescript: "TypeScript",
  sql: "SQL",
  csharp: "C#"
};

const SUGGESTIONS: Record<string, string> = {
  Ruby: "Node.js",
  Rails: "Node.js",
  Vue: "React",
  Go: "Java",
  Rust: "Python"
};

export interface StackValidationResult {
  allowed: boolean;
  blocked: string[];
  alternatives: string[];
}

function normalizeTech(value: string): string {
  const key = value.trim();
  const lower = key.toLowerCase();
  return ALIASES[lower] || key;
}

function getAllowedTechnologies(): Set<string> {
  const allGroups = Object.values(stackPolicy.allowed_technologies);
  const allValues = allGroups.flat();
  return new Set(allValues.map((value) => normalizeTech(value)));
}

function getAlternative(tech: string): string {
  const direct = SUGGESTIONS[tech];
  if (direct) {
    return direct;
  }
  return "Solicita excepcion con mentor";
}

export function validateStack(stack: string[] = []): StackValidationResult {
  const allowedSet = getAllowedTechnologies();
  const normalizedInput = stack.map((item) => normalizeTech(item));
  const blocked = normalizedInput.filter((item) => !allowedSet.has(item));
  const alternatives = blocked.map((item) => getAlternative(item));

  return {
    allowed: blocked.length === 0,
    blocked,
    alternatives
  };
}