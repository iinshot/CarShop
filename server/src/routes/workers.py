from random import Random
from fastapi import APIRouter, HTTPException
from server.src.database.requests import (
    CREATE_WORKER,
    GET_ALL_WORKERS,
    GET_WORKER,
    DELETE_WORKER,
    UPDATE_WORKER,
    GET_RANDOM_ID_EXPANSE,
    GET_RANDOM_INN_DIRECTOR
)
from server.src.models.worker import WorkerLine, WorkerBase, WorkerCreate, WorkerHelp
from server.src.database.db import db, Database

router = APIRouter(prefix="/workers", tags=["workers"])


async def get_random_id_expanse(db: Database) -> int:
    """Получает случайный id_expanse из таблицы expanse_journal"""
    records = await db.fetch_all(GET_RANDOM_ID_EXPANSE)
    return Random().choice([record['id_expanse'] for record in records])

async def get_random_inn_director(db: Database) -> int:
    """Получает случайный inn_director из таблицы director"""
    records = await db.fetch_all(GET_RANDOM_INN_DIRECTOR)
    return Random().choice([record['inn'] for record in records])

@router.post("/", response_model=WorkerBase)
async def create_worker(worker: WorkerCreate):
    id_expanse = await get_random_id_expanse(db)
    inn_director = await get_random_inn_director(db)
    new_worker = await db.execute_returning(
        CREATE_WORKER,
        worker.salary,
        worker.post,
        worker.experience,
        worker.surname,
        worker.firstname,
        worker.lastname,
        worker.phone_number,
        worker.address,
        id_expanse,
        inn_director
    )
    return WorkerHelp(**new_worker)

@router.put("/{worker_id}", response_model=WorkerBase)
async def update_worker(worker_id: int, worker: WorkerCreate):
    id_expanse = await get_random_id_expanse(db)
    inn_director = await get_random_inn_director(db)
    updated_worker = await db.execute_returning(
        UPDATE_WORKER,
        worker.salary,
        worker.post,
        worker.experience,
        worker.surname,
        worker.firstname,
        worker.lastname,
        worker.phone_number,
        worker.address,
        id_expanse,
        inn_director,
        worker_id
    )
    return WorkerHelp(**updated_worker)


@router.get("/{worker_id}", response_model=WorkerHelp)  # Изменили на WorkerHelp
async def get_worker(worker_id: int):
    worker = await db.fetch_one(GET_WORKER, worker_id)
    return WorkerHelp(**worker)

@router.get("/", response_model=WorkerLine)
async def get_all_workers():
    records = await db.fetch_all(GET_ALL_WORKERS)
    workers_schema = WorkerLine(workers=[WorkerHelp(
        worker_id=worker["worker_id"],
        salary=worker["salary"],
        post=worker["post"],
        experience=worker["experience"],
        surname=worker["surname"],
        firstname=worker["firstname"],
        lastname=worker["lastname"],
        phone_number=worker["phone_number"],
        address=worker["address"],
        id_expanse=worker["id_expanse"],
        inn_director=worker["inn_director"]
    ) for worker in records])
    return workers_schema

@router.delete("/{worker_id}")
async def delete_user(worker_id: int):
    try:
        await db.execute_returning(DELETE_WORKER, worker_id)
        return "Worker deleted successful"
    except Exception:
        raise HTTPException(status_code=404, detail="Worker not found")

# пофиксить обновление данных (добавить поле id для нахождения)
