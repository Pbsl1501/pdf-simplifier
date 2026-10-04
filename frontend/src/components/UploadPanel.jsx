import { FileText, LoaderCircle, Sparkles, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { validatePdfFile } from "../services/pdf.js";

function formatSize(bytes) {
  return bytes < 1024 * 1024 ? `${Math.max(1, Math.round(bytes / 1024))} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function UploadPanel({ file, onFile, onAnalyze, busy }) {
  const inputRef = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");

  function acceptFile(candidate) {
    const validationError = validatePdfFile(candidate);
    setError(validationError || "");
    if (!validationError) onFile(candidate);
  }

  function handleDrop(event) {
    event.preventDefault();
    setDragging(false);
    acceptFile(event.dataTransfer.files[0]);
  }

  return (
    <section className="upload-card" aria-labelledby="upload-heading">
      <div className="section-kicker"><span className="kicker-number">01</span> Start with a document</div>
      <h2 id="upload-heading">What are we figuring out?</h2>
      <p className="upload-intro">Drop in that notice, brief, or study handout. We’ll find the parts that matter.</p>
      <div
        className={`drop-zone${dragging ? " is-dragging" : ""}${file ? " has-file" : ""}`}
        onDragEnter={(event) => { event.preventDefault(); setDragging(true); }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setDragging(false); }}
        onDrop={handleDrop}
        onClick={() => !file && inputRef.current?.click()}
        onKeyDown={(event) => { if (!file && (event.key === "Enter" || event.key === " ")) inputRef.current?.click(); }}
        role="button"
        tabIndex={file ? -1 : 0}
        aria-label="Choose a PDF or drop it here"
      >
        <input
          ref={inputRef}
          className="visually-hidden"
          type="file"
          accept="application/pdf,.pdf"
          onChange={(event) => { acceptFile(event.target.files[0]); event.target.value = ""; }}
          aria-label="Choose a PDF file"
        />
        {file ? (
          <div className="selected-file">
            <div className="file-icon"><FileText size={22} aria-hidden="true" /></div>
            <div className="file-copy"><strong>{file.name}</strong><span>{formatSize(file.size)} · PDF document</span></div>
            <button className="icon-button remove-file" type="button" aria-label="Remove selected PDF" onClick={(event) => { event.stopPropagation(); onFile(null); setError(""); }} disabled={busy}><X size={18} /></button>
          </div>
        ) : (
          <>
            <div className="upload-symbol"><Upload size={22} strokeWidth={1.8} aria-hidden="true" /></div>
            <strong className="drop-title">Drop your PDF right here</strong>
            <span className="drop-subtitle">or choose a file from your device</span>
            <button className="browse-button" type="button" onClick={(event) => { event.stopPropagation(); inputRef.current?.click(); }}>Browse PDFs</button>
            <span className="file-limit">PDF only · Up to 20 MB</span>
          </>
        )}
      </div>
      {error && <p className="inline-error" role="alert">{error}</p>}
      <button className="analyze-button" type="button" onClick={onAnalyze} disabled={!file || busy}>
        {busy ? <><LoaderCircle className="spin" size={18} /> Reading your PDF...</> : <><Sparkles size={17} /> Simplify this PDF <span aria-hidden="true">↗</span></>}
      </button>
      <p className="privacy-note"><span className="privacy-dot" /> Your file stays in your browser. Only its extracted text is sent to your configured AI.</p>
    </section>
  );
}
