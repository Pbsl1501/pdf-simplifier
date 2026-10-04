import { AlertTriangle, CalendarDays, Check, Circle, ListChecks, Sparkles } from "lucide-react";

export default function AnalysisResults({ analysis, completedItems, onToggleAction }) {
  return (
    <div className="results-layout" aria-live="polite">
      <section className="summary-card result-card">
        <div className="result-heading"><div className="result-icon mint"><Sparkles size={18} /></div><div><span className="section-label">THE SHORT VERSION</span><h2>Quick summary</h2></div></div>
        <p className="summary-text">{analysis.summary}</p>
      </section>

      <section className="action-card result-card">
        <div className="action-topline"><div className="result-heading"><div className="result-icon coral"><ListChecks size={19} /></div><div><span className="section-label">YOUR NEXT MOVES</span><h2>What do I need to do?</h2></div></div>
          {analysis.actionItems.length > 0 && <span className="progress-count">{completedItems.size}/{analysis.actionItems.length} done</span>}
        </div>
        {analysis.actionItems.length ? (
          <ul className="action-list">
            {analysis.actionItems.map((item, index) => {
              const done = completedItems.has(index);
              return <li key={`${item}-${index}`}><button className={`check-item${done ? " is-done" : ""}`} type="button" onClick={() => onToggleAction(index)} aria-pressed={done}><span className="checkbox-mark">{done && <Check size={14} strokeWidth={3} />}</span><span>{item}</span></button></li>;
            })}
          </ul>
        ) : <p className="empty-copy"><Circle size={15} /> No clear action items were identified in this document.</p>}
      </section>

      <section className="result-card points-card">
        <div className="result-heading"><div className="result-icon blue"><ListChecks size={18} /></div><div><span className="section-label">KEEP IN MIND</span><h2>Important points</h2></div></div>
        <BulletList items={analysis.importantPoints} empty="No additional key points were identified." />
      </section>

      <section className="result-card dates-card">
        <div className="result-heading"><div className="result-icon yellow"><CalendarDays size={18} /></div><div><span className="section-label">MARK YOUR CALENDAR</span><h2>Important dates</h2></div></div>
        {analysis.importantDates.length ? <ul className="date-list">{analysis.importantDates.map((date, index) => <li key={`${date.date}-${index}`}><span className="date-pill">{date.date}</span><div><strong>{date.event}</strong>{date.context && <p>{date.context}</p>}</div></li>)}</ul> : <p className="empty-copy">No specific dates were identified.</p>}
      </section>

      <section className="result-card warning-card">
        <div className="result-heading"><div className="result-icon warning"><AlertTriangle size={18} /></div><div><span className="section-label">READ THE FINE PRINT</span><h2>Worth a second look</h2></div></div>
        <BulletList items={analysis.warnings} empty="No specific warnings were identified. Still, check the original document before acting." />
      </section>
    </div>
  );
}

function BulletList({ items, empty }) {
  if (!items.length) return <p className="empty-copy">{empty}</p>;
  return <ul className="bullet-list">{items.map((item, index) => <li key={`${item}-${index}`}>{item}</li>)}</ul>;
}
