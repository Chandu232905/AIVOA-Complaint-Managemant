from sqlalchemy import Column, Integer, String, Text, DateTime
from datetime import datetime

from database import Base


class Complaint(Base):

    __tablename__ = "complaints"


    # =====================================================
    # BASIC INFORMATION
    # =====================================================

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    customer_name = Column(
        String(200),
        nullable=False
    )

    product_name = Column(
        String(200),
        nullable=False
    )

    batch_number = Column(
        String(100),
        nullable=True
    )

    complaint_description = Column(
        Text,
        nullable=False
    )


    # =====================================================
    # COMPLAINT INFORMATION
    # =====================================================

    complaint_category = Column(
        String(100),
        nullable=True
    )


    # =====================================================
    # AI RISK ASSESSMENT
    # =====================================================

    risk_level = Column(
        String(50),
        nullable=True
    )

    ai_assessment = Column(
        Text,
        nullable=True
    )

    recommendation = Column(
        Text,
        nullable=True
    )


    # =====================================================
    # STATUS
    # =====================================================

    status = Column(
        String(50),
        default="New"
    )


    # =====================================================
    # CREATED DATE
    # =====================================================

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )