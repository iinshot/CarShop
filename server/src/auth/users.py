from server.src.auth.sessions_store import sessions
from fastapi import APIRouter, Depends, Request, Response
from fastapi.security import OAuth2PasswordRequestForm
from server.src.auth.models import Token, UserRegister, EmailConfirm, UserResponse
from server.src.auth.service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])

@router.post("/register", response_model=UserResponse)
async def register(user_data: UserRegister, request: Request):
    user = await AuthService.register_user(user_data)

    request.state.session["user"] = {
        "user_id": user.user_id,
        "username": user.username,
        "email": user.email,
        "email_verified": False
    }

    return user

@router.post("/login", response_model=Token)
async def login(
    request: Request,
    response: Response,
    form_data: OAuth2PasswordRequestForm = Depends()
):
    user = await AuthService.authenticate_user(form_data.username, form_data.password)
    token = await AuthService.create_access_token({"sub": user["username"]})

    session_id = request.state.session_id
    sessions[session_id] = {
        "user": {
            "user_id": user["user_id"],
            "username": user["username"],
            "email": user["email"],
            "email_verified": True
        },
        "token": token
    }

    response.set_cookie(
        key="session_id",
        value=session_id,
        httponly=True,
        secure=False,
        max_age=3600 * 30 * 24,
        samesite="lax",
        path="/"
    )

    return {"access_token": token, "token_type": "bearer"}

@router.post("/confirm-email")
async def confirm_email(request: Request, confirm_data: EmailConfirm):
    await AuthService.verify_email_code(confirm_data.email, confirm_data.code)

    if "user" in request.state.session:
        request.state.session["user"]["email_verified"] = True

    return {"message": "Email successfully confirmed"}


@router.post("/logout")
async def logout(request: Request, response: Response):
    session_id = request.cookies.get("session_id")

    if session_id in sessions:
        del sessions[session_id]

    response.delete_cookie(
        key="session_id",
        path="/"
    )

    return {"message": "Successfully logged out"}