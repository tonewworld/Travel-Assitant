// backend/src/config/config.ts
import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  llm: {
    provider: process.env.LLM_PROVIDER || "mock",
    apiKey: process.env.LLM_API_KEY || "",
    endpoint: process.env.LLM_ENDPOINT || "",
    model: process.env.LLM_MODEL || "moonshot-v1-8k"
  },
  amap: {
    apiKey: process.env.AMAP_API_KEY || "",
    baseUrl: "https://restapi.amap.com/v3"
  }
};