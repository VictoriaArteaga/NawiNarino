from datetime import datetime
from typing import Literal

from app.schemas.common import ResponseSchema

HeritageCategory = Literal["historical", "linguistic", "cultural", "toponymy"]


class HeritageResponse(ResponseSchema):
    id: int
    title: str
    description: str
    category: HeritageCategory
    date_label: str | None
    image_url: str | None
    source_id: int | None
    territory_id: int | None
    is_mock: bool
    created_at: datetime
    updated_at: datetime
