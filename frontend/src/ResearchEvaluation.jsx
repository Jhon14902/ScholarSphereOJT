import { useState } from "react";

const API = "http://localhost:8000";

const CAMPUSES     = ["TIP-QC (Quezon City)", "TIP-Manila"];
const SCHOOL_YEARS = ["2021-2022","2022-2023","2023-2024","2024-2025","2025-2026"];
const SEMESTERS    = ["1st Semester","2nd Semester","Summer"];
const COLLEGES     = [
  "College of Engineering and Architecture",
  "College of Computer Studies",
  "College of Business Education",
  "College of Arts",
  "Graduate",
  "College of Education",
];
const DEPTS = {
  "College of Engineering and Architecture": [
    "Architecture (BS Arch)","Chemical Engineering (BSChE)","Civil Engineering (BSCE)",
    "Computer Engineering (BSCpE)","Electrical Engineering (BSEE)",
    "Electronics Engineering (BSECE)","Environmental and Sanitary Engineering (BSEnSE)",
    "Industrial Engineering (BSIE)","Mechanical Engineering (BSME)",
  ],
  "College of Computer Studies": [
    "Computer Science (BSCS)","Information Systems (BSIS)",
    "Information Technology (BSIT)","Data Science and Analytics (BSDSA)",
  ],
  "College of Business Education": ["Business Administration (BSBA)","Accountancy (BSA)"],
  "College of Arts": ["Arts in Communication (BA Comm)"],
  "Graduate": [
    "Information Technology (MIT)","Science in Computer Science (MSCS)",
    "Information Systems (MSIS)","Engineering - Civil Engineering (MCE)",
    "Engineering - Electronics Engineering (MECE)",
    "Engineering Management","Logistics Management","Supply Chain Management",
  ],
  "College of Education": ["Secondary Education (BSEd)","Teaching Certificate Program (TCP)"],
};

const REFERENCES = {
  authorship_form: {
    url: "https://docs.google.com/document/d/1uWv9hi7OQvMKSnCm1xSE49EErp-XilQ9LY3TcObuIb8/edit?tab=t.0",
  },
  evaluation_form: {
    url: "https://drive.google.com/file/d/1aR5LN-rDMRFgVKqfucWjOEmZw1jCesVN/view",
  },
};

const ACCEPTED = ".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png";

const REQUIRED_TEXT = [
  ["author_id","Author(s)"],["campus_id","Campus"],["college_id","College"],
  ["department_id","Department"],["school_year_id","School Year"],
  ["semester_id","Semester"],["title_of_research","Title of Research"],
];

const FILE_FIELDS = [
  "authorship_form","evaluation_form","full_paper",
  "turnitin_report","grammarly_report","journal_conference_info",
];

// ── Shared UI ─────────────────────────────────────────────────────────────────
const iStyle = {
  width:"100%", background:"#fff", border:"1.5px solid #e0e0e0", borderRadius:4,
  padding:"10px 13px", fontFamily:"'Barlow',sans-serif", fontSize:14, color:"#0d0d0d",
  outline:"none", appearance:"none", transition:"border-color .15s",
};
const Input = (p) => <input style={iStyle} {...p} />;
const Lbl   = ({ t, req }) => (
  <label style={{ display:"block", fontSize:10, fontWeight:700, letterSpacing:"2px",
    textTransform:"uppercase", color:"#5a5a5a", marginBottom:6 }}>
    {t}{req && <span style={{ color:"#d4a900" }}> *</span>}
  </label>
);
const Sel   = ({ val, onChange, opts, placeholder, disabled }) => (
  <div style={{ position:"relative" }}>
    <select value={val} onChange={onChange} disabled={disabled} style={iStyle}>
      <option value="">{placeholder}</option>
      {opts.map(o => <option key={o}>{o}</option>)}
    </select>
    <span style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
      pointerEvents:"none", color:"#9e9e9e" }}>▾</span>
  </div>
);
const F     = ({ label, req, children }) => (
  <div style={{ marginBottom:16 }}><Lbl t={label} req={req} />{children}</div>
);
const Row   = ({ children, cols=2 }) => (
  <div style={{ display:"grid", gridTemplateColumns:`repeat(${cols},1fr)`, gap:16 }}>
    {children}
  </div>
);

// ── Section wrapper ───────────────────────────────────────────────────────────
const Section = ({ title, children }) => (
  <div style={{
    background:"#fff", borderRadius:6, border:"1px solid #e8e8e8",
    marginBottom:16, overflow:"hidden",
  }}>
    <div style={{
      background:"#0d0d0d", padding:"10px 20px",
      fontFamily:"'Barlow Condensed',sans-serif", fontSize:11, fontWeight:700,
      letterSpacing:"3px", textTransform:"uppercase", color:"#F5C400",
    }}>{title}</div>
    <div style={{ padding:"20px 20px 4px" }}>{children}</div>
  </div>
);

// ── Author Tag Input ──────────────────────────────────────────────────────────
function AuthorInput({ value, onChange }) {
  const [input, setInput] = useState("");
  const authors = value ? value.split(",").map(a => a.trim()).filter(Boolean) : [];

  const add = () => {
    const t = input.trim();
    if (!t) return;
    onChange([...authors, t].join(", "));
    setInput("");
  };
  const remove = (idx) => onChange(authors.filter((_, i) => i !== idx).join(", "));

  return (
    <div>
      {authors.length > 0 && (
        <div style={{ display:"flex", flexWrap:"wrap", gap:6, marginBottom:8 }}>
          {authors.map((a, i) => (
            <span key={i} style={{ background:"#fff8e1", color:"#d4a900", fontSize:12,
              fontWeight:600, padding:"4px 10px", borderRadius:12,
              display:"flex", alignItems:"center", gap:6, border:"1px solid #f5c40044" }}>
              {a}
              <button onClick={() => remove(i)} style={{ background:"none", border:"none",
                cursor:"pointer", color:"#d4a900", fontSize:14, lineHeight:1, padding:0 }}>×</button>
            </span>
          ))}
        </div>
      )}
      <div style={{ display:"flex", gap:8 }}>
        <Input type="text" value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key==="Enter"||e.key===","){e.preventDefault();add();} }}
          placeholder="Type author name and press Enter…" />
        <button onClick={add} style={{ background:"#F5C400", color:"#0d0d0d", border:"none",
          padding:"0 18px", fontFamily:"'Barlow Condensed',sans-serif", fontSize:12,
          fontWeight:800, letterSpacing:"1px", textTransform:"uppercase",
          cursor:"pointer", borderRadius:4, whiteSpace:"nowrap" }}>Add</button>
      </div>
      <div style={{ fontSize:11, color:"#9e9e9e", marginTop:5 }}>
        Press Enter or click Add for each author.
      </div>
    </div>
  );
}

// ── File Upload Field ─────────────────────────────────────────────────────────
function FileUploadField({ label, fieldKey, file, onFileChange, referenceUrl }) {
  const hasFile = Boolean(file);
  return (
    <div style={{ marginBottom:16 }}>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:6 }}>
        <Lbl t={label} req />
        {referenceUrl && (
          <a href={referenceUrl} target="_blank" rel="noreferrer" style={{
            fontSize:10, color:"#1565c0", textDecoration:"none", fontWeight:600,
            display:"flex", alignItems:"center", gap:4,
            border:"1px solid #bbdefb", borderRadius:3, padding:"2px 8px",
            background:"#e3f2fd", whiteSpace:"nowrap",
          }}>📄 View Template</a>
        )}
      </div>
      <label style={{
        display:"flex", alignItems:"center", gap:12, padding:"12px 16px",
        border:`2px dashed ${hasFile ? "#F5C400" : "#e0e0e0"}`,
        borderRadius:4, background: hasFile ? "#fffbea" : "#fafafa",
        cursor:"pointer", transition:"all .15s",
      }}>
        <input type="file" accept={ACCEPTED} style={{ display:"none" }}
          onChange={e => onFileChange(fieldKey, e.target.files[0] || null)} />
        <span style={{ fontSize:20, opacity: hasFile ? 1 : 0.3 }}>
          {hasFile ? "✅" : "📁"}
        </span>
        <div style={{ flex:1, minWidth:0 }}>
          {hasFile ? (
            <>
              <div style={{ fontSize:13, fontWeight:600, color:"#0d0d0d",
                overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {file.name}
              </div>
              <div style={{ fontSize:11, color:"#9e9e9e", marginTop:2 }}>
                {(file.size/1024).toFixed(1)} KB · Click to replace
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize:13, color:"#5a5a5a", fontWeight:500 }}>
                Click to upload file
              </div>
              <div style={{ fontSize:11, color:"#9e9e9e", marginTop:1 }}>
                PDF, Word, Excel, PowerPoint, or Image
              </div>
            </>
          )}
        </div>
        {hasFile && (
          <span style={{ fontSize:11, color:"#F5C400", fontWeight:700,
            whiteSpace:"nowrap" }}>Uploaded ✓</span>
        )}
      </label>
      {hasFile && (
        <button onClick={() => onFileChange(fieldKey, null)} style={{
          marginTop:4, background:"none", border:"none", color:"#e53935",
          fontSize:11, cursor:"pointer", padding:0,
        }}>✕ Remove file</button>
      )}
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export default function ResearchEvaluation({ onNavigate }) {
  const [form, setF] = useState({
    author_id:"", campus_id:"", college_id:"", department_id:"",
    school_year_id:"", semester_id:"", title_of_research:"",
  });
  const [files, setFiles] = useState({
    authorship_form:null, evaluation_form:null, full_paper:null,
    turnitin_report:null, grammarly_report:null, journal_conference_info:null,
  });
  const [status, setStatus]   = useState({ type:"", msg:"" });
  const [loading, setLoading] = useState(false);

  const set     = (k, v) => setF(f => ({ ...f, [k]: v }));
  const on      = (k) => (e) => set(k, e.target.value);
  const setFile = (k, v) => setFiles(f => ({ ...f, [k]: v }));
  const depts   = DEPTS[form.college_id] || [];

  const handleSubmit = async () => {
    for (const [k, lbl] of REQUIRED_TEXT) {
      if (!form[k]) { setStatus({ type:"error", msg:`"${lbl}" is required.` }); return; }
    }
    for (const k of FILE_FIELDS) {
      if (!files[k]) {
        const lbl = k.replace(/_/g," ").replace(/\b\w/g, c => c.toUpperCase());
        setStatus({ type:"error", msg:`"${lbl}" file is required.` }); return;
      }
    }
    setLoading(true); setStatus({ type:"", msg:"" });
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => fd.append(k,v));
      FILE_FIELDS.forEach(k => fd.append(k, files[k]));
      const res = await fetch(`${API}/evaluations`, { method:"POST", body:fd });
      if (!res.ok) throw new Error((await res.json()).detail);
      setStatus({ type:"success", msg:"Evaluation submitted successfully!" });
      setF({ author_id:"", campus_id:"", college_id:"", department_id:"",
        school_year_id:"", semester_id:"", title_of_research:"" });
      setFiles({ authorship_form:null, evaluation_form:null, full_paper:null,
        turnitin_report:null, grammarly_report:null, journal_conference_info:null });
      setTimeout(() => onNavigate("eval-dashboard"), 1200);
    } catch (e) {
      setStatus({ type:"error", msg: e.message || "Submission failed." });
    } finally { setLoading(false); }
  };

  return (
    <div style={{ background:"#f5f5f5", minHeight:"100%" }}>

      {/* ── Page Header ── */}
      <div style={{
        background:"#0d0d0d", padding:"20px 28px",
        borderBottom:"3px solid #F5C400",
        display:"flex", alignItems:"center", justifyContent:"space-between",
      }}>
        <div>
          <div style={{ fontFamily:"'Barlow Condensed',sans-serif", color:"#F5C400",
            fontSize:9, fontWeight:700, letterSpacing:"3px",
            textTransform:"uppercase", opacity:.7, marginBottom:3 }}>Research Evaluation</div>
          <h1 style={{ fontFamily:"'Barlow Condensed',sans-serif", color:"#fff",
            fontSize:28, fontWeight:900, textTransform:"uppercase", letterSpacing:"-0.5px" }}>
            Submit Evaluation Record
          </h1>
        </div>
        <button onClick={() => onNavigate("eval-dashboard")} style={{
          background:"rgba(255,255,255,0.08)", color:"rgba(255,255,255,.6)",
          border:"1px solid rgba(255,255,255,.15)", padding:"8px 18px",
          fontFamily:"'Barlow',sans-serif", fontSize:12, cursor:"pointer", borderRadius:4,
        }}>View Records →</button>
      </div>

      {/* ── Body ── */}
      <div style={{ padding:"20px 28px 40px" }}>

        {/* Template tip */}
        <div style={{ background:"#fffbea", border:"1px solid #f5c400", borderRadius:4,
          padding:"9px 14px", marginBottom:16, fontSize:12, color:"#7a6000",
          display:"flex", alignItems:"center", gap:8 }}>
          💡 For Authorship Form and Evaluation Form, click <strong>"View Template"</strong> to
          download, fill out, then upload the completed file.
        </div>

        {/* ── Section 1: Research Information ── */}
        <Section title="Research Information">
          <F label="Title of Research" req>
            <Input type="text" value={form.title_of_research} onChange={on("title_of_research")}
              placeholder="Enter the complete title of research…" />
          </F>
          <Row>
            <F label="School Year" req>
              <Sel val={form.school_year_id} onChange={on("school_year_id")}
                opts={SCHOOL_YEARS} placeholder="Select school year" />
            </F>
            <F label="Semester" req>
              <Sel val={form.semester_id} onChange={on("semester_id")}
                opts={SEMESTERS} placeholder="Select semester" />
            </F>
          </Row>
        </Section>

        {/* ── Section 2: Author & Unit ── */}
        <Section title="Author(s) & Academic Unit">
          <F label="Author(s)" req>
            <AuthorInput value={form.author_id} onChange={v => set("author_id", v)} />
          </F>
          <Row cols={3}>
            <F label="Campus" req>
              <Sel val={form.campus_id} onChange={on("campus_id")}
                opts={CAMPUSES} placeholder="Select campus" />
            </F>
            <F label="College" req>
              <Sel val={form.college_id}
                onChange={e => { set("college_id", e.target.value); set("department_id",""); }}
                opts={COLLEGES} placeholder="Select college" />
            </F>
            <F label="Department / Program" req>
              <Sel val={form.department_id} onChange={on("department_id")}
                opts={depts} disabled={!form.college_id}
                placeholder={form.college_id ? "Select department" : "Select college first"} />
            </F>
          </Row>
        </Section>

        {/* ── Section 3: Document Uploads ── */}
        <Section title="Document Uploads">
          <Row>
            <FileUploadField label="Authorship Form" fieldKey="authorship_form"
              file={files.authorship_form} onFileChange={setFile}
              referenceUrl={REFERENCES.authorship_form.url} />
            <FileUploadField label="Evaluation Form" fieldKey="evaluation_form"
              file={files.evaluation_form} onFileChange={setFile}
              referenceUrl={REFERENCES.evaluation_form.url} />
          </Row>
          <Row>
            <FileUploadField label="Full Paper" fieldKey="full_paper"
              file={files.full_paper} onFileChange={setFile} />
            <FileUploadField label="Turnitin Report" fieldKey="turnitin_report"
              file={files.turnitin_report} onFileChange={setFile} />
          </Row>
          <Row>
            <FileUploadField label="Grammarly Report" fieldKey="grammarly_report"
              file={files.grammarly_report} onFileChange={setFile} />
            <FileUploadField label="Journal / Conference Info" fieldKey="journal_conference_info"
              file={files.journal_conference_info} onFileChange={setFile} />
          </Row>
        </Section>

        {/* ── Submit ── */}
        <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
          <button onClick={handleSubmit} disabled={loading} style={{
            background:"#F5C400", color:"#0d0d0d", border:"none", padding:"13px 44px",
            fontFamily:"'Barlow Condensed',sans-serif", fontSize:13, fontWeight:800,
            letterSpacing:"3px", textTransform:"uppercase", cursor:"pointer", borderRadius:4,
          }}>
            {loading ? "Submitting…" : "Submit Evaluation"}
          </button>
          {status.msg && (
            <div style={{
              fontSize:13, fontWeight:500, padding:"10px 16px", borderRadius:4,
              background: status.type==="success" ? "#e8f5e9" : "#ffebee",
              color: status.type==="success" ? "#2e7d32" : "#e53935",
              borderLeft:`3px solid ${status.type==="success" ? "#2e7d32" : "#e53935"}`,
            }}>{status.msg}</div>
          )}
        </div>

      </div>
    </div>
  );
}