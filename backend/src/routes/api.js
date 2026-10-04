import { Router } from "express";
import { analyzeDocument, answerQuestion } from "../services/ollama.js";
import { validateDocumentText, MAX_TEXT_LENGTH } from "../services/response.js";

export function createApiRouter({ analyze = analyzeDocument, answer = answerQuestion } = {}) {
  const router = Router();

  router.post("/analyze", async (request, response, next) => {
    const { text } = request.body ?? {};
    const validationError = validateDocumentText(text);
    if (validationError) {
      return response.status(400).json({ error: validationError });
    }

    try {
      const result = await analyze(text);
      return response.json(result);
    } catch (error) {
      return next(error);
    }
  });

  router.post("/ask", async (request, response, next) => {
    const { text, question } = request.body ?? {};
    const validationError = validateDocumentText(text);
    if (validationError) {
      return response.status(400).json({ error: validationError });
    }
    if (typeof question !== "string" || !question.trim()) {
      return response.status(400).json({ error: "Please enter a question about this PDF." });
    }
    if (question.length > 1_000) {
      return response.status(400).json({ error: "Please keep your question under 1,000 characters." });
    }
    if (text.length > MAX_TEXT_LENGTH) {
      return response.status(400).json({ error: `PDF text must be ${MAX_TEXT_LENGTH.toLocaleString()} characters or fewer.` });
    }

    try {
      const result = await answer(text, question.trim());
      return response.json({ answer: result });
    } catch (error) {
      return next(error);
    }
  });

  return router;
}
