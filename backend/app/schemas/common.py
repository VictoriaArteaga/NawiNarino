from typing import Annotated

from fastapi import Path
from pydantic import BaseModel, ConfigDict


def to_camel_case(value: str) -> str:
    first, *rest = value.split("_")
    return first + "".join(part.capitalize() for part in rest)


PositivePathId = Annotated[int, Path(gt=0)]
UserPathId = Annotated[str, Path(min_length=1, max_length=100)]


class ResponseSchema(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        alias_generator=to_camel_case,
        populate_by_name=True,
    )
