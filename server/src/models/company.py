from pydantic import BaseModel
from typing import List

class CompanyBase(BaseModel):
    name_company: str
    address: str

class CompanyResponse(CompanyBase):
    inn: int

class CompanyList(BaseModel):
    companies: List[CompanyResponse]