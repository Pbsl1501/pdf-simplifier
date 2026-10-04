export const MAX_TEXT_LENGTH = 60_000;

const actionVerbPatterns = [
  /\bsubmit(?:s|ted|ting)?\b/i,
  /\bupload(?:s|ed|ing)?\b/i,
  /\bcomplete(?:s|d|ing)?\b/i,
  /\bfill(?:s|ed|ing)?\b/i,
  /\bpay(?:s|ing)?\b|\bpaid\b/i,
  /\bregister(?:s|ed|ing)?\b/i,
  /\bbring(?:s|ing)?\b|\bbrought\b/i,
  /\battend(?:s|ed|ing)?\b/i,
  /\bdownload(?:s|ed|ing)?\b/i,
  /\bprint(?:s|ed|ing)?\b/i,
  /\bprovide(?:s|d|ing)?\b/i,
  /\bsend(?:s|ing)?\b|\bsent\b/i,
  /\bcontact(?:s|ed|ing)?\b/i,
  /\bsign(?:s|ed|ing)?\b/i,
  /\battach(?:es|ed|ing)?\b/i,
  /\bcarry(?:ies|ied|ing)?\b/i,
  /\bcheck(?:s|ed|ing)?\b/i,
  /\bvisit(?:s|ed|ing)?\b/i,
  /\breview(?:s|ed|ing)?\b/i,
  /\bconfirm(?:s|ed|ing)?\b/i,
  /\bprepare(?:s|d|ing)?\b/i,
];

export function validateDocumentText(text) {
  if (typeof text !== "string" || text.trim().length < 20) {
    return "Please provide at least 20 characters of extracted PDF text.";
  }
  if (text.length > MAX_TEXT_LENGTH) {
    return `PDF text must be ${MAX_TEXT_LENGTH.toLocaleString()} characters or fewer.`;
  }
  return null;
}

export function parseAnalysisResponse(rawResponse, sourceText) {
  const cleaned = rawResponse
    .trim()
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "");

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("The AI returned an invalid response. Please try again.");
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("The AI response did not match the expected format.");
  }

  const listFields = ["importantPoints", "actionItems", "importantDates", "warnings"];
  if (typeof parsed.summary !== "string" || listFields.some((field) => !Array.isArray(parsed[field]))) {
    throw new Error("The AI response did not include all expected sections.");
  }

  return {
    summary: parsed.summary.trim(),
    importantPoints: parsed.importantPoints.filter(isNonEmptyString),
    actionItems: parsed.actionItems
      .filter(isNonEmptyString)
      .filter((item) => isSupportedAction(item, sourceText)),
    importantDates: parsed.importantDates
      .filter((item) => item && typeof item === "object")
      .map((item) => ({
        date: stringOrFallback(item.date, "Date not specified"),
        event: stringOrFallback(item.event, "Event not specified"),
        context: isSupportedContext(item.context, sourceText) ? item.context.trim() : "",
      })),
    warnings: parsed.warnings.filter(isNonEmptyString),
  };
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function stringOrFallback(value, fallback) {
  return isNonEmptyString(value) ? value.trim() : fallback;
}

function isSupportedContext(context, sourceText) {
  if (!isNonEmptyString(context)) return false;
  if (typeof sourceText !== "string") return true;
  const normalize = (value) => value.toLowerCase().replace(/\s+/g, " ").trim();
  return normalize(sourceText).includes(normalize(context));
}

function isSupportedAction(action, sourceText) {
  if (typeof sourceText !== "string") return true;
  const actionVerb = actionVerbPatterns.find((pattern) => pattern.test(action));
  return actionVerb ? actionVerb.test(sourceText) : false;
}
