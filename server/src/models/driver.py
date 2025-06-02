from pydantic import BaseModel, Field
from typing import List, Optional

class DriverBase(BaseModel):
    car_number: str
    snacks: str = Field(default='Отсутствует')

class DriverResponse(DriverBase):
    worker_id: int
    number_vin: Optional[str] = None

class DriverList(BaseModel):
    drivers: List[DriverResponse]