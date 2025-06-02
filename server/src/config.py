from pydantic_settings import BaseSettings
import os
from dotenv import load_dotenv

load_dotenv()

class Settings(BaseSettings):
    DB_HOST: str = os.getenv("DB_HOST")
    DB_PORT: int = os.getenv("DB_PORT")
    DB_USER: str = os.getenv("DB_USER")
    DB_NAME: str = os.getenv("DB_NAME")
    DB_PASS: str = os.getenv("DB_PASS")
    ALGORITHM: str = os.getenv("ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES")
    SECRET_KEY: str = os.getenv("SECRET_KEY")
    EMAIL_FROM: str = os.getenv("EMAIL_FROM")
    EMAIL_TLS: bool = os.getenv("EMAIL_TLS")
    EMAIL_SSL: bool = os.getenv("EMAIL_SSL")
    BASE_URL: str = os.getenv("BASE_URL")
    SMTP_PORT: int = os.getenv("SMTP_PORT")
    SMTP_HOST: str = os.getenv("SMTP_HOST")
    SMTP_PASSWORD: str = os.getenv("SMTP_PASSWORD")
    class Config:
        env_file = ".env"

settings = Settings()