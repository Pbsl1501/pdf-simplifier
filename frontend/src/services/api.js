async function post(path, body) {
  let response;
  try {
    response = await fetch(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error("Can't reach the PDF Simplifier backend. Make sure it is running on port 3001.");
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.error || "The request could not be completed. Please try again.");
  return data;
}

export function analyzePdfText(text) {
  return post("/api/analyze", { text });
}

export function askPdfQuestion(text, question) {
  return post("/api/ask", { text, question });
}
