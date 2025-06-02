from fastapi import APIRouter
from server.src.database.requests import (
    CREATE_CLIENT,
    UPDATE_CLIENT,
    DELETE_CLIENT,
    GET_CLIENT,
    GET_ALL_CLIENTS
)
from server.src.database.db import db
from server.src.models.client import (
    ClientResponse,
    ClientBase,
    ClientList
)

router = APIRouter(prefix="/clients", tags=["clients"])

@router.post("/", response_model=ClientResponse)
async def create_client(client: ClientBase):
    new_client = await db.execute_returning(
        CREATE_CLIENT,
        client.budget,
        client.current_car,
        client.prefer_car
    )
    return ClientResponse(**new_client)

@router.put("/{app_number}", response_model=ClientResponse)
async def update_client(app_number: int, client: ClientBase):
    updated_client = await db.execute_returning(
        UPDATE_CLIENT,
        client.budget,
        client.current_car,
        client.prefer_car,
        app_number
    )
    return ClientResponse(**updated_client)

@router.get("/{app_number}", response_model=ClientResponse)
async def get_client(app_number: int):
    client = await db.fetch_one(GET_CLIENT, app_number)
    return ClientResponse(**client)

@router.get("/", response_model=ClientList)
async def get_all_clients():
    records = await db.fetch_all(GET_ALL_CLIENTS)
    return ClientList(
        clients=[ClientResponse(**client) for client in records]
    )

@router.delete("/{app_number}")
async def delete_client(app_number: int):
    await db.execute_returning(DELETE_CLIENT, app_number)
    return "Client deleted successful"