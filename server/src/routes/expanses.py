from fastapi import APIRouter
from server.src.database.requests import (
    CREATE_EXPANSE,
    UPDATE_EXPANSE,
    DELETE_EXPANSE,
    GET_EXPANSE,
    GET_ALL_EXPANSES
)
from server.src.database.db import db
from server.src.models.expanse_journal import (
    ExpanseResponse,
    ExpanseBase,
    ExpanseList
)

router = APIRouter(prefix="/expanses", tags=["expanses"])

@router.post("/", response_model=ExpanseResponse)
async def create_expanse(expanse: ExpanseBase):
    new_expanse = await db.execute_returning(
        CREATE_EXPANSE,
        expanse.expanse_type,
        expanse.expanse_sum,
        expanse.expanse_name
    )
    return ExpanseResponse(**new_expanse)

@router.put("/{id_expanse}", response_model=ExpanseResponse)
async def update_expanse(id_expanse: int, expanse: ExpanseBase):
    updated_expanse = await db.execute_returning(
        UPDATE_EXPANSE,
        expanse.expanse_type,
        expanse.expanse_sum,
        expanse.expanse_name,
        id_expanse
    )
    return ExpanseResponse(**updated_expanse)

@router.get("/{id_expanse}", response_model=ExpanseResponse)
async def get_expanse(id_expanse: int):
    expanse = await db.fetch_one(GET_EXPANSE, id_expanse)
    return ExpanseResponse(**expanse)

@router.get("/", response_model=ExpanseList)
async def get_all_expanses():
    records = await db.fetch_all(GET_ALL_EXPANSES)
    return ExpanseList(
        expanses=[ExpanseResponse(**expanse) for expanse in records]
    )

@router.delete("/{id_expanse}")
async def delete_expanse(id_expanse: int):
    await db.execute_returning(DELETE_EXPANSE, id_expanse)
    return "Expanse deleted successful"