from fastapi import APIRouter
from random import Random
from server.src.database.requests import (
    CREATE_SELLER,
    UPDATE_SELLER,
    DELETE_SELLER,
    GET_SELLER,
    GET_ALL_SELLERS,
    GET_AVAILABLE_SELLERS,
    GET_RANDOM_APP_NUMBER
)
from server.src.database.db import db, Database
from server.src.models.seller import (
    SellerResponse,
    SellerBase,
    SellerList
)

router = APIRouter(prefix="/sellers", tags=["sellers"])

async def get_random_app_number(db: Database) -> int:
    """Получает случайный app_number из таблицы client"""
    records = await db.fetch_all(GET_RANDOM_APP_NUMBER)
    return Random().choice([record['app_number'] for record in records])

@router.post("/", response_model=SellerResponse)
async def create_seller(seller: SellerBase):
    available_workers = await db.fetch_all(GET_AVAILABLE_SELLERS)
    selected_worker = available_workers[0]
    app_number = await get_random_app_number(db)
    new_seller = await db.execute_returning(
        CREATE_SELLER,
        selected_worker['worker_id'],
        seller.seller_type,
        app_number
    )
    return SellerResponse(**new_seller)

@router.put("/{worker_id}", response_model=SellerResponse)
async def update_seller(worker_id: int, seller: SellerBase):
    app_number = await get_random_app_number(db)
    updated_seller = await db.execute_returning(
        UPDATE_SELLER,
        seller.seller_type,
        app_number,
        worker_id
    )
    return SellerResponse(**updated_seller)

@router.get("/{worker_id}", response_model=SellerResponse)
async def get_seller(worker_id: int):
    seller = await db.fetch_one(GET_SELLER, worker_id)
    return SellerResponse(**seller)

@router.get("/", response_model=SellerList)
async def get_all_sellers():
    records = await db.fetch_all(GET_ALL_SELLERS)
    return SellerList(
        sellers=[SellerResponse(**seller) for seller in records]
    )

@router.delete("/{worker_id}")
async def delete_seller(worker_id: int):
    await db.execute_returning(DELETE_SELLER, worker_id)
    return "Seller deleted successful"