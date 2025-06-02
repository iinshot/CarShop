from datetime import date
from pydantic import BaseModel, Field
from typing import List


class AdmissionBase(BaseModel):
    admission_date: date
    complectation: str
    color: str
    mark: str
    model: str
    year_create: int = Field(ge=1980)


class AdmissionResponse(AdmissionBase):
    id_number: int

class AdmissionList(BaseModel):
    admissions: List[AdmissionResponse]