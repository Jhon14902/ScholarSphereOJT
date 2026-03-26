import { useState } from "react";

const API = "http://localhost:8000";

const SCHOOL_YEARS   = ["2021-2022","2022-2023","2023-2024","2024-2025","2025-2026"];
const SEMESTERS      = ["1st Semester","2nd Semester","Summer"];
const OUTPUT_TYPES   = ["Presentation","Publication","Intl Presentation","Intl Publication"];
const RESEARCH_TYPES = ["Student","Faculty","Student & Faculty","Industry Collaborative","Faculty & Industry"];
const INDEXING       = ["Scopus","Web of Science","DOAJ","PubMed","ESCI","Emerging Sources","Others"];
const COLLEGES       = [
  "College of Engineering and Architecture","College of Computer Studies",
  "College of Business Education","College of Arts","Graduate Program","College of Education",
];
const DEPTS = {
  "College of Engineering and Architecture": [
    "Architecture (BS Arch)","Chemical Engineering (BSChE)","Civil Engineering (BSCE)",
    "Computer Engineering (BSCpE)","Electrical Engineering (BSEE)","Electronics Engineering (BSECE)",
    "Environmental and Sanitary Engineering (BSEnSE)","Industrial Engineering (BSIE)","Mechanical Engineering (BSME)",
  ],
  "College of Computer Studies": [
    "Computer Science (BSCS)","Information Systems (BSIS)",
    "Information Technology (BSIT)","Data Science and Analytics (BSDSA)",
  ],
  "College of Business Education": ["Business Administration (BSBA)","Accountancy (BSA)"],
  "College of Arts": ["Arts in Communication (BA Comm)"],
  "Graduate Program": [
    "Information Technology (MIT)","Science in Computer Science (MSCS)","Information Systems (MSIS)",
    "Engineering - Civil Engineering (MCE)","Engineering - Electronics Engineering (MECE)",
    "Engineering Management","Logistics Management","Supply Chain Management",
  ],
  "College of Education": ["Secondary Education (BSEd)","Teaching Certificate Program (TCP)"],
};

const EMPTY = {
  school_year_id:"", semester_id:"", research_output_type_id:"", research_title:"",
  research_type_id:"", authors_id:"", college_id:"", program_department_id:"",
  presentation_venue:"", conference_name:"", presentation_abstract:"", presentation_keywords:"",
  doi:"", manuscript_link:"", journal_publisher:"", volume:"", issue_number:"",
  page_number:"", publication_date:"", indexing:"", cite_score:"", impact_factor:"",
  editorial_board:"", journal_website:"", apa_format:"", publication_abstract:"", publication_keywords:"",
};

const REQUIRED = [
  ["school_year_id","School Year"],["semester_id","Semester"],
  ["research_output_type_id","Research Output Type"],["research_title","Research Title"],
  ["research_type_id","Research Type"],["authors_id","Authors"],
  ["college_id","College"],["program_department_id","Program / Department"],
];

const iStyle = {
  width:"100%", background:"#f9f9f9", border:"1.5px solid #e0e0e0", borderRadius:3,
  padding:"10px 12px", fontFamily:"'Barlow',sans-serif", fontSize:14, color:"#0d0d0d",
  outline:"none", appearance:"none",
};
const Input    = (p) => <input style={iStyle} {...p} />;
const TA       = (p) => <textarea style={{ ...iStyle, resize:"vertical", minHeight:88, lineHeight:1.6 }} {...p} />;
const Lbl      = ({ text, req, opt }) => (
  <label style={{ display:"block", fontSize:10, fontWeight:700, letterSpacing:"2px",
    textTransform:"uppercase", color:"#5a5a5a", marginBottom:6 }}>
    {text}{req && <span style={{ color:"#d4a900" }}> *</span>}
    {opt && <span style={{ color:"#9e9e9e", fontWeight:400, textTransform:"none" }}> (optional)</span>}
  </label>
);
const Sel      = ({ val, onChange, opts, placeholder, disabled }) => (
  <div style={{ position:"relative" }}>
    <select value={val} onChange={onChange} disabled={disabled} style={iStyle}>
      <option value="">{placeholder}</option>
      {opts.map(o => <option key={o}>{o}</option>)}
    </select>
    <span style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)",
      pointerEvents:"none", color:"#9e9e9e" }}>▾</span>
  </div>
);
const F        = ({ children }) => <div style={{ marginBottom:18 }}>{children}</div>;
const Row      = ({ children, cols=2 }) => (
  <div style={{ display:"grid", gridTemplateColumns:`repeat(${cols},1fr)`, gap:16, marginBottom:0 }}>
    {children}
  </div>
);
const Section  = ({ title, children }) => (
  <div style={{ marginBottom:32 }}>
    <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:11, fontWeight:700,
      letterSpacing:"3px", textTransform:"uppercase", color:"#9e9e9e",
      borderBottom:"1px solid #e0e0e0", paddingBottom:8, marginBottom:20 }}>{title}</div>
    {children}
  </div>
);

export default function ResearchDatabase({ onNavigate }) {
  const [form, setF] = useState(EMPTY);
  const [status, setStatus] = useState({ type:"", msg:"" });
  const [loading, setLoading] = useState(false);

  const set       = (k, v) => setF(f => ({ ...f, [k]: v }));
  const on        = (k) => (e) => set(k, e.target.value);
  const showPres  = ["Presentation","Intl Presentation"].includes(form.research_output_type_id);
  const showPub   = ["Publication","Intl Publication"].includes(form.research_output_type_id);
  const depts     = DEPTS[form.college_id] || [];

  const handleSubmit = async () => {
    for (const [k, lbl] of REQUIRED) {
      if (!form[k]) { setStatus({ type:"error", msg:`"${lbl}" is required.` }); return; }
    }
    setLoading(true);
    setStatus({ type:"", msg:"" });
    try {
      const payload = { ...form,
        cite_score: form.cite_score || null,
        impact_factor: form.impact_factor || null,
        publication_date: form.publication_date || null,
      };
      const res = await fetch(`${API}/records`, {
        method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error((await res.json()).detail);
      setStatus({ type:"success", msg:"Record submitted successfully!" });
      setF(EMPTY);
      setTimeout(() => onNavigate("db-dashboard"), 1200);
    } catch (e) {
      setStatus({ type:"error", msg: e.message || "Submission failed." });
    } finally { setLoading(false); }
  };

  return (
    <div style={{ background:"#fff", minHeight:"100%" }}>

      {/* Page Header */}
      <div style={{ background:"#0d0d0d", padding:"24px 40px", borderBottom:"3px solid #F5C400" }}>
        <div style={{ fontFamily:"'Barlow Condensed',sans-serif", color:"#F5C400",
          fontSize:9, fontWeight:700, letterSpacing:"3px",
          textTransform:"uppercase", opacity:.7, marginBottom:4 }}>Research Database</div>
        <h1 style={{ fontFamily:"'Barlow Condensed',sans-serif", color:"#fff",
          fontSize:32, fontWeight:900, textTransform:"uppercase", letterSpacing:"-0.5px" }}>
          Submit Research Record
        </h1>
        <p style={{ color:"rgba(255,255,255,.4)", fontSize:13, marginTop:4 }}>
          Fill out all required fields. Presentation or publication fields appear based on output type.
        </p>
      </div>

      {/* Form Body */}
      <div style={{ padding:"36px 40px 60px", maxWidth:860 }}>

        <Section title="Core Information">
          <Row>
            <F><Lbl text="School Year" req /><Sel val={form.school_year_id} onChange={on("school_year_id")} opts={SCHOOL_YEARS} placeholder="Select school year" /></F>
            <F><Lbl text="Semester" req /><Sel val={form.semester_id} onChange={on("semester_id")} opts={SEMESTERS} placeholder="Select semester" /></F>
          </Row>
          <F><Lbl text="Research Output Type" req /><Sel val={form.research_output_type_id} onChange={on("research_output_type_id")} opts={OUTPUT_TYPES} placeholder="Select output type" /></F>
          <F><Lbl text="Research Title" req /><TA value={form.research_title} onChange={on("research_title")} placeholder="Enter the full research title…" rows={3} /></F>
        </Section>

        <Section title="Research Type & Authorship">
          <F><Lbl text="Research Type" req /><Sel val={form.research_type_id} onChange={on("research_type_id")} opts={RESEARCH_TYPES} placeholder="Select research type" /></F>
          <F><Lbl text="Authors" req /><Input type="text" value={form.authors_id} onChange={on("authors_id")} placeholder="e.g. Juan Dela Cruz, Maria Santos" /></F>
          <Row>
            <F>
              <Lbl text="College" req />
              <Sel val={form.college_id}
                onChange={e => { set("college_id", e.target.value); set("program_department_id",""); }}
                opts={COLLEGES} placeholder="Select college" />
            </F>
            <F>
              <Lbl text="Program / Department" req />
              <Sel val={form.program_department_id} onChange={on("program_department_id")}
                opts={depts} disabled={!form.college_id}
                placeholder={form.college_id ? "Select program / department" : "Select a college first"} />
            </F>
          </Row>
        </Section>

        {showPres && (
          <div style={{ borderLeft:"3px solid #F5C400", paddingLeft:20, marginBottom:32,
            animation:"fd .25s ease" }}>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:13, fontWeight:800,
              letterSpacing:"3px", textTransform:"uppercase", marginBottom:20 }}>
              📋 Presentation Information
            </div>
            <Row>
              <F><Lbl text="Presentation Venue" opt /><Input type="text" value={form.presentation_venue} onChange={on("presentation_venue")} placeholder="e.g. University Auditorium" /></F>
              <F><Lbl text="Conference Name" opt /><Input type="text" value={form.conference_name} onChange={on("conference_name")} placeholder="e.g. ICCIT 2025" /></F>
            </Row>
            <F><Lbl text="Abstract" opt /><TA value={form.presentation_abstract} onChange={on("presentation_abstract")} placeholder="Enter abstract…" rows={4} /></F>
            <F><Lbl text="Keywords" opt /><Input type="text" value={form.presentation_keywords} onChange={on("presentation_keywords")} placeholder="e.g. machine learning, NLP" /></F>
          </div>
        )}

        {showPub && (
          <div style={{ borderLeft:"3px solid #F5C400", paddingLeft:20, marginBottom:32,
            animation:"fd .25s ease" }}>
            <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:13, fontWeight:800,
              letterSpacing:"3px", textTransform:"uppercase", marginBottom:20 }}>
              📄 Publication Information
            </div>
            <Row>
              <F><Lbl text="DOI" opt /><Input type="text" value={form.doi} onChange={on("doi")} placeholder="e.g. 10.1016/j.xxx.2025" /></F>
              <F><Lbl text="Manuscript Link" opt /><Input type="url" value={form.manuscript_link} onChange={on("manuscript_link")} placeholder="https://…" /></F>
            </Row>
            <F><Lbl text="Journal / Publisher" opt /><Input type="text" value={form.journal_publisher} onChange={on("journal_publisher")} placeholder="e.g. Elsevier, IEEE, Springer" /></F>
            <Row cols={3}>
              <F><Lbl text="Volume" opt /><Input type="text" value={form.volume} onChange={on("volume")} placeholder="e.g. 12" /></F>
              <F><Lbl text="Issue No." opt /><Input type="text" value={form.issue_number} onChange={on("issue_number")} placeholder="e.g. 3" /></F>
              <F><Lbl text="Page Number" opt /><Input type="text" value={form.page_number} onChange={on("page_number")} placeholder="e.g. 45–58" /></F>
            </Row>
            <Row>
              <F><Lbl text="Publication Date" opt /><Input type="date" value={form.publication_date} onChange={on("publication_date")} /></F>
              <F><Lbl text="Indexing" opt /><Sel val={form.indexing} onChange={on("indexing")} opts={INDEXING} placeholder="Select indexing" /></F>
            </Row>
            <Row>
              <F><Lbl text="Cite Score" opt /><Input type="number" step="0.01" value={form.cite_score} onChange={on("cite_score")} placeholder="e.g. 4.20" /></F>
              <F><Lbl text="Impact Factor" opt /><Input type="number" step="0.01" value={form.impact_factor} onChange={on("impact_factor")} placeholder="e.g. 3.75" /></F>
            </Row>
            <div style={{ borderTop:"1px solid #f0e0a0", paddingTop:18, marginTop:4 }}>
              <div style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:10,
                fontWeight:700, letterSpacing:"2.5px", textTransform:"uppercase",
                color:"#9e9e9e", marginBottom:16 }}>Additional Publication Info</div>
              <F><Lbl text="Editorial Board" opt /><TA value={form.editorial_board} onChange={on("editorial_board")} placeholder="Board members…" rows={2} /></F>
              <F><Lbl text="Journal Website" opt /><Input type="url" value={form.journal_website} onChange={on("journal_website")} placeholder="https://…" /></F>
              <F><Lbl text="APA Format Citation" opt /><TA value={form.apa_format} onChange={on("apa_format")} placeholder="Author, A. A. (Year). Title. Journal, Vol(Issue), pages. DOI" rows={2} /></F>
              <F><Lbl text="Abstract" opt /><TA value={form.publication_abstract} onChange={on("publication_abstract")} placeholder="Enter abstract…" rows={4} /></F>
              <F><Lbl text="Keywords" opt /><Input type="text" value={form.publication_keywords} onChange={on("publication_keywords")} placeholder="e.g. deep learning, image segmentation" /></F>
            </div>
          </div>
        )}

        <div style={{ display:"flex", alignItems:"center", gap:16, flexWrap:"wrap", marginTop:8 }}>
          <button onClick={handleSubmit} disabled={loading} style={{
            background:"#F5C400", color:"#0d0d0d", border:"none", padding:"14px 44px",
            fontFamily:"'Barlow Condensed',sans-serif", fontSize:13, fontWeight:800,
            letterSpacing:"3px", textTransform:"uppercase", cursor:"pointer", borderRadius:2,
          }}>
            {loading ? "Submitting…" : "Submit Record"}
          </button>
          <button onClick={() => onNavigate("db-dashboard")} style={{
            background:"none", border:"1.5px solid #e0e0e0", color:"#5a5a5a",
            padding:"13px 24px", fontFamily:"'Barlow',sans-serif",
            fontSize:13, cursor:"pointer", borderRadius:2,
          }}>
            View Records →
          </button>
          {status.msg && (
            <div style={{
              fontSize:13, fontWeight:500, padding:"10px 16px", borderRadius:3,
              background: status.type === "success" ? "#e8f5e9" : "#ffebee",
              color: status.type === "success" ? "#2e7d32" : "#e53935",
              borderLeft:`3px solid ${status.type === "success" ? "#2e7d32" : "#e53935"}`,
            }}>{status.msg}</div>
          )}
        </div>

      </div>
      <style>{`@keyframes fd{from{opacity:0;transform:translateY(-6px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}
