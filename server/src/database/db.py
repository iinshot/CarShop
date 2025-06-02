from typing import Optional, Dict, Any, List
from server.src.config import settings
import asyncpg
from asyncpg import Pool

class Database:
    def __init__(self):
        self.pool: Optional[Pool] = None

    async def connect(self):
        """Для подключения к БД"""
        self.pool = await asyncpg.create_pool(
            host=settings.DB_HOST,
            port=settings.DB_PORT,
            user=settings.DB_USER,
            database=settings.DB_NAME,
            password=settings.DB_PASS
        )

    async def disconnect(self):
        """Для отключения от БД"""
        if self.pool:
            await self.pool.close()

    async def fetch_one(self, query: str, *args) -> Optional[Dict[str, Any]]:
        """Получение одной записи"""
        async with self.pool.acquire() as conn:
            return await conn.fetchrow(query, *args)

    async def fetch_all(self, query: str, *args) -> List[Dict[str, Any]]:
        """Получение всех записей"""
        async with self.pool.acquire() as conn:
            return await conn.fetch(query, *args)

    async def execute(self, query: str, *args) -> str:
        """Выполнение запроса (возвращает строку с информацией о выполнении)"""
        async with self.pool.acquire() as conn:
            return await conn.execute(query, *args)
        pass

    async def execute_returning(self, query: str, *args) -> Dict[str, Any]:
        """Выполнение запроса с возвратом данных"""
        async with self.pool.acquire() as conn:
             return await conn.fetchrow(query, *args)

db = Database()