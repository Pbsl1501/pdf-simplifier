# PDF Simplifier

Understand your PDF in seconds.

PDF Simplifier turns dense college notices and academic PDFs into a plain-language summary, useful dates, and a checklist of what to do next. It is built for students who need the important information without decoding pages of formal language.

## Why I built it

For the Hacktoberfest Weekend 2026 **Build for a Friend** challenge, the starting point was a familiar student problem: a college friend frequently receives confusing college PDFs and asks, “What does this notice actually mean and what do I need to do?” PDF Simplifier is designed to answer that question. This describes the motivation; it does not claim that the app has been tested by that friend.

## Features

- Drag-and-drop or browse to select a PDF, with file validation and size feedback.
- Extract selectable text from every page in the browser using PDF.js. The PDF file itself is not sent to the backend.
- Ask a locally configured Ollama model for a simple summary, key points, actionable checklist, dates, and warnings.
- Ask follow-up questions grounded in the extracted text, with a per-document conversation history.
- Check off action items, reset a document, and see clear processing, empty, and error states.
- No accounts, analytics, database, or permanent document storage.

## Architecture

```text
PDF selected in browser
  -> PDF.js extracts page text locally
  -> React sends extracted text to Express
  -> Express calls the configured local Ollama model
  -> Structured JSON is validated and returned to the browser
```

The browser does not upload the original PDF. The backend keeps no document records; extracted text exists in request memory while the model responds. It is sent to the Ollama server specified by `OLLAMA_BASE_URL`. If that points to a remote host, that host receives the extracted text, so configure it accordingly.

## Why open-weight AI

Gemma can run through Ollama on a machine the developer controls, so the default setup does not depend on a closed, paid AI API. The model can also be changed with `OLLAMA_MODEL`. Local inference keeps document text within the configured local setup by default; pointing Ollama at a remote host changes that privacy boundary, as described above.

## Tech stack

- Frontend: React, Vite, JavaScript, CSS, PDF.js (`pdfjs-dist`), Lucide icons
- Backend: Node.js, Express
- AI: Ollama's local HTTP API with a configurable open-weight model (default: `gemma3:1b`)
- Tests: Node.js test runner and Supertest

## Requirements

- Node.js 20 or newer and npm
- Ollama for AI analysis and questions

## Setup

Open two terminals at the project root.

### 1. Configure Ollama and the backend

Install Ollama from [ollama.com](https://ollama.com), start it, then download the default model:

```bash
ollama pull gemma3:1b
```

Copy `backend/.env.example` to `backend/.env` and adjust the model or Ollama URL if needed. `.env` is ignored by Git.

```bash
cd backend
npm install
npm run dev
```

The API listens on `http://localhost:3001`. Without Ollama running or the configured model installed, analysis and questions return a helpful service error; there is no fake/demo analysis.

### 2. Run the frontend

In a second terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL printed by Vite (normally `http://localhost:5173`). Vite proxies `/api` requests to the backend.

### Other commands

```bash
# Backend tests
cd backend
npm test

# Production frontend build
cd frontend
npm run build
```

## Using the app

1. Choose or drop a text-based PDF (up to 20 MB).
2. Select **Simplify this PDF**. The browser extracts text page by page, then the backend asks Ollama to analyze that text.
3. Review the summary, points, dates, warnings, and checklist. Ask a question in **Ask the PDF** for more detail.

## Environment variables

| Variable | Default | Purpose |
| --- | --- | --- |
| `PORT` | `3001` | Express server port |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama server base URL |
| `OLLAMA_MODEL` | `gemma3:1b` | Installed Ollama model name |
| `FRONTEND_ORIGIN` | `http://localhost:5173` | Allowed browser origin for the API |

## PDF and AI limitations

- Scanned/image-only PDFs are not OCR'd. If PDF.js cannot find selectable text, the app explains that OCR is not supported.
- Password-protected, malformed, or unusually large documents may fail to process.
- Extracted text is capped at 60,000 characters before it reaches the backend to keep local model requests manageable. The app indicates when text was truncated.
- AI output can omit or misunderstand details. Verify dates, eligibility, and requirements against the original notice. The model is instructed not to invent missing details, but this cannot be guaranteed.
- The app sends extracted text and questions to the Ollama endpoint configured by the developer. A remote Ollama host is not local processing; review its privacy characteristics before using it with sensitive documents.

## Project structure

```text
pdf-simplifier/
├── backend/
│   ├── src/
│   │   ├── routes/api.js
│   │   ├── services/ollama.js
│   │   ├── services/response.js
│   │   ├── app.js
│   │   └── server.js
│   ├── test/api.test.js
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── ...
│   └── vite.config.js
├── .gitignore
└── README.md
```

## Screenshots

Screenshots will be added after the app is run locally.

## Future improvements

- Optional OCR for scanned documents.
- Better handling of tables and complex page layouts.
- Export a checklist or summary for offline use.
- More automated browser-level tests and accessibility review.

## Contributing

Contributions are welcome. Please open an issue to discuss larger changes, keep pull requests focused, and run `npm test` in `backend` and `npm run build` in `frontend` before submitting.

## License

This project is released under the MIT License. See [LICENSE](LICENSE).
