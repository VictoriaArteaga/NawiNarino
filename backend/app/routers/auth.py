from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.core.database import get_db
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserResponse
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
