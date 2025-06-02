from random import Random
from random import randint
from fastapi import APIRouter
from server.src.database.requests import (
    CREATE_DIRECTOR,
    UPDATE_DIRECTOR,
    DELETE_DIRECTOR,
    GET_DIRECTOR,
    GET_ALL_DIRECTORS,
    GET_RANDOM_INN
)
from server.src.database.db import db, Database
from server.src.models.director import (
    DirectorBase,
    DirectorResponse,
    DirectorList
)

router = APIRouter(prefix="/directors", tags=["directors"])

async def get_random_inn(db: Database) -> int:
    """Получает случайный ИНН из таблицы company"""
    records = await db.fetch_all(GET_RANDOM_INN)
    return Random().choice([record['inn'] for record in records])

def generate_random_inn() -> int:
    """Генерирует рандомный ИНН"""
    return randint(10 ** 11, 10 ** 12 - 1)

@router.post("/", response_model=DirectorResponse)
async def create_director(director: DirectorBase):
    inn = generate_random_inn()
    inn_company = await get_random_inn(db)
    new_director = await db.execute_returning(
        CREATE_DIRECTOR,
        inn,
        director.profit,
        director.surname,
        director.firstname,
        director.lastname,
        inn_company
    )
    return DirectorResponse(**new_director)

@router.put("/{inn}", response_model=DirectorResponse)
async def update_director(inn: int, director: DirectorBase):
    inn_company = await get_random_inn(db)
    updated_director = await db.execute_returning(
        UPDATE_DIRECTOR,
        director.profit,
        director.surname,
        director.firstname,
        director.lastname,
        inn_company,
        inn
    )
    return DirectorResponse(**updated_director)

@router.get("/{inn}", response_model=DirectorResponse)
async def get_director(inn: int):
    director = await db.fetch_one(GET_DIRECTOR, inn)
    return DirectorResponse(**director)

@router.get("/", response_model=DirectorList)
async def get_all_directors():
    records = await db.fetch_all(GET_ALL_DIRECTORS)
    return DirectorList(
        directors=[DirectorResponse(**director) for director in records]
    )

@router.delete("/{inn}")
async def delete_director(inn: int):
    await db.execute_returning(DELETE_DIRECTOR, inn)
    return "Director deleted successful"