import { useState, useEffect } from "react";

const API = "http://localhost:8000";

const STATUSES = [
  { key: "Submitted",    label: "Submitted",     color: "#1565c0", bg: "#e3f2fd", dot: "#1565c0" },
  { key: "Under Review", label: "Under Review",  color: "#e65100", bg: "#fff3e0", dot: "#e65100" },
  { key: "For Revision", label: "For Revision",  color: "#6a1b9a", bg: "#f3e5f5", dot: "#6a1b9a" },
  { key: "Approved",     label: "Approved",      color: "#2e7d32", bg: "#e8f5e9", dot: "#2e7d32" },
  { key: "Rejected",     label: "Rejected",      color: "#c62828", bg: "#ffebee", dot: "#c62828" },
];

const STATUS_ORDER = ["Submitted", "Under Review", "For Revision", "Approved", "Rejected"];

// ── Shared UI ─────────────────────────────────────────────────────────────────
const iStyle = {
  width: "100%", background: "#f9f9f9", border: "1.5px solid #e0e0e0", borderRadius: 3,
  padding: "9px 11px", fontFamily: "'Barlow',sans-serif", fontSize: 13, color: "#0d0d0d",
  outline: "none", appearance: "none",
};

const overlay  = { position: "fixed", inset: 0, background: "rgba(0,0,0,.6)",
  display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 };
const modalBox = { background: "#fff", borderRadius: 6, width: "92%", maxWidth: 560,
  maxHeight: "88vh", boxShadow: "0 24px 72px rgba(0,0,0,.35)", display: "flex", flexDirection: "column" };
const mHead    = { padding: "16px 24px", borderBottom: "1px solid #e0e0e0",
  display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 };
const mTitle   = { fontFamily: "'Barlow Condensed',sans-serif", fontSize: 18, fontWeight: 800, color: "#0d0d0d" };
const closeBtn = { background: "none", border: "none", fontSize: 16, cursor: "pointer", color: "#9e9e9e", padding: "2px 6px" };
const btnPri   = { background: "#F5C400", color: "#0d0d0d", border: "none", padding: "9px 22px",
  fontFamily: "'Barlow Condensed',sans-serif", fontSize: 12, fontWeight: 800,
  letterSpacing: "2px", textTransform: "uppercase", cursor: "pointer", borderRadius: 2 };
const btnSec   = { background: "#fff", color: "#5a5a5a", border: "1.5px solid #e0e0e0",
  padding: "8px 18px", fontFamily: "'Barlow',sans-serif", fontSize: 12, cursor: "pointer", borderRadius: 2 };

const StatusBadge = ({ s }) => {
  const cfg = STATUSES.find(x => x.key === s) || STATUSES[0];
  return (
    <span style={{ background: cfg.bg, color: cfg.color, fontSize: 10, fontWeight: 700,
      padding: "3px 10px", borderRadius: 10, whiteSpace: "nowrap", letterSpacing: "0.5px" }}>
      {cfg.label}
    </span>
  );
};

// ── Timeline stepper inside modal ─────────────────────────────────────────────
function StatusTimeline({ current }) {
  const steps = ["Submitted", "Under Review", "For Revision", "Approved"];
  const currentIdx = steps.indexOf(current);
  const isRejected = current === "Rejected";

  return (
    <div style={{ padding: "18px 0 10px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", position: "relative" }}>
        {/* connector line */}
        <div style={{ position: "absolute", top: 14, left: 0, right: 0, height: 2,
          background: "#e0e0e0", zIndex: 0 }} />

        {steps.map((step, i) => {
          const done    = !isRejected && i <= currentIdx;
          const active  = !isRejected && i === currentIdx;
          const cfg     = STATUSES.find(x => x.key === step);
          return (
            <div key={step} style={{ display: "flex", flexDirection: "column",
              alignItems: "center", flex: 1, position: "relative", zIndex: 1 }}>
              <div style={{
                width: 28, height: 28, borderRadius: "50%",
                background: done ? (active ? cfg.color : "#2e7d32") : "#e0e0e0",
                border: active ? `3px solid ${cfg.color}` : "3px solid transparent",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 12, color: done ? "#fff" : "#9e9e9e",
                boxShadow: active ? `0 0 0 4px ${cfg.bg}` : "none",
                transition: "all .3s",
              }}>
                {done && !active ? "✓" : i + 1}
              </div>
              <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "1px",
                textTransform: "uppercase", color: done ? (active ? cfg.color : "#2e7d32") : "#9e9e9e",
                marginTop: 6, textAlign: "center", lineHeight: 1.3 }}>
                {step.replace(" ", "\n")}
              </div>
            </div>
          );
        })}

        {/* Rejected indicator */}
        {isRejected && (
          <div style={{ position: "absolute", right: -8, top: -4,
            background: "#ffebee", border: "2px solid #c62828",
            borderRadius: 4, padding: "2px 8px",
            fontSize: 10, fontWeight: 800, color: "#c62828", letterSpacing: "1px" }}>
            REJECTED
          </div>
        )}
      </div>
    </div>
  );
}

// ── Remarks Modal ─────────────────────────────────────────────────────────────
function RemarksModal({ r, onClose, onSaved }) {
  const [status,  setStatus]  = useState(r.tracking_status || "Submitted");
  const [remarks, setRemarks] = useState(r.remarks || "");
  const [saving,  setSaving]  = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/evaluations/${r.re_id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tracking_status: status, remarks }),
      });
      if (!res.ok) throw new Error("Failed to update");
      onSaved(await res.json());
    } catch (_) { /* ignore */ }
    finally { setSaving(false); }
  };

  return (
    <div style={overlay}>
      <div style={modalBox}>
        <div style={mHead}>
          <span style={mTitle}>Update Status — RE-{r.re_id}</span>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>
        <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>

          {/* Timeline */}
          <StatusTimeline current={status} />

          <div style={{ height: 1, background: "#f0f0f0", margin: "16px 0" }} />

          {/* Status selector */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 9, fontWeight: 700,
              letterSpacing: "2px", textTransform: "uppercase", color: "#5a5a5a", marginBottom: 8 }}>
              Set Status
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {STATUSES.map(cfg => (
                <button key={cfg.key} onClick={() => setStatus(cfg.key)} style={{
                  padding: "6px 14px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                  cursor: "pointer", transition: "all .15s", letterSpacing: "0.5px",
                  border: status === cfg.key ? `2px solid ${cfg.color}` : "2px solid #e0e0e0",
                  background: status === cfg.key ? cfg.bg : "#fff",
                  color: status === cfg.key ? cfg.color : "#9e9e9e",
                }}>
                  {cfg.label}
                </button>
              ))}
            </div>
          </div>

          {/* Remarks */}
          <div>
            <label style={{ display: "block", fontSize: 9, fontWeight: 700,
              letterSpacing: "2px", textTransform: "uppercase", color: "#5a5a5a", marginBottom: 8 }}>
              Remarks / Notes
            </label>
            <textarea
              value={remarks}
              onChange={e => setRemarks(e.target.value)}
              rows={4}
              placeholder="Add reviewer remarks, revision notes, or approval comments…"
              style={{ ...iStyle, resize: "vertical", lineHeight: 1.6, minHeight: 96 }}
            />
          </div>
        </div>
        <div style={{ padding: "13px 24px", borderTop: "1px solid #e0e0e0",
          display: "flex", gap: 10, justifyContent: "flex-end", flexShrink: 0 }}>
          <button onClick={onClose} style={btnSec}>Cancel</button>
          <button onClick={save} disabled={saving} style={btnPri}>
            {saving ? "Saving…" : "Update Status"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Detail Modal (view full record + timeline) ────────────────────────────────
function DetailModal({ r, onClose }) {
  const VF = ({ label, value }) => value ? (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "2px",
        textTransform: "uppercase", color: "#9e9e9e" }}>{label}</div>
      <div style={{ fontSize: 14, color: "#0d0d0d", marginTop: 3 }}>{value}</div>
    </div>
  ) : null;

  return (
    <div style={overlay}>
      <div style={{ ...modalBox, maxWidth: 620 }}>
        <div style={mHead}>
          <span style={mTitle}>RE-{r.re_id} — Tracking Detail</span>
          <button onClick={onClose} style={closeBtn}>✕</button>
        </div>
        <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>

          {/* Status timeline */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "2px",
              textTransform: "uppercase", color: "#9e9e9e", marginBottom: 8 }}>
              Current Status
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <StatusBadge s={r.tracking_status || "Submitted"} />
              {r.remarks && (
                <span style={{ fontSize: 12, color: "#5a5a5a", fontStyle: "italic" }}>
                  "{r.remarks}"
                </span>
              )}
            </div>
            <StatusTimeline current={r.tracking_status || "Submitted"} />
          </div>

          <div style={{ height: 1, background: "#f0f0f0", margin: "16px 0" }} />

          <VF label="Title of Research" value={r.title_of_research} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <VF label="School Year" value={r.school_year_id} />
            <VF label="Semester"    value={r.semester_id} />
          </div>
          <VF label="Author(s)"  value={r.author_id} />
          <VF label="Campus"     value={r.campus_id} />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <VF label="College"    value={r.college_id} />
            <VF label="Department" value={r.department_id} />
          </div>

          {r.remarks && (
            <>
              <div style={{ height: 1, background: "#f0f0f0", margin: "16px 0" }} />
              <VF label="Reviewer Remarks" value={r.remarks} />
            </>
          )}
        </div>
        <div style={{ padding: "12px 24px", borderTop: "1px solid #e0e0e0", flexShrink: 0 }}>
          <button onClick={onClose} style={btnSec}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ── Main Tracking Dashboard ───────────────────────────────────────────────────
export default function EvaluationTracking({ onNavigate }) {
  const [records,  setRecords]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [filterS,  setFilterS]  = useState("");
  const [viewing,  setViewing]  = useState(null);
  const [editing,  setEditing]  = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try { setRecords(await (await fetch(`${API}/evaluations`)).json()); }
    catch (_) { setRecords([]); }
    setLoading(false);
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = records.filter(r => {
    const q  = search.toLowerCase();
    const ms = !q ||
      r.title_of_research?.toLowerCase().includes(q) ||
      r.author_id?.toLowerCase().includes(q) ||
      r.college_id?.toLowerCase().includes(q);
    const mf = !filterS || (r.tracking_status || "Submitted") === filterS;
    return ms && mf;
  });

  // Counts per status
  const counts = STATUSES.reduce((acc, s) => {
    acc[s.key] = records.filter(r => (r.tracking_status || "Submitted") === s.key).length;
    return acc;
  }, {});

  const td = { padding: "11px 14px", verticalAlign: "middle" };

  return (
    <div style={{ minHeight: "100%", background: "#f5f5f5" }}>

      {/* ── Header ── */}
      <div style={{ background: "#0d0d0d", padding: "24px 40px", borderBottom: "3px solid #F5C400",
        display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontFamily: "'Barlow Condensed',sans-serif", color: "#F5C400",
            fontSize: 9, fontWeight: 700, letterSpacing: "3px", textTransform: "uppercase",
            opacity: .7, marginBottom: 4 }}>Research Evaluation</div>
          <h1 style={{ fontFamily: "'Barlow Condensed',sans-serif", color: "#fff",
            fontSize: 32, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.5px",
            display: "flex", alignItems: "center", gap: 12 }}>
            Evaluation Tracking
            <span style={{ background: "#F5C400", color: "#0d0d0d", fontSize: 11,
              fontWeight: 800, padding: "2px 10px", borderRadius: 2 }}>
              {records.length}
            </span>
          </h1>
        </div>
        <button onClick={() => onNavigate("eval-form")} style={btnPri}>+ Submit New</button>
      </div>

      {/* ── Status Summary Cards ── */}
      <div style={{ padding: "20px 40px 0" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 12, marginBottom: 20 }}>
          {STATUSES.map(cfg => (
            <button key={cfg.key} onClick={() => setFilterS(filterS === cfg.key ? "" : cfg.key)}
              style={{
                background: filterS === cfg.key ? cfg.bg : "#fff",
                border: filterS === cfg.key ? `2px solid ${cfg.color}` : "1.5px solid #e0e0e0",
                borderRadius: 6, padding: "14px 16px", cursor: "pointer", textAlign: "left",
                transition: "all .15s", boxShadow: filterS === cfg.key ? `0 2px 12px ${cfg.bg}` : "none",
              }}>
              <div style={{ fontSize: 22, fontWeight: 900, fontFamily: "'Barlow Condensed',sans-serif",
                color: cfg.color, lineHeight: 1 }}>{counts[cfg.key] || 0}</div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "1.5px",
                textTransform: "uppercase", color: filterS === cfg.key ? cfg.color : "#9e9e9e",
                marginTop: 4 }}>{cfg.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* ── Filters ── */}
      <div style={{ padding: "0 40px 16px", display: "flex", gap: 12, alignItems: "center" }}>
        <input type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by title, author, or college…"
          style={{ ...iStyle, maxWidth: 360, background: "#fff" }} />
        <div style={{ position: "relative" }}>
          <select value={filterS} onChange={e => setFilterS(e.target.value)}
            style={{ ...iStyle, width: 180, background: "#fff" }}>
            <option value="">All Statuses</option>
            {STATUSES.map(s => <option key={s.key}>{s.key}</option>)}
          </select>
          <span style={{ position: "absolute", right: 9, top: "50%",
            transform: "translateY(-50%)", pointerEvents: "none", color: "#9e9e9e" }}>▾</span>
        </div>
        {(search || filterS) && (
          <button onClick={() => { setSearch(""); setFilterS(""); }}
            style={{ ...btnSec, fontSize: 12 }}>Clear</button>
        )}
      </div>

      {/* ── Table ── */}
      <div style={{ padding: "0 40px 40px" }}>
        <div style={{ background: "#fff", borderRadius: 4, border: "1px solid #e0e0e0", overflow: "auto" }}>
          {loading ? (
            <div style={{ padding: 48, textAlign: "center", color: "#9e9e9e" }}>Loading records…</div>
          ) : filtered.length === 0 ? (
            <div style={{ padding: 64, textAlign: "center" }}>
              <div style={{ fontSize: 32, marginBottom: 12 }}>📡</div>
              <div style={{ fontSize: 15, fontWeight: 600 }}>No records found</div>
              <div style={{ fontSize: 13, color: "#9e9e9e", marginTop: 6 }}>
                {records.length === 0
                  ? "Submit your first evaluation to start tracking."
                  : "Try adjusting your search or filters."}
              </div>
              {records.length === 0 && (
                <button onClick={() => onNavigate("eval-form")}
                  style={{ ...btnPri, marginTop: 20 }}>+ Submit Evaluation</button>
              )}
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, minWidth: 860 }}>
              <thead>
                <tr style={{ background: "#f9f9f9", borderBottom: "1.5px solid #e0e0e0" }}>
                  {["ID", "Title", "Author(s)", "College", "Year / Sem", "Status", "Remarks", "Actions"].map(h => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 9,
                      fontWeight: 700, letterSpacing: "1.5px", textTransform: "uppercase",
                      color: "#9e9e9e", whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(r => {
                  const status = r.tracking_status || "Submitted";
                  const cfg    = STATUSES.find(s => s.key === status) || STATUSES[0];
                  return (
                    <tr key={r.re_id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                      <td style={td}>
                        <span style={{ fontFamily: "'Barlow Condensed',sans-serif",
                          fontWeight: 800, color: "#F5C400", fontSize: 13,
                          background: "#0d0d0d", padding: "2px 7px", borderRadius: 2 }}>
                          RE-{r.re_id}
                        </span>
                      </td>
                      <td style={{ ...td, maxWidth: 220 }}>
                        <div style={{ fontWeight: 600, color: "#0d0d0d", overflow: "hidden",
                          textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.title_of_research}>
                          {r.title_of_research}
                        </div>
                        <div style={{ fontSize: 11, color: "#9e9e9e", marginTop: 2 }}>
                          {r.campus_id?.includes("QC") ? "TIP-QC" : "TIP-Manila"}
                        </div>
                      </td>
                      <td style={{ ...td, maxWidth: 150 }}>
                        <div style={{ fontSize: 12, color: "#5a5a5a", overflow: "hidden",
                          textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={r.author_id}>
                          {r.author_id}
                        </div>
                      </td>
                      <td style={{ ...td, maxWidth: 160 }}>
                        <div style={{ fontSize: 11, color: "#5a5a5a", overflow: "hidden",
                          textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.college_id}</div>
                      </td>
                      <td style={td}>
                        <div style={{ fontSize: 12, color: "#5a5a5a" }}>{r.school_year_id}</div>
                        <div style={{ fontSize: 11, color: "#9e9e9e" }}>{r.semester_id}</div>
                      </td>
                      <td style={td}>
                        {/* Mini progress bar */}
                        <div style={{ marginBottom: 5 }}>
                          <StatusBadge s={status} />
                        </div>
                        {status !== "Rejected" && (
                          <div style={{ display: "flex", gap: 3 }}>
                            {["Submitted", "Under Review", "For Revision", "Approved"].map((step, i) => {
                              const idx = ["Submitted","Under Review","For Revision","Approved"].indexOf(status);
                              const filled = i <= idx;
                              const sc = STATUSES.find(x => x.key === step);
                              return (
                                <div key={step} style={{
                                  flex: 1, height: 3, borderRadius: 2,
                                  background: filled ? sc.color : "#e0e0e0",
                                  transition: "background .3s",
                                }} />
                              );
                            })}
                          </div>
                        )}
                      </td>
                      <td style={{ ...td, maxWidth: 160 }}>
                        {r.remarks ? (
                          <div style={{ fontSize: 11, color: "#5a5a5a", overflow: "hidden",
                            textOverflow: "ellipsis", whiteSpace: "nowrap",
                            fontStyle: "italic" }} title={r.remarks}>
                            "{r.remarks}"
                          </div>
                        ) : (
                          <span style={{ fontSize: 11, color: "#ccc" }}>—</span>
                        )}
                      </td>
                      <td style={td}>
                        <div style={{ display: "flex", gap: 5 }}>
                          <button onClick={() => setViewing(r)} title="View Detail"
                            style={{ border: "none", padding: "5px 8px", borderRadius: 3,
                              cursor: "pointer", fontSize: 13, lineHeight: 1,
                              background: "#e3f2fd", color: "#1565c0" }}>👁</button>
                          <button onClick={() => setEditing(r)} title="Update Status"
                            style={{ border: "none", padding: "5px 8px", borderRadius: 3,
                              cursor: "pointer", fontSize: 13, lineHeight: 1,
                              background: "#fff8e1", color: "#f9a825" }}>✏️</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        {filtered.length > 0 && (
          <div style={{ marginTop: 10, fontSize: 12, color: "#9e9e9e" }}>
            Showing {filtered.length} of {records.length} record{records.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {viewing && (
        <DetailModal r={viewing} onClose={() => setViewing(null)} />
      )}
      {editing && (
        <RemarksModal r={editing} onClose={() => setEditing(null)}
          onSaved={updated => {
            setRecords(rs => rs.map(r => r.re_id === updated.re_id ? updated : r));
            setEditing(null);
          }} />
      )}
    </div>
  );
}