from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User
from app.repositories.user_repository import UserRepository

DEMO_USER_ID = "local-demo-user"
_bearer = HTTPBearer(auto_error=False)


def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(_bearer),
    session: Session = Depends(get_db),
) -> User | None:
    """Usuario del token, o None si no se envió. Un token inválido es un 401."""
    if credentials is None:
        return None
    user_id = decode_access_token(credentials.credentials)
    user = UserRepository(session).get(user_id) if user_id is not None else None
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Sesión no válida o expirada",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def get_current_user(user: User | None = Depends(get_optional_user)) -> User:
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inicia sesión para continuar",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


def resolve_progress_user(requested: str | None, user: User | None) -> str:
    """Identidad con la que se lee/escribe el progreso.

    Con sesión, siempre es la del usuario (pedir el progreso de otra persona es 403).
    Sin sesión solo existe el perfil de demostración compartido.
    """
    if user is not None:
        if requested not in (None, DEMO_USER_ID, str(user.id)):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No puedes ver el progreso de otra persona",
            )
        return str(user.id)
    if requested not in (None, DEMO_USER_ID):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Inicia sesión para ver este progreso",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return DEMO_USER_ID
