from pydantic import BaseModel, Field
from typing import List, Optional

class AccountantBase(BaseModel):
    qual: int = Field(default=0, ge=0)
    kit: str = Field(default='Отсутствует')

class AccountantResponse(AccountantBase):
    worker_id: int
    id_number: Optional[int] = None

class AccountantList(BaseModel):
    accountants: List[AccountantResponse]