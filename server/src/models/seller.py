from pydantic import BaseModel
from typing import List, Optional

class SellerBase(BaseModel):
    seller_type: str

class SellerResponse(SellerBase):
    worker_id: int
    app_number: Optional[int] = None

class SellerList(BaseModel):
    sellers: List[SellerResponse]