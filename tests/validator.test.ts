import { validate } from "../src/validator";

describe("validate", () => {
  it("returns APPROVED for complete and allowed request", () => {
    const result = validate({
      objetivo: "Crear endpoint de autenticacion JWT",
      contexto: {
        stack: ["TypeScript", "Node.js"]
      },
      restricciones: [],
      criterio_exito: "Endpoint funcional con pruebas"
    });

    expect(result.status).toBe("APPROVED");
  });

  it("returns PARTIAL when exactly one required field is missing", () => {
    const result = validate({
      objetivo: "Crear endpoint de autenticacion JWT",
      contexto: {
        stack: ["TypeScript", "Node.js"]
      },
      criterio_exito: "Endpoint funcional con pruebas"
    });

    expect(result.status).toBe("PARTIAL");
    expect(result.assumptions.length).toBe(1);
  });

  it("returns REJECTED when blocked technologies are used", () => {
    const result = validate({
      objetivo: "Crear API REST",
      contexto: {
        stack: ["Ruby", "Rails"]
      },
      restricciones: [],
      criterio_exito: "API funcional"
    });

    expect(result.status).toBe("REJECTED");
    expect(result.errors.length).toBeGreaterThan(0);
  });
});