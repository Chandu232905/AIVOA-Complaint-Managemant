from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel

from database import SessionLocal, engine, Base
from models import Complaint
from ai.graph import complaint_graph


# =========================================================
# DATABASE
# =========================================================

Base.metadata.create_all(bind=engine)


# =========================================================
# FASTAPI APP
# =========================================================

app = FastAPI(
    title="AIVOA Complaint Management API",
    version="1.0.0"
)


# =========================================================
# CORS
# =========================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# DATABASE SESSION
# =========================================================

def get_db():
    db = SessionLocal()

    try:
        yield db
    finally:
        db.close()


# =========================================================
# REQUEST MODEL
# =========================================================

class ComplaintCreate(BaseModel):
    customer_name: str
    product_name: str
    batch_number: str
    complaint_description: str


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():
    return {
        "message": "AIVOA Complaint Management API is running"
    }


# =========================================================
# CREATE COMPLAINT
# =========================================================

@app.post("/api/complaints")
def create_complaint(
    complaint_data: ComplaintCreate,
    db: Session = Depends(get_db)
):

    # -----------------------------------------------------
    # RUN AI
    # -----------------------------------------------------

    ai_result = complaint_graph.invoke(
        {
            "complaint": complaint_data.complaint_description,
            "summary": "",
            "risk_level": "",
            "recommendation": ""
        }
    )

    # -----------------------------------------------------
    # CHECK AI RESULT
    # -----------------------------------------------------

    if not ai_result:
        raise HTTPException(
            status_code=500,
            detail="AI assessment failed"
        )

    # -----------------------------------------------------
    # GET AI RESULTS
    # -----------------------------------------------------

    summary = ai_result.get(
        "summary",
        "AI assessment generated successfully."
    )

    risk_level = ai_result.get(
        "risk_level",
        "Needs AI assessment"
    )

    recommendation = ai_result.get(
        "recommendation",
        "Review the AI assessment."
    )

    # -----------------------------------------------------
    # SAVE COMPLAINT
    #
    # IMPORTANT:
    # recommendation is NOT saved because your
    # current Complaint model does not contain
    # a recommendation column.
    # -----------------------------------------------------

    new_complaint = Complaint(
        customer_name=complaint_data.customer_name,
        product_name=complaint_data.product_name,
        batch_number=complaint_data.batch_number,
        complaint_description=complaint_data.complaint_description,
        ai_assessment=summary,
        risk_level=risk_level
    )

    db.add(new_complaint)
    db.commit()
    db.refresh(new_complaint)

    # -----------------------------------------------------
    # RETURN RESULT TO FRONTEND
    # -----------------------------------------------------

    return {
        "id": new_complaint.id,
        "complaint_id": new_complaint.id,
        "customer_name": new_complaint.customer_name,
        "product_name": new_complaint.product_name,
        "batch_number": new_complaint.batch_number,
        "complaint_description":
            new_complaint.complaint_description,
        "ai_assessment":
            new_complaint.ai_assessment,
        "risk_level":
            new_complaint.risk_level,
        "recommendation":
            recommendation
    }


# =========================================================
# GET ALL COMPLAINTS
# =========================================================

@app.get("/api/complaints")
def get_complaints(
    db: Session = Depends(get_db)
):

    complaints = (
        db.query(Complaint)
        .order_by(Complaint.id.desc())
        .all()
    )

    return [
        {
            "id": complaint.id,
            "customer_name":
                complaint.customer_name,
            "product_name":
                complaint.product_name,
            "batch_number":
                complaint.batch_number,
            "complaint_description":
                complaint.complaint_description,
            "ai_assessment":
                complaint.ai_assessment,
            "risk_level":
                complaint.risk_level
        }
        for complaint in complaints
    ]


# =========================================================
# GET SINGLE COMPLAINT
# =========================================================

@app.get("/api/complaints/{complaint_id}")
def get_complaint(
    complaint_id: int,
    db: Session = Depends(get_db)
):

    complaint = (
        db.query(Complaint)
        .filter(Complaint.id == complaint_id)
        .first()
    )

    if not complaint:
        raise HTTPException(
            status_code=404,
            detail="Complaint not found"
        )

    return {
        "id": complaint.id,
        "customer_name":
            complaint.customer_name,
        "product_name":
            complaint.product_name,
        "batch_number":
            complaint.batch_number,
        "complaint_description":
            complaint.complaint_description,
        "ai_assessment":
            complaint.ai_assessment,
        "risk_level":
            complaint.risk_level
    }