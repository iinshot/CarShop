from pydantic import BaseModel, Field
from typing import List

class LifeguardBase(BaseModel):
    uniform: str
    kit: str = Field(default='Отсутствует')
    security_zone: str = Field(default='Вход')

class LifeguardResponse(LifeguardBase):
    worker_id: int

class LifeguardList(BaseModel):
    lifeguards: List[LifeguardResponse]