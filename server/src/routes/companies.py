from random import randint
from fastapi import APIRouter
from server.src.database.requests import (
    CREATE_COMPANY,
    GET_COMPANY,
    GET_ALL_COMPANIES,
    DELETE_COMPANY,
    UPDATE_COMPANY
)
from server.src.models.company import (
    CompanyBase,
    CompanyResponse,
    CompanyList
)
from server.src.database.db import db

router = APIRouter(prefix="/companies", tags=["companies"])

def generate_random_inn() -> int:
    return randint(10 ** 11, 10 ** 12 - 1)

@router.post("/", response_model=CompanyResponse)
async def create_company(company: CompanyBase):
    inn = generate_random_inn()
    new_company = await db.execute_returning(
        CREATE_COMPANY,
        inn,
        company.name_company,
        company.address
    )
    return CompanyResponse(**new_company)

@router.put("/{inn}", response_model=CompanyResponse)
async def update_company(inn: int, company: CompanyBase):
    updated_company = await db.execute_returning(
        UPDATE_COMPANY,
        company.name_company,
        company.address,
        inn
    )
    return CompanyResponse(**updated_company)

@router.get("/{inn}", response_model=CompanyResponse)
async def get_company(inn: int):
    company = await db.fetch_one(GET_COMPANY, inn)
    return CompanyResponse(**company)

@router.get("/", response_model=CompanyList)
async def get_all_companies():
    records = await db.fetch_all(GET_ALL_COMPANIES)
    return CompanyList(
        companies=[CompanyResponse(**company) for company in records]
    )

@router.delete("/{inn}")
async def delete_company(inn: int):
    await db.execute_returning(DELETE_COMPANY, inn)
    return "Company deleted successful"