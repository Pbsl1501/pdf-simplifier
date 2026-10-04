import { ArrowRight, BookOpenText, CheckCircle2, FileCheck2, RotateCcw } from "lucide-react";
import { useState } from "react";
import AnalysisResults from "./components/AnalysisResults.jsx";
import AskPanel from "./components/AskPanel.jsx";
import UploadPanel from "./components/UploadPanel.jsx";
import { analyzePdfText, askPdfQuestion } from "./services/api.js";
import { extractPdfText } from "./services/pdf.js";

export default function App() {
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [extractedText, setExtractedText] = useState("");
  const [truncated, setTruncated] = useState(false);
  const [pageCount, setPageCount] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [asking, setAsking] = useState(false);
  const [error, setError] = useState("");
  const [messages, setMessages] = useState([]);
  const [completedItems, setCompletedItems] = useState(new Set());

  function reset() {
    setFile(null);
    setAnalysis(null);
    setExtractedText("");
    setTruncated(false);
    setPageCount(0);
    setError("");
    setMessages([]);
    setCompletedItems(new Set());
  }

  async function simplifyDocument() {
    if (!file || processing) return;
    setProcessing(true);
    setError("");
    setAnalysis(null);
    setMessages([]);
    setCompletedItems(new Set());
    try {
      const extracted = await extractPdfText(file);
      const result = await analyzePdfText(extracted.text);
      setExtractedText(extracted.text);
      setTruncated(extracted.truncated);
      setPageCount(extracted.pages);
      setAnalysis(result);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We couldn't process this PDF. Please try another file.");
    } finally {
      setProcessing(false);
    }
  }

  async function askQuestion(question) {
    if (!extractedText || asking) return;
    setAsking(true);
    setError("");
    setMessages((current) => [...current, { role: "user", content: question }]);
    try {
      const result = await askPdfQuestion(extractedText, question);
      setMessages((current) => [...current, { role: "assistant", content: result.answer }]);
    } catch (cause) {
      setMessages((current) => [...current, { role: "assistant", content: cause.message }]);
    } finally {
      setAsking(false);
    }
  }

  function toggleAction(index) {
    setCompletedItems((current) => {
      const next = new Set(current);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="PDF Simplifier home"><span className="brand-mark"><FileCheck2 size={18} /></span><span>PDF <span className="brand-accent">Simplifier</span></span></a>
        <div className="topbar-note"><span className="online-dot" /> Private by design <span className="topbar-divider">·</span> Powered by your local AI</div>
      </header>

      <main id="top">
        <section className="hero">
          <div className="hero-copy">
            <div className="hero-eyebrow"><BookOpenText size={15} /> MADE FOR THE MOMENTS THAT MATTER</div>
            <h1>Big PDF.<br /><span>Small steps.</span></h1>
            <p><strong>Understand your PDF in seconds.</strong> College notices shouldn't feel like a puzzle. Get the gist, spot the deadlines, and know what to do next.</p>
            <a className="hero-link" href="#workspace">Make sense of a document <ArrowRight size={16} /></a>
          </div>
          <div className="hero-art" aria-hidden="true">
            <div className="paper-sheet"><div className="paper-top"><span>COLLEGE NOTICE</span><span className="paper-stamp">PDF</span></div><div className="paper-lines"><i /><i /><i /><i /><i /></div><div className="paper-highlight"><CheckCircle2 size={14} /> Key dates + next steps</div><div className="paper-lines short"><i /><i /></div></div>
            <div className="annotation note-one"><span className="annotation-dot" /> dates &amp; deadlines</div><div className="annotation note-two"><CheckCircle2 size={15} /> summary · actions · details</div>
            <span className="art-spark spark-one">✳</span><span className="art-spark spark-two">✳</span>
          </div>
          <div className="hero-index">01 <span>/</span> 03</div>
        </section>

        <section className="workspace" id="workspace">
          <div className="workspace-heading"><div><span className="eyebrow">YOUR DOCUMENT DESK</span><h2>Let's untangle it.</h2></div>{analysis && <button className="reset-button" type="button" onClick={reset}><RotateCcw size={15} /> Start over</button>}</div>
          <div className="workspace-grid">
            <div className="upload-column">
              <UploadPanel file={file} onFile={(nextFile) => { setFile(nextFile); setAnalysis(null); setError(""); setMessages([]); }} onAnalyze={simplifyDocument} busy={processing} />
              {processing && <div className="processing-state" role="status"><span className="processing-orbit"><span /></span><div><strong>Making sense of the fine print</strong><p>Reading each page, then asking your local AI for the essentials.</p></div></div>}
              {error && <div className="error-banner" role="alert"><strong>We hit a snag</strong><p>{error}</p></div>}
              {!analysis && !processing && !error && <div className="how-note"><span className="how-number">02</span><div><strong>Text stays close to home.</strong><p>PDF text is extracted in your browser. It goes to the AI server you configure, not to a third-party AI provider.</p></div></div>}
            </div>
            <div className="results-column">
              {!analysis && !processing && <div className="results-empty"><div className="empty-illustration"><span className="empty-sheet"><i /><i /><i /></span><span className="empty-spark">✳</span></div><span className="eyebrow">YOUR CLARITY, RIGHT HERE</span><h3>Good to go when you are.</h3><p>Your summary, next steps, and important dates will show up here once a PDF is processed.</p><span className="empty-step"><span>01</span> Choose a document <ArrowRight size={13} /><span>02</span> Get the essentials</span></div>}
              {analysis && <>
                <div className="document-bar"><div className="document-label"><FileCheck2 size={17} /><span><strong>{file?.name}</strong><small>{pageCount} {pageCount === 1 ? "page" : "pages"} read{truncated ? " · text shortened for analysis" : ""}</small></span></div><span className="ready-badge"><span /> Simplified</span></div>
                {truncated && <p className="truncated-note">This is a long document. Only the first 60,000 characters were sent for analysis.</p>}
                <AnalysisResults analysis={analysis} completedItems={completedItems} onToggleAction={toggleAction} />
                <AskPanel messages={messages} onAsk={askQuestion} disabled={!extractedText} busy={asking} />
              </>}
            </div>
          </div>
        </section>
      </main>
      <footer className="footer"><span>PDF Simplifier <span className="footer-dot">·</span> Built for clearer college days</span><span>Always double-check critical dates in the original notice.</span></footer>
    </div>
  );
}
