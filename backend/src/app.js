import cors from "cors";
import express from "express";
import { createApiRouter } from "./routes/api.js";

export function createApp(options) {
  const app = express();
  app.use(cors({ origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173" }));
  app.use(express.json({ limit: "1mb" }));
  app.get("/api/health", (_request, response) => response.json({ status: "ok" }));
  app.use("/api", createApiRouter(options));
  app.use((error, _request, response, _next) => {
    if (error.type === "entity.too.large") {
      return response.status(413).json({ error: "The extracted text is too large. Try a shorter document." });
    }
    if (error.type === "entity.parse.failed") {
      return response.status(400).json({ error: "The request body must be valid JSON." });
    }
    if (error.cause === "unavailable" || error.cause === "model") {
      return response.status(503).json({ error: error.message });
    }
    if (error.cause === "invalid_response") {
      return response.status(502).json({ error: error.message });
    }
    if (error.message?.startsWith("The AI ")) {
      return response.status(502).json({ error: error.message });
    }
    console.error("Unexpected API error:", error);
    return response.status(500).json({ error: "Something went wrong while processing the document. Please try again." });
  });
  return app;
}
