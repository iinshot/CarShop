from fastapi import APIRouter, HTTPException
from random import Random
from server.src.database.requests import (
    CREATE_CAR,
    UPDATE_CAR,
    DELETE_CAR,
    GET_CAR,
    GET_ALL_CARS,
    GET_RANDOM_APP_NUMBER
)
from server.src.database.db import db, Database
from string import ascii_uppercase, digits
import random
from server.src.models.car import (
    CarResponse,
    CarBase,
    CarList
)

router = APIRouter(prefix="/cars", tags=["cars"])

async def get_random_app_number(db: Database) -> int:
    """Получает случайный app_number из таблицы client"""
    records = await db.fetch_all(GET_RANDOM_APP_NUMBER)
    return Random().choice([record['app_number'] for record in records])

async def generate_random_vin() -> str:
    allowed_letters = [c for c in ascii_uppercase if c not in 'IOQ']
    allowed_chars = allowed_letters + list(digits)
    vin = ''.join(random.choice(allowed_chars) for _ in range(17))
    return vin

@router.post("/", response_model=CarResponse)
async def create_car(car: CarBase):
    app_number = await get_random_app_number(db)
    number_vin = await generate_random_vin()
    new_car = await db.execute_returning(
        CREATE_CAR,
        number_vin,
        car.complectation,
        car.color,
        car.mark,
        car.model,
        car.year_create,
        app_number
    )
    return CarResponse(**new_car)

@router.get("/", response_model=CarList)
async def get_all_cars():
    records = await db.fetch_all(GET_ALL_CARS)
    return CarList(
        cars=[CarResponse(**car) for car in records]
    )

@router.put("/{number_vin}", response_model=CarResponse)
async def update_car(number_vin: str, car: CarBase):
    app_number = await get_random_app_number(db)
    updated_car = await db.execute_returning(
        UPDATE_CAR,
        car.complectation,
        car.color,
        car.mark,
        car.model,
        car.year_create,
        app_number,
        number_vin
    )
    return CarResponse(**updated_car)

@router.get("/{number_vin}", response_model=CarResponse)
async def get_car(number_vin: str):
    car = await db.fetch_one(GET_CAR, number_vin)
    return CarResponse(**car)

@router.delete("/{number_vin}")
async def delete_director(number_vin: str):
    await db.execute_returning(DELETE_CAR, number_vin)
    return "Car deleted successful"