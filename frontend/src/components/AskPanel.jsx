import { LoaderCircle, MessageCircleQuestion, Send } from "lucide-react";
import { useState } from "react";

const suggestions = ["When is the deadline?", "Do I need to submit anything?", "What should I bring?"];

export default function AskPanel({ messages, onAsk, disabled, busy }) {
  const [question, setQuestion] = useState("");

  async function submit(event) {
    event.preventDefault();
    const current = question.trim();
    if (!current || busy || disabled) return;
    setQuestion("");
    await onAsk(current);
  }

  return (
    <section className="ask-card" aria-labelledby="ask-heading">
      <div className="ask-header"><div className="ask-heading-icon"><MessageCircleQuestion size={20} /></div><div><span className="section-label">GOT A QUESTION?</span><h2 id="ask-heading">Ask the PDF</h2><p>Answers are based on the document you shared.</p></div></div>
      {messages.length > 0 && <div className="conversation" aria-live="polite">{messages.map((message, index) => <div className={`message ${message.role}`} key={`${message.role}-${index}`}><span className="message-label">{message.role === "user" ? "YOU ASKED" : "FROM YOUR PDF"}</span><p>{message.content}</p></div>)}</div>}
      {messages.length === 0 && <div className="suggestion-row">{suggestions.map((suggestion) => <button type="button" className="suggestion-chip" key={suggestion} disabled={disabled || busy} onClick={() => { setQuestion(suggestion); }}>{suggestion}</button>)}</div>}
      <form className="ask-form" onSubmit={submit}>
        <label className="visually-hidden" htmlFor="pdf-question">Ask a question about this PDF</label>
        <input id="pdf-question" value={question} onChange={(event) => setQuestion(event.target.value)} placeholder={disabled ? "Simplify a PDF to ask a question" : "Ask something about your PDF..."} maxLength={1000} disabled={disabled || busy} />
        <button type="submit" className="send-button" aria-label="Send question" disabled={disabled || busy || !question.trim()}>{busy ? <LoaderCircle className="spin" size={18} /> : <Send size={18} />}</button>
      </form>
      <p className="ask-footnote">The AI may miss details. Check important information in the original PDF.</p>
    </section>
  );
}
