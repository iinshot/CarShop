from fastapi import APIRouter
from server.src.database.requests import (
    CREATE_LIFEGUARD,
    UPDATE_LIFEGUARD,
    DELETE_LIFEGUARD,
    GET_LIFEGUARD,
    GET_ALL_LIFEGUARDS,
    GET_AVAILABLE_LIFEGUARDS
)
from server.src.database.db import db
from server.src.models.lifeguard import (
    LifeguardResponse,
    LifeguardBase,
    LifeguardList
)

router = APIRouter(prefix="/lifeguards", tags=["lifeguards"])

@router.post("/", response_model=LifeguardResponse)
async def create_lifeguard(lifeguard: LifeguardBase):
    available_workers = await db.fetch_all(GET_AVAILABLE_LIFEGUARDS)
    selected_worker = available_workers[0]
    new_lifeguard = await db.execute_returning(
        CREATE_LIFEGUARD,
        selected_worker['worker_id'],
        lifeguard.uniform,
        lifeguard.kit,
        lifeguard.security_zone
    )
    return LifeguardResponse(**new_lifeguard)

@router.put("/{worker_id}", response_model=LifeguardResponse)
async def update_lifeguard(worker_id: int, lifeguard: LifeguardBase):
    updated_lifeguard = await db.execute_returning(
        UPDATE_LIFEGUARD,
        lifeguard.uniform,
        lifeguard.kit,
        lifeguard.security_zone,
        worker_id
    )
    return LifeguardResponse(**updated_lifeguard)

@router.get("/{worker_id}", response_model=LifeguardResponse)
async def get_lifeguard(worker_id: int):
    lifeguard = await db.fetch_one(GET_LIFEGUARD, worker_id)
    return LifeguardResponse(**lifeguard)

@router.get("/", response_model=LifeguardList)
async def get_all_lifeguards():
    records = await db.fetch_all(GET_ALL_LIFEGUARDS)
    return LifeguardList(
        lifeguards=[LifeguardResponse(**lifeguard) for lifeguard in records]
    )

@router.delete("/{worker_id}")
async def delete_lifeguard(worker_id: int):
    await db.execute_returning(DELETE_LIFEGUARD, worker_id)
    return "Lifeguard deleted successful"