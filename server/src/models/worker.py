from typing import List, Optional
from pydantic import BaseModel, Field

class WorkerBase(BaseModel):
    surname: str
    firstname: str
    lastname: str
    phone_number: int
    address: str

class WorkerCreate(WorkerBase):
    salary: int = Field(default=20000, ge=20000)
    post: str = Field(default="Безработный")
    experience: int = Field(default=0)
    id_expanse: Optional[int] = None
    inn_director: Optional[int] = None

class WorkerHelp(BaseModel):
    worker_id: int
    surname: str
    firstname: str
    lastname: str
    phone_number: int
    address: str
    inn_director: int
    salary: int = Field(default=20000, ge=20000)
    post: str = Field(default="Безработный")
    experience: int = Field(default=0)
    id_expanse: int = Field(gt=0)

class WorkerLine(BaseModel):
    workers: Optional[List[WorkerHelp]]