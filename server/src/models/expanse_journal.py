from pydantic import BaseModel, Field
from typing import List


class ExpanseBase(BaseModel):
    expanse_type: str
    expanse_sum: float = Field(default=0.0)
    expanse_name: str

class ExpanseResponse(ExpanseBase):
    id_expanse: int

class ExpanseList(BaseModel):
    expanses: List[ExpanseResponse]