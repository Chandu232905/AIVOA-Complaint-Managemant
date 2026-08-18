from typing import TypedDict


class ComplaintState(TypedDict):
    complaint: str
    summary: str
    risk_level: str
    recommendation: str