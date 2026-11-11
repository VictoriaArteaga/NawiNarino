from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import (
    ChangePasswordRequest,
    LoginRequest,
    RegisterRequest,
    TokenResponse,
    UpdateProfileRequest,
    UserResponse,
)
from app.services.auth_service import AuthService

router = APIRouter(prefix="/auth", tags=["auth"])


def get_auth_service(session: Session = Depends(get_db)) -> AuthService:
    return AuthService(UserRepository(session))


@router.post(
    "/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED
)
def register(
    data: RegisterRequest, service: AuthService = Depends(get_auth_service)
) -> TokenResponse:
    return service.register(data)


@router.post("/login", response_model=TokenResponse)
def login(
    data: LoginRequest, service: AuthService = Depends(get_auth_service)
) -> TokenResponse:
    return service.login(data)


@router.get("/me", response_model=UserResponse)
def me(user: User = Depends(get_current_user)) -> User:
    return user


@router.patch("/me", response_model=UserResponse)
def update_me(
    data: UpdateProfileRequest,
    user: User = Depends(get_current_user),
    service: AuthService = Depends(get_auth_service),
) -> User:
    return service.update_profile(user, data)


@router.post("/change-password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(
    data: ChangePasswordRequest,
    user: User = Depends(get_current_user),
    service: AuthService = Depends(get_auth_service),
) -> Response:
    service.change_password(user, data)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
