import assert from "node:assert/strict";
import test from "node:test";
import request from "supertest";
import { createApp } from "../src/app.js";
import { parseAnalysisResponse, validateDocumentText } from "../src/services/response.js";

const validText = "The registration form must be submitted before October 15.";
const validAnalysis = {
  summary: "Submit the registration form before October 15.",
  importantPoints: ["Registration is required."],
  actionItems: ["Submit the registration form."],
  importantDates: [{ date: "October 15", event: "Registration deadline", context: "Submit the form." }],
  warnings: [],
};

test("document text validation rejects missing, short, and oversized text", () => {
  assert.match(validateDocumentText(""), /at least 20 characters/);
  assert.equal(validateDocumentText(validText), null);
  assert.match(validateDocumentText("x".repeat(60_001)), /60,000/);
});

test("analysis response parser handles fenced JSON and validates fields", () => {
  const result = parseAnalysisResponse(`\`\`\`json\n${JSON.stringify(validAnalysis)}\n\`\`\``);
  assert.equal(result.summary, validAnalysis.summary);
  assert.equal(result.importantDates[0].date, "October 15");
  assert.throws(() => parseAnalysisResponse("not JSON"), /invalid response/);
  assert.throws(() => parseAnalysisResponse('{"summary":"Only a summary"}'), /expected sections/);
});

test("analysis parser drops date context not present in source text", () => {
  const analysis = {
    ...validAnalysis,
    importantDates: [
      { date: "October 15", event: "Registration deadline", context: "form must be submitted before October 15." },
      { date: "October 15", event: "Registration deadline", context: "Pages 1 and 2" },
    ],
  };
  const result = parseAnalysisResponse(JSON.stringify(analysis), validText);
  assert.equal(result.importantDates[0].context, "form must be submitted before October 15.");
  assert.equal(result.importantDates[1].context, "");
});

test("analysis parser removes action reminders not supported by source wording", () => {
  const analysis = {
    ...validAnalysis,
    actionItems: [
      "Upload current semester marksheet",
      "Submit application by October 15",
      "Check for results on November 2",
    ],
  };
  const result = parseAnalysisResponse(JSON.stringify(analysis), validText);
  assert.deepEqual(result.actionItems, ["Submit application by October 15"]);
});

test("POST /api/analyze validates input and returns structured analysis", async () => {
  const app = createApp({ analyze: async () => validAnalysis });
  const invalid = await request(app).post("/api/analyze").send({ text: "short" });
  assert.equal(invalid.status, 400);

  const response = await request(app).post("/api/analyze").send({ text: validText });
  assert.equal(response.status, 200);
  assert.deepEqual(response.body, validAnalysis);
});

test("POST /api/ask validates question and returns an answer", async () => {
  const app = createApp({ answer: async (_text, question) => `The deadline is October 15. Asked: ${question}` });
  const invalid = await request(app).post("/api/ask").send({ text: validText, question: "  " });
  assert.equal(invalid.status, 400);

  const response = await request(app).post("/api/ask").send({ text: validText, question: "When is it due?" });
  assert.equal(response.status, 200);
  assert.match(response.body.answer, /October 15/);
});

test("API surfaces unavailable Ollama as a useful service error", async () => {
  const app = createApp({ analyze: async () => { throw new Error("Ollama could not be reached.", { cause: "unavailable" }); } });
  const response = await request(app).post("/api/analyze").send({ text: validText });
  assert.equal(response.status, 503);
  assert.match(response.body.error, /Ollama could not be reached/);
});
