from pydantic import BaseModel
from typing import Optional


class ComplaintCreate(BaseModel):
    customer_name: str
    product_name: str
    batch_number: Optional[str] = None
    complaint_description: str