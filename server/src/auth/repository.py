from datetime import date, datetime, timedelta

from server.src.config import settings
from server.src.database.db import db

class AuthRepository:
    @staticmethod
    async def cleanup_unverified_users():
        expire_time = datetime.utcnow() - timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        await db.execute(
            "DELETE FROM users WHERE email_verified = false AND email_expires < $1",
            expire_time
        )

    @staticmethod
    async def get_user_by_username(username: str):
        return await db.fetch_one(
            "SELECT * FROM users WHERE username = $1",
            username
        )

    @staticmethod
    async def get_user_by_email(email: str):
        return await db.fetch_one(
            "SELECT * FROM users WHERE email = $1",
            email
        )

    @staticmethod
    async def create_user(
            username: str,
            email: str,
            hashed_password: str,
            fio: str,
            birthday: date
    ):
        return await db.execute_returning(
            """
            INSERT INTO users (
                username, email, hashed_password, 
                fio, birthday, status,
                email_verified, email_code, email_expires
            )
            VALUES ($1, $2, $3, $4, $5, 'pending', false, NULL, NULL)
            RETURNING *
            """,
            username, email, hashed_password,
            fio, birthday
        )

    @staticmethod
    async def confirm_email(user_id: int):
        return await db.execute_returning(
            """
            UPDATE users 
            SET status = 'active', email_verified = true
            WHERE user_id = $1
            """,
            user_id
        )

    @staticmethod
    async def update_email_code(user_id: int, code: str):
        await AuthRepository.cleanup_unverified_users()
        expire_at = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        return await db.execute_returning(
            """
            UPDATE users 
            SET email_code = $1, 
                email_expires = $2
            WHERE user_id = $3
            RETURNING *
            """,
            code, expire_at, user_id
        )