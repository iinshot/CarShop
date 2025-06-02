import uuid
from fastapi import FastAPI, Request
from server.src.routes import (
    cars, drivers, workers,
    lifeguards, clients, expanses,
    admissions, companies, directors,
    accountants, sellers
)
from server.src.database.db import db
from contextlib import asynccontextmanager
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from server.src.auth import users
from server.src.auth.sessions_store import sessions

@asynccontextmanager
async def lifespan(_: FastAPI):
    await db.connect()
    yield
    await db.disconnect()

app = FastAPI(title="Car Shop", lifespan=lifespan)

origins = [
    "http://localhost",
    "http://localhost:8080",
    "http://127.0.0.1",
    "http://127.0.0.1:8080",
    "http://localhost:63342",
    "http://127.0.0.1:63342",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

@app.middleware("http")
async def session_middleware(request: Request, call_next):
    session_id = request.cookies.get("session_id")
    new_session = False

    if session_id and session_id in sessions:
        request.state.session = sessions[session_id]
        request.state.session_id = session_id
    else:
        session_id = str(uuid.uuid4())
        sessions[session_id] = {}
        request.state.session = sessions[session_id]
        request.state.session_id = session_id
        new_session = True

    response = await call_next(request)

    if new_session:
        response.set_cookie(
            key="session_id",
            value=session_id,
            httponly=True,
            secure=False,
            samesite="lax",
            max_age=3600 * 30 * 24,
            path="/",
        )
        print("Set-Cookie header added to response")

    return response

app.include_router(workers.router)
app.include_router(companies.router)
app.include_router(directors.router)
app.include_router(cars.router)
app.include_router(admissions.router)
app.include_router(clients.router)
app.include_router(expanses.router)
app.include_router(accountants.router)
app.include_router(drivers.router)
app.include_router(lifeguards.router)
app.include_router(sellers.router)
app.include_router(users.router)

@app.get("/")
async def root():
    return {"message": "Car Shop"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="127.0.0.1",
        port=8000,
        reload=True
    )