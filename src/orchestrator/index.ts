import { classifyIntent } from "../classifier/intent";
import { OrchestrationResult, ValidationRequest } from "../types";
import { validate } from "../validator";

const PLANS = {
  build: ["Definir alcance funcional", "Generar solucion inicial", "Validar contra criterios de exito"],
  debug: ["Reproducir error", "Identificar causa raiz", "Aplicar fix y validar"],
  review: ["Evaluar riesgos", "Listar hallazgos", "Sugerir correcciones prioritarias"],
  learn: ["Explicar conceptos clave", "Mostrar ejemplo minimo", "Proponer siguiente practica"]
} as const;

export function executeOrchestrator(req: ValidationRequest): OrchestrationResult {
  const validation = validate(req);
  const intent = classifyIntent(req.objetivo || "");

  if (validation.status === "REJECTED") {
    return {
      validation,
      intent,
      plan: ["Corregir validacion", "Completar datos faltantes", "Reintentar solicitud"],
      next_action: "blocked"
    };
  }

  if (validation.status === "PARTIAL") {
    return {
      validation,
      intent,
      plan: ["Continuar con advertencias", ...PLANS[intent]],
      next_action: "clarify"
    };
  }

  return {
    validation,
    intent,
    plan: [...PLANS[intent]],
    next_action: "continue"
  };
}