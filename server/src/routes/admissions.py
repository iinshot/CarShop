from fastapi import APIRouter
from server.src.database.requests import (
    CREATE_ADMISSION,
    UPDATE_ADMISSION,
    DELETE_ADMISSION,
    GET_ADMISSION,
    GET_ALL_ADMISSIONS
)
from server.src.database.db import db
from server.src.models.admission_journal import (
    AdmissionResponse,
    AdmissionBase,
    AdmissionList
)

router = APIRouter(prefix="/admissions", tags=["admissions"])

@router.post("/", response_model=AdmissionResponse)
async def create_admission(admission: AdmissionBase):
    new_admission = await db.execute_returning(
        CREATE_ADMISSION,
        admission.admission_date,
        admission.complectation,
        admission.color,
        admission.mark,
        admission.model,
        admission.year_create,
    )
    return AdmissionResponse(**new_admission)

@router.put("/{id_number}", response_model=AdmissionResponse)
async def update_admission(id_number: int, admission: AdmissionBase):
    updated_admission = await db.execute_returning(
        UPDATE_ADMISSION,
        admission.admission_date,
        admission.complectation,
        admission.color,
        admission.mark,
        admission.model,
        admission.year_create,
        id_number
    )
    return AdmissionResponse(**updated_admission)

@router.get("/{id_number}", response_model=AdmissionResponse)
async def get_admission(id_number: int):
    admission = await db.fetch_one(GET_ADMISSION, id_number)
    return AdmissionResponse(**admission)

@router.get("/", response_model=AdmissionList)
async def get_all_admissions():
    records = await db.fetch_all(GET_ALL_ADMISSIONS)
    return AdmissionList(
        admissions=[AdmissionResponse(**admission) for admission in records]
    )

@router.delete("/{id_number}")
async def delete_admission(id_number: int):
    await db.execute_returning(DELETE_ADMISSION, id_number)
    return "Admission deleted successful"