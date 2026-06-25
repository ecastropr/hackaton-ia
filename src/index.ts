import express, { NextFunction, Request, Response } from "express";
import { IncomingMessage, ServerResponse } from "node:http";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { z } from "zod";
import { config } from "./config";
import { executeOrchestrator } from "./orchestrator";
import { ValidationRequest } from "./types";

const app = express();

app.use(express.json());

// --- MCP SSE transport ---
const sseTransports = new Map<string, SSEServerTransport>();

function createMcpServer(): McpServer {
  const server = new McpServer({ name: "hackaton-mcp", version: "1.0.0" });

  const requestShape = {
    objetivo: z.string().optional(),
    contexto: z.object({
      stack: z.array(z.string()).optional(),
      framework: z.string().optional(),
      base_datos: z.string().optional()
    }).optional(),
    restricciones: z.array(z.string()).optional(),
    criterio_exito: z.string().optional()
  };

  server.tool("validate_request", "Valida una solicitud contra las politicas del hackaton", requestShape, async (args) => {
    const result = executeOrchestrator(args as ValidationRequest);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  server.tool("ask_orchestrator", "Envia una solicitud al orquestador y retorna el plan de accion", requestShape, async (args) => {
    const result = executeOrchestrator(args as ValidationRequest);
    return { content: [{ type: "text", text: JSON.stringify(result, null, 2) }] };
  });

  return server;
}

app.get("/mcp", async (req: Request, res: Response) => {
  const transport = new SSEServerTransport("/message", res as unknown as ServerResponse);
  sseTransports.set(transport.sessionId, transport);
  transport.onclose = () => {
    sseTransports.delete(transport.sessionId);
  };
  const mcpServer = createMcpServer();
  await mcpServer.connect(transport);
});

app.post("/message", async (req: Request, res: Response) => {
  const sessionId = req.query.sessionId as string;
  const transport = sseTransports.get(sessionId);
  if (!transport) {
    res.status(404).json({ error: "Session not found" });
    return;
  }
  await transport.handlePostMessage(
    req as unknown as IncomingMessage,
    res as unknown as ServerResponse,
    req.body
  );
});

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