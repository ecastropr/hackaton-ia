import { DEBUG_TEMPLATE } from "../prompts/debug-template";
import { RuleOutcome, ValidationRequest, ValidationResult } from "../types";
import { validateDependencies } from "./dependency-security";
import { validateRequiredFields } from "./gates";
import { validateStack } from "./stack-policy";

function buildGateOutcome(missingFields: string[]): RuleOutcome {
  return {
    rule: "GATE_VALIDATION",
    passed: missingFields.length === 0,
    severity: missingFields.length >= 2 ? "alta" : "media",
    message:
      missingFields.length === 0
        ? "Campos requeridos completos"
        : `Campos faltantes: ${missingFields.join(", ")}`,
    details: missingFields
  };
}

function buildStackOutcome(blocked: string[], alternatives: string[]): RuleOutcome {
  return {
    rule: "STACK_POLICY",
    passed: blocked.length === 0,
    severity: blocked.length > 0 ? "alta" : "baja",
    message: blocked.length === 0 ? "Stack permitido" : `Tecnologias bloqueadas: ${blocked.join(", ")}`,
    details: alternatives
  };
}

export function validate(req: ValidationRequest): ValidationResult {
  const assumptions: string[] = [];
  const errors: string[] = [];
  const warnings: string[] = [];
  const rulesApplied: RuleOutcome[] = [];

  const gateResult = validateRequiredFields(req);
  rulesApplied.push(buildGateOutcome(gateResult.missingFields));

  const stackResult = validateStack(req.contexto?.stack || []);
  rulesApplied.push(buildStackOutcome(stackResult.blocked, stackResult.alternatives));

  const dependencyOutcomes = validateDependencies(req.dependencias || []);
  rulesApplied.push(...dependencyOutcomes);

  if (gateResult.missingFields.length >= 2) {
    errors.push("Solicitud incompleta: faltan 2 o mas campos obligatorios");
  } else if (gateResult.missingFields.length === 1) {
    warnings.push("Falta 1 campo obligatorio, se permite continuar con suposicion");
    assumptions.push(`Se asumira el campo faltante: ${gateResult.missingFields[0]}`);
  }

  if (!stackResult.allowed) {
    errors.push(`Stack bloqueado por politica estricta: ${stackResult.blocked.join(", ")}`);
  }

  for (const outcome of dependencyOutcomes) {
    if (outcome.severity === "critica" || outcome.severity === "alta") {
      errors.push(outcome.message);
    } else {
      warnings.push(outcome.message);
    }
  }

  const status = errors.length > 0 ? "REJECTED" : warnings.length > 0 ? "PARTIAL" : "APPROVED";

  if (status === "REJECTED" && gateResult.missingFields.length >= 2) {
    warnings.push(DEBUG_TEMPLATE);
  }

  return {
    status,
    score: gateResult.score,
    rules_applied: rulesApplied,
    assumptions,
    errors,
    warnings,
    debug_prompt_required: gateResult.missingFields.length >= 2
  };
}