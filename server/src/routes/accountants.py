from fastapi import APIRouter
from random import Random
from server.src.database.requests import (
    CREATE_ACCOUNTANT,
    UPDATE_ACCOUNTANT,
    DELETE_ACCOUNTANT,
    GET_ACCOUNTANT,
    GET_ALL_ACCOUNTANTS,
    GET_AVAILABLE_ACCOUNTANTS,
    GET_RANDOM_ID_NUMBER
)
from server.src.database.db import db, Database
from server.src.models.accountant import (
    AccountantResponse,
    AccountantBase,
    AccountantList
)

router = APIRouter(prefix="/accountants", tags=["accountants"])

async def get_random_id_number(db: Database) -> int:
    """Получает случайный id_number из таблицы admission_journal"""
    records = await db.fetch_all(GET_RANDOM_ID_NUMBER)
    return Random().choice([record['id_number'] for record in records])

@router.post("/", response_model=AccountantResponse)
async def create_accountant(accountant: AccountantBase):
    available_workers = await db.fetch_all(GET_AVAILABLE_ACCOUNTANTS)
    selected_worker = available_workers[0]
    id_number = await get_random_id_number(db)
    new_accountant = await db.execute_returning(
        CREATE_ACCOUNTANT,
        selected_worker['worker_id'],
        accountant.qual,
        accountant.kit,
        id_number
    )
    return AccountantResponse(**new_accountant)

@router.put("/{worker_id}", response_model=AccountantResponse)
async def update_accountant(worker_id: int, accountant: AccountantBase):
    id_number = await get_random_id_number(db)
    updated_accountant = await db.execute_returning(
        UPDATE_ACCOUNTANT,
        accountant.qual,
        accountant.kit,
        id_number,
        worker_id
    )
    return AccountantResponse(**updated_accountant)

@router.get("/{worker_id}", response_model=AccountantResponse)
async def get_accountant(worker_id: int):
    accountant = await db.fetch_one(GET_ACCOUNTANT, worker_id)
    return AccountantResponse(**accountant)

@router.get("/", response_model=AccountantList)
async def get_all_accountants():
    records = await db.fetch_all(GET_ALL_ACCOUNTANTS)
    return AccountantList(
        accountants=[AccountantResponse(**accountant) for accountant in records]
    )

@router.delete("/{worker_id}")
async def delete_accountant(worker_id: int):
    await db.execute_returning(DELETE_ACCOUNTANT, worker_id)
    return "Accountant deleted successful"