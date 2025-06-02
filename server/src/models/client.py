from pydantic import BaseModel, Field
from typing import List


class ClientBase(BaseModel):
    budget: float = Field(ge=0)
    current_car: str = Field(default='Отсутствует')
    prefer_car: str = Field(default='Отсутствует')

class ClientResponse(ClientBase):
    app_number: int

class ClientList(BaseModel):
    clients: List[ClientResponse]