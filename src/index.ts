import express, { NextFunction, Request, Response } from "express";
import { config } from "./config";
import { executeOrchestrator } from "./orchestrator";
import { ValidationRequest } from "./types";

const app = express();

app.use(express.json());

app.get("/health", (_req: Request, res: Response) => {
  res.json({
    status: "ok",
    service: "hackaton-mcp",
    env: config.nodeEnv,
    port: config.port,
    time: new Date().toISOString()
  });
});

app.post("/validate", (req: Request, res: Response) => {
  const request = req.body as ValidationRequest;
  const result = executeOrchestrator(request);

  if (result.validation.status === "REJECTED") {
    res.status(400).json(result);
    return;
  }

  res.json(result);
});

app.post("/ask", (req: Request, res: Response) => {
  const request = req.body as ValidationRequest;
  const result = executeOrchestrator(request);

  if (result.validation.status === "REJECTED") {
    res.status(400).json({
      message: "Solicitud rechazada por politicas de validacion",
      ...result
    });
    return;
  }

  res.json({
    message: "Solicitud aceptada para ejecucion",
    ...result
  });
});

app.use((error: Error, _req: Request, res: Response, _next: NextFunction) => {
  res.status(500).json({
    error: "INTERNAL_ERROR",
    message: error.message
  });
});

app.listen(config.port, () => {
  // eslint-disable-next-line no-console
  console.log(`[MCP] Listening on http://localhost:${config.port}`);
});