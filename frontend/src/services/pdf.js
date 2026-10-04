export const MAX_FILE_SIZE = 20 * 1024 * 1024;
export const MAX_EXTRACTED_TEXT = 60_000;

export function validatePdfFile(file) {
  if (!file) return "Choose a PDF file to continue.";
  if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
    return "That file does not look like a PDF. Please choose a .pdf file.";
  }
  if (file.size === 0) return "This file is empty. Choose another PDF.";
  if (file.size > MAX_FILE_SIZE) return "This PDF is larger than 20 MB. Choose a smaller file.";
  return null;
}

export async function extractPdfText(file) {
  const [{ GlobalWorkerOptions, getDocument }, { default: workerUrl }] = await Promise.all([
    import("pdfjs-dist"),
    import("pdfjs-dist/build/pdf.worker.min.mjs?url"),
  ]);
  GlobalWorkerOptions.workerSrc = workerUrl;
  const bytes = new Uint8Array(await file.arrayBuffer());
  const document = await getDocument({ data: bytes }).promise;
  const pageTexts = [];

  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .filter(Boolean)
      .join(" ");
    pageTexts.push(pageText);
  }

  const fullText = pageTexts.join("\n\n").trim();
  if (!fullText) {
    throw new Error("No selectable text was found. This may be a scanned PDF; image-only PDFs need OCR, which is not supported yet.");
  }
  return {
    text: fullText.slice(0, MAX_EXTRACTED_TEXT),
    truncated: fullText.length > MAX_EXTRACTED_TEXT,
    pages: document.numPages,
  };
}
