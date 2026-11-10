import re
from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, Field, field_validator

from app.schemas.common import ResponseSchema

_EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _normalize_email(value: str) -> str:
    value = value.strip().lower()
    if len(value) > 254 or not _EMAIL_RE.match(value):
        raise ValueError("Correo electrónico no válido")
    return value


class RegisterRequest(BaseModel):
    name: Annotated[str, Field(min_length=2, max_length=80)]
    email: str
    password: Annotated[str, Field(min_length=8, max_length=128)]

    @field_validator("name")
    @classmethod
    def clean_name(cls, value: str) -> str:
        value = " ".join(value.split())
        if len(value) < 2:
            raise ValueError("El nombre debe tener al menos 2 caracteres")
        return value

    @field_validator("email")
    @classmethod
    def clean_email(cls, value: str) -> str:
        return _normalize_email(value)

    @field_validator("password")
    @classmethod
    def strong_enough(cls, value: str) -> str:
        if not (any(c.isalpha() for c in value) and any(c.isdigit() for c in value)):
            raise ValueError("La contraseña debe incluir letras y números")
        return value


class LoginRequest(BaseModel):
    email: str
    password: Annotated[str, Field(min_length=1, max_length=128)]

    @field_validator("email")
    @classmethod
    def clean_email(cls, value: str) -> str:
        return _normalize_email(value)


class UserResponse(ResponseSchema):
    id: int
    name: str
    email: str
    created_at: datetime


class TokenResponse(ResponseSchema):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
