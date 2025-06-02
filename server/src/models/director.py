from pydantic import BaseModel
from typing import List, Optional


class DirectorBase(BaseModel):
    profit: float
    surname: str
    firstname: str
    lastname: str


class DirectorResponse(DirectorBase):
    inn: int
    inn_company: Optional[int] = None

class DirectorList(BaseModel):
    directors: List[DirectorResponse]