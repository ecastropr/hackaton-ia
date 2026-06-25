import validationPolicy from "../../policy/VALIDATION_POLICY.json";
import { ValidationRequest } from "../types";

export interface RequiredFieldsResult {
  missingFields: string[];
  score: number;
}

function isMissingField(field: string, req: ValidationRequest): boolean {
  switch (field) {
    case "objetivo":
      return typeof req.objetivo !== "string" || req.objetivo.trim().length < validationPolicy.required_fields.objetivo.min_length;
    case "contexto":
      return !req.contexto || !Array.isArray(req.contexto.stack) || req.contexto.stack.length === 0;
    case "restricciones":
      return !Array.isArray(req.restricciones);
    case "criterio_exito":
      return (
        typeof req.criterio_exito !== "string" ||
        req.criterio_exito.trim().length < validationPolicy.required_fields.criterio_exito.min_length
      );
    default:
      return false;
  }
}

export function validateRequiredFields(req: ValidationRequest): RequiredFieldsResult {
  const fieldNames = Object.keys(validationPolicy.required_fields);
  const missingFields = fieldNames.filter((field) => isMissingField(field, req));
  const score = Math.round(((fieldNames.length - missingFields.length) / fieldNames.length) * 100);

  return {
    missingFields,
    score
  };
}