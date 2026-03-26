from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import Optional
from datetime import date
from decimal import Decimal
import uvicorn, shutil, os, uuid

app = FastAPI(title="Scholar Sphere API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Upload folder ─────────────────────────────────────────────────────────────
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")


def save_file(upload: UploadFile) -> str:
    """Save an uploaded file and return its accessible URL path."""
    ext      = os.path.splitext(upload.filename)[1]
    filename = f"{uuid.uuid4().hex}{ext}"
    dest     = os.path.join(UPLOAD_DIR, filename)
    with open(dest, "wb") as f:
        shutil.copyfileobj(upload.file, f)
    return f"/uploads/{filename}"


# ── In-memory stores ──────────────────────────────────────────────────────────
eval_records: list[dict] = []
eval_counter = {"id": 1}

db_records: list[dict] = []
db_counter = {"id": 1}


# ── Research Database Schemas ─────────────────────────────────────────────────
class ResearchRecord(BaseModel):
    school_year_id: str
    semester_id: str
    research_output_type_id: str
    research_title: str
    research_type_id: str
    authors_id: str
    college_id: str
    program_department_id: str
    presentation_venue: Optional[str] = None
    conference_name: Optional[str] = None
    presentation_abstract: Optional[str] = None
    presentation_keywords: Optional[str] = None
    doi: Optional[str] = None
    manuscript_link: Optional[str] = None
    journal_publisher: Optional[str] = None
    volume: Optional[str] = None
    issue_number: Optional[str] = None
    page_number: Optional[str] = None
    publication_date: Optional[date] = None
    indexing: Optional[str] = None
    cite_score: Optional[Decimal] = None
    impact_factor: Optional[Decimal] = None
    editorial_board: Optional[str] = None
    journal_website: Optional[str] = None
    apa_format: Optional[str] = None
    publication_abstract: Optional[str] = None
    publication_keywords: Optional[str] = None

class ResearchRecordOut(ResearchRecord):
    paper_id: int


# ── Root ──────────────────────────────────────────────────────────────────────
@app.get("/")
def root():
    return {"message": "Scholar Sphere API is running."}


# ── Research Evaluation Routes (multipart/form-data) ─────────────────────────
@app.post("/evaluations", status_code=201)
async def create_evaluation(
    author_id:              str        = Form(...),
    campus_id:              str        = Form(...),
    college_id:             str        = Form(...),
    department_id:          str        = Form(...),
    school_year_id:         str        = Form(...),
    semester_id:            str        = Form(...),
    title_of_research:      str        = Form(...),
    authorship_form:        UploadFile = File(...),
    evaluation_form:        UploadFile = File(...),
    full_paper:             UploadFile = File(...),
    turnitin_report:        UploadFile = File(...),
    grammarly_report:       UploadFile = File(...),
    journal_conference_info: UploadFile = File(...),
):
    record = {
        "re_id":                  eval_counter["id"],
        "author_id":              author_id,
        "campus_id":              campus_id,
        "college_id":             college_id,
        "department_id":          department_id,
        "school_year_id":         school_year_id,
        "semester_id":            semester_id,
        "title_of_research":      title_of_research,
        "authorship_form":        save_file(authorship_form),
        "evaluation_form":        save_file(evaluation_form),
        "full_paper":             save_file(full_paper),
        "turnitin_report":        save_file(turnitin_report),
        "grammarly_report":       save_file(grammarly_report),
        "journal_conference_info": save_file(journal_conference_info),
        "authorship_form_name":        authorship_form.filename,
        "evaluation_form_name":        evaluation_form.filename,
        "full_paper_name":             full_paper.filename,
        "turnitin_report_name":        turnitin_report.filename,
        "grammarly_report_name":       grammarly_report.filename,
        "journal_conference_info_name": journal_conference_info.filename,
    }
    eval_records.append(record)
    eval_counter["id"] += 1
    return record


@app.get("/evaluations")
def list_evaluations():
    return eval_records


@app.get("/evaluations/{re_id}")
def get_evaluation(re_id: int):
    for r in eval_records:
        if r["re_id"] == re_id:
            return r
    raise HTTPException(status_code=404, detail="Record not found")


@app.put("/evaluations/{re_id}")
async def update_evaluation(
    re_id:                  int,
    author_id:              str             = Form(...),
    campus_id:              str             = Form(...),
    college_id:             str             = Form(...),
    department_id:          str             = Form(...),
    school_year_id:         str             = Form(...),
    semester_id:            str             = Form(...),
    title_of_research:      str             = Form(...),
    authorship_form:        Optional[UploadFile] = File(None),
    evaluation_form:        Optional[UploadFile] = File(None),
    full_paper:             Optional[UploadFile] = File(None),
    turnitin_report:        Optional[UploadFile] = File(None),
    grammarly_report:       Optional[UploadFile] = File(None),
    journal_conference_info: Optional[UploadFile] = File(None),
):
    for i, r in enumerate(eval_records):
        if r["re_id"] == re_id:
            updated = {
                **r,
                "author_id":         author_id,
                "campus_id":         campus_id,
                "college_id":        college_id,
                "department_id":     department_id,
                "school_year_id":    school_year_id,
                "semester_id":       semester_id,
                "title_of_research": title_of_research,
            }
            # Only replace file if a new one was uploaded
            def maybe_update(field, upload):
                if upload and upload.filename:
                    updated[field]            = save_file(upload)
                    updated[f"{field}_name"]  = upload.filename

            maybe_update("authorship_form",        authorship_form)
            maybe_update("evaluation_form",        evaluation_form)
            maybe_update("full_paper",             full_paper)
            maybe_update("turnitin_report",        turnitin_report)
            maybe_update("grammarly_report",       grammarly_report)
            maybe_update("journal_conference_info", journal_conference_info)

            eval_records[i] = updated
            return updated
    raise HTTPException(status_code=404, detail="Record not found")


@app.delete("/evaluations/{re_id}", status_code=204)
def delete_evaluation(re_id: int):
    for i, r in enumerate(eval_records):
        if r["re_id"] == re_id:
            eval_records.pop(i)
            return
    raise HTTPException(status_code=404, detail="Record not found")


# ── Research Database Routes ──────────────────────────────────────────────────
@app.post("/records", response_model=ResearchRecordOut, status_code=201)
def create_record(payload: ResearchRecord):
    record = {"paper_id": db_counter["id"], **payload.model_dump()}
    db_records.append(record)
    db_counter["id"] += 1
    return record


@app.get("/records", response_model=list[ResearchRecordOut])
def list_records():
    return db_records


@app.get("/records/{paper_id}", response_model=ResearchRecordOut)
def get_record(paper_id: int):
    for r in db_records:
        if r["paper_id"] == paper_id:
            return r
    raise HTTPException(status_code=404, detail="Record not found")


@app.put("/records/{paper_id}", response_model=ResearchRecordOut)
def update_record(paper_id: int, payload: ResearchRecord):
    for i, r in enumerate(db_records):
        if r["paper_id"] == paper_id:
            db_records[i] = {"paper_id": paper_id, **payload.model_dump()}
            return db_records[i]
    raise HTTPException(status_code=404, detail="Record not found")


@app.delete("/records/{paper_id}", status_code=204)
def delete_record(paper_id: int):
    for i, r in enumerate(db_records):
        if r["paper_id"] == paper_id:
            db_records.pop(i)
            return
    raise HTTPException(status_code=404, detail="Record not found")


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)