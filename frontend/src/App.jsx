import { useState } from "react";
import ResearchEvaluation  from "./ResearchEvaluation";
import EvaluationDashboard from "./EvaluationDashboard";
import ResearchDatabase    from "./ResearchDatabase";
import ResearchDashboard   from "./DatabaseDashboard";

const NAV = [
  {
    section: "Research Evaluation",
    items: [
      { key: "eval-form",      label: "Submit Evaluation", icon: "📝" },
      { key: "eval-dashboard", label: "Evaluation Records", icon: "📋" },
    ],
  },
  {
    section: "Research Database",
    items: [
      { key: "db-form",      label: "Submit Research", icon: "📝" },
      { key: "db-dashboard", label: "Research Records", icon: "📋" },
    ],
  },
];

export default function App() {
  const [page, setPage] = useState("eval-form");

  const renderPage = () => {
    if (page === "eval-form")      return <ResearchEvaluation  onNavigate={setPage} />;
    if (page === "eval-dashboard") return <EvaluationDashboard onNavigate={setPage} />;
    if (page === "db-form")        return <ResearchDatabase    onNavigate={setPage} />;
    if (page === "db-dashboard")   return <ResearchDashboard   onNavigate={setPage} />;
    return null;
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Barlow:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; width: 100%; }
        body { font-family: 'Barlow', sans-serif; background: #0d0d0d; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }
        input:focus, textarea:focus, select:focus {
          border-color: #F5C400 !important; outline: none;
          box-shadow: 0 0 0 3px rgba(245,196,0,.1);
        }
      `}</style>

      <div style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        overflow: "hidden",
      }}>

        {/* ── SIDEBAR ── */}
        <aside style={{
          width: 190,
          minWidth: 190,
          maxWidth: 190,
          flexShrink: 0,
          background: "#0d0d0d",
          display: "flex",
          flexDirection: "column",
          borderRight: "1px solid rgba(255,255,255,0.07)",
          overflowY: "auto",
        }}>
          {/* Brand */}
          <div style={{ padding: "22px 18px 16px" }}>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              color: "#F5C400", fontSize: 9, fontWeight: 700,
              letterSpacing: "2.5px", textTransform: "uppercase", opacity: 0.6,
            }}>TIP · Scholar Sphere</div>
            <div style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              color: "#F5C400", fontSize: 22, fontWeight: 900,
              lineHeight: 1.1, marginTop: 5, textTransform: "uppercase",
            }}>Research<br />Portal</div>
          </div>

          <div style={{ height: 1, background: "rgba(255,255,255,0.07)", margin: "0 18px" }} />

          {/* Nav */}
          <nav style={{ padding: "12px 8px", flex: 1 }}>
            {NAV.map(({ section, items }) => (
              <div key={section} style={{ marginBottom: 20 }}>
                <div style={{
                  fontSize: 8, fontWeight: 700, letterSpacing: "2px",
                  textTransform: "uppercase", color: "rgba(255,255,255,0.22)",
                  padding: "0 10px", marginBottom: 4,
                }}>{section}</div>
                {items.map(({ key, label, icon }) => {
                  const active = page === key;
                  return (
                    <button key={key} onClick={() => setPage(key)} style={{
                      display: "flex", alignItems: "center", gap: 8,
                      width: "100%", padding: "8px 10px", border: "none",
                      borderRadius: 4, cursor: "pointer", textAlign: "left",
                      marginBottom: 2,
                      background: active ? "rgba(245,196,0,0.12)" : "transparent",
                      color: active ? "#F5C400" : "rgba(255,255,255,0.4)",
                      fontSize: 12, fontWeight: active ? 600 : 400,
                      transition: "all .15s",
                    }}>
                      <span style={{ fontSize: 12 }}>{icon}</span>
                      <span style={{ flex: 1 }}>{label}</span>
                      {active && (
                        <span style={{
                          width: 4, height: 4, borderRadius: "50%", background: "#F5C400",
                        }} />
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Footer */}
          <div style={{
            padding: "12px 18px", borderTop: "1px solid rgba(255,255,255,0.07)",
            fontSize: 9, color: "rgba(255,255,255,0.18)", letterSpacing: "0.5px",
          }}>
            Scholar Sphere v1.0
          </div>
        </aside>

        {/* ── MAIN ── */}
        <main style={{
          flex: 1,
          minWidth: 0,
          overflowY: "auto",
          background: "#f5f5f5",
        }}>
          {renderPage()}
        </main>

      </div>
    </>
  );
}