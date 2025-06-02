from datetime import datetime, date
from pydantic import BaseModel, EmailStr, field_validator


class UserRegister(BaseModel):
    email: EmailStr
    username: str
    password: str
    repeated_password: str
    fio: str
    birthday: str

    @field_validator('birthday')
    def validate_birthday(cls, v) -> date:
        return datetime.strptime(v, "%d.%m.%Y").date()

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    user_id: int
    username: str
    email: str
    birthday: str
    email_verified: bool

    class Config:
        json_encoders = {
            date: lambda v: v.strftime("%d.%m.%Y")
        }

class Token(BaseModel):
    access_token: str
    token_type: str

class EmailConfirm(BaseModel):
    email: EmailStr
    code: str