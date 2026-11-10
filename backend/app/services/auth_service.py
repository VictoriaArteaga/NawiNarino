from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError

from app.core.security import (
    DUMMY_HASH,
    create_access_token,
    hash_password,
    verify_password,
)
from app.models.user import User
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserResponse


def _token_for(user: User) -> TokenResponse:
    return TokenResponse(
        access_token=create_access_token(user.id),
        user=UserResponse.model_validate(user),
    )


class AuthService:
    def __init__(self, users: UserRepository) -> None:
        self.users = users

    def register(self, data: RegisterRequest) -> TokenResponse:
        if self.users.get_by_email(data.email) is not None:
            raise self._email_taken()
        user = User(
            email=data.email,
            name=data.name,
            password_hash=hash_password(data.password),
        )
        try:
            user = self.users.add(user)
        except IntegrityError:  # registro simultáneo con el mismo correo
            self.users.session.rollback()
            raise self._email_taken() from None
        return _token_for(user)

    def login(self, data: LoginRequest) -> TokenResponse:
        user = self.users.get_by_email(data.email)
        valid = verify_password(data.password, user.password_hash if user else DUMMY_HASH)
        if user is None or not valid:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Correo o contraseña incorrectos",
            )
        return _token_for(user)

    @staticmethod
    def _email_taken() -> HTTPException:
        return HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe una cuenta con ese correo",
        )
