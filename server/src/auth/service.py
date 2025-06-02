from datetime import datetime, timezone, time
from email.header import Header
from jose import jwt
from asyncpg.pgproto.pgproto import timedelta
from server.src.auth.repository import AuthRepository
from server.src.auth.models import UserRegister, UserResponse
from passlib.context import CryptContext
from server.src.config import settings
import smtplib
from email.mime.text import MIMEText
import random
from server.src.database.db import db

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class AuthService:
    @staticmethod
    async def register_user(user_data: UserRegister) -> UserResponse:
        """Создание пользователя"""
        existing_user = await AuthRepository.get_user_by_username(user_data.username)
        if existing_user:
            raise ValueError("This name had created")

        existing_email = await AuthRepository.get_user_by_email(user_data.email)
        if existing_email:
            if not existing_email['email_verified']:
                await db.execute("DELETE FROM users WHERE email = $1", user_data.email)
            else:
                raise ValueError("Email already registered")

        hashed_password = pwd_context.hash(user_data.password)

        user = await AuthRepository.create_user(
            username=user_data.username,
            email=user_data.email,
            hashed_password=hashed_password,
            fio=user_data.fio,
            birthday=user_data.birthday
        )
        code = str(random.randint(100000, 999999))
        await AuthRepository.update_email_code(user["user_id"], code)
        await AuthService.send_confirmation_email(user["email"], code)

        return UserResponse(
            user_id=user["user_id"],
            username=user["username"],
            email=user["email"],
            birthday=user["birthday"].strftime("%d.%m.%Y"),
            email_verified = False
        )

    @staticmethod
    async def authenticate_user(username: str, password: str) -> dict:
        """Аунтефикация пользователя"""
        user = await AuthRepository.get_user_by_username(username)
        if not user or not pwd_context.verify(password, user['hashed_password']):
            raise ValueError('Incorrect data')
        return user

    @staticmethod
    async def create_access_token(data: dict) -> str:
        """Создание jwt-токена"""
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        to_encode.update({"expire": expire.timestamp()})
        return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)

    @staticmethod
    async def send_confirmation_email(email: str, code: str):
        """Отправка email с надежным подключением"""
        msg = MIMEText(
            f"Ваш код подтверждения: {code}\n"
            f"Код действителен {settings.ACCESS_TOKEN_EXPIRE_MINUTES} минут.",
            'plain', 'utf-8'
        )
        msg['Subject'] = Header("Код подтверждения AutoCompany", 'utf-8')
        msg['From'] = settings.EMAIL_FROM
        msg['To'] = email

        server = smtplib.SMTP_SSL(
            host=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            timeout=10
        )

        server.noop()

        server.login(settings.EMAIL_FROM, settings.SMTP_PASSWORD)
        server.send_message(msg)
        server.quit()

        return True

    @staticmethod
    async def verify_email_code(email: str, code: str) -> bool:
        user = await AuthRepository.get_user_by_email(email)
        if not user:
            raise ValueError("User not found")

        if user["email_verified"]:
            raise ValueError("Email already verified")

        if user["email_code"] != code:
            raise ValueError("Invalid confirmation code")

        email_expires_time: time = user["email_expires"]
        now_utc = datetime.now(timezone.utc)
        email_expires_datetime = datetime.combine(now_utc.date(), email_expires_time, tzinfo=timezone.utc)

        if now_utc > email_expires_datetime:
            await AuthRepository.cleanup_unverified_users()
            raise ValueError("Confirmation code expired")

        await AuthRepository.confirm_email(user["user_id"])
        return True