export type Intent = "build" | "debug" | "review" | "learn";
export type Severity = "critica" | "alta" | "media" | "baja";
export type ValidationStatus = "APPROVED" | "PARTIAL" | "REJECTED";

export interface ValidationRequest {
  objetivo?: string;
  contexto?: {
    stack?: string[];
    framework?: string;
    base_datos?: string;
    [key: string]: unknown;
  };
  restricciones?: string[];
  criterio_exito?: string;
  dependencias?: DependencyInput[];
}

export interface DependencyInput {
  ecosystem: string;
  package: string;
  version: string;
}

export interface RuleOutcome {
  rule: string;
  passed: boolean;
  severity: Severity;
  message: string;
  details?: string[];
}

export interface ValidationResult {
  status: ValidationStatus;
  score: number;
  rules_applied: RuleOutcome[];
  assumptions: string[];
  errors: string[];
  warnings: string[];
  debug_prompt_required: boolean;
}

export interface OrchestrationResult {
  validation: ValidationResult;
  intent: Intent;
  plan: string[];
  next_action: "continue" | "clarify" | "blocked";
}