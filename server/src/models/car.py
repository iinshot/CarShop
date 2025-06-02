from pydantic import BaseModel, Field
from typing import List, Optional


class CarBase(BaseModel):
    complectation: str
    color: str
    mark: str
    model: str
    year_create: int = Field(ge=1980)


class CarResponse(CarBase):
    number_vin: str
    app_number: Optional[int] = None

class CarList(BaseModel):
    cars: List[CarResponse]