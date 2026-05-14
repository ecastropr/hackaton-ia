import { Intent } from "../types";

export function classifyIntent(text: string): Intent {
  const normalized = text.toLowerCase();

  if (/(error|bug|falla|debug|fix|rompe)/.test(normalized)) {
    return "debug";
  }

  if (/(review|auditar|evaluar|analizar|riesgo)/.test(normalized)) {
    return "review";
  }

  if (/(explica|aprender|como|learn|entender|guia)/.test(normalized)) {
    return "learn";
  }

  return "build";
}