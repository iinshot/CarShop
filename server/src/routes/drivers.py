from fastapi import APIRouter
from random import Random
from server.src.database.requests import (
    CREATE_DRIVER,
    UPDATE_DRIVER,
    DELETE_DRIVER,
    GET_DRIVER,
    GET_ALL_DRIVERS,
    GET_AVAILABLE_DRIVERS,
    GET_RANDOM_NUMBER_VIN
)
from server.src.database.db import db, Database
from server.src.models.driver import (
    DriverResponse,
    DriverBase,
    DriverList
)

router = APIRouter(prefix="/drivers", tags=["drivers"])

async def get_random_number_vin(db: Database) -> str:
    """Получает случайный VIN-номер из таблицы car"""
    records = await db.fetch_all(GET_RANDOM_NUMBER_VIN)
    return Random().choice([record['number_vin'] for record in records])


@router.post("/", response_model=DriverResponse)
async def create_driver(driver: DriverBase):
    available_workers = await db.fetch_all(GET_AVAILABLE_DRIVERS)
    selected_worker = available_workers[0]
    number_vin = await get_random_number_vin(db)
    new_driver = await db.execute_returning(
        CREATE_DRIVER,
        selected_worker['worker_id'],
        driver.car_number,
        driver.snacks,
        number_vin
    )
    return DriverResponse(**new_driver)

@router.put("/{worker_id}", response_model=DriverResponse)
async def update_driver(worker_id: int, driver: DriverBase):
    number_vin = await get_random_number_vin(db)
    updated_driver = await db.execute_returning(
        UPDATE_DRIVER,
        driver.car_number,
        driver.snacks,
        number_vin,
        worker_id
    )
    return DriverResponse(**updated_driver)

@router.get("/{worker_id}", response_model=DriverResponse)
async def get_driver(worker_id: int):
    driver = await db.fetch_one(GET_DRIVER, worker_id)
    return DriverResponse(**driver)

@router.get("/", response_model=DriverList)
async def get_all_drivers():
    records = await db.fetch_all(GET_ALL_DRIVERS)
    return DriverList(
        drivers=[DriverResponse(**driver) for driver in records]
    )

@router.delete("/{worker_id}")
async def delete_driver(worker_id: int):
    await db.execute_returning(DELETE_DRIVER, worker_id)
    return "Driver deleted successful"