import dotenv from "dotenv";

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.MCP_PORT || 3000),
  logLevel: process.env.LOG_LEVEL || "info",
  openaiApiKey: process.env.OPENAI_API_KEY || "",
  policyStrictMode: process.env.POLICY_STRICT_MODE !== "false"
};