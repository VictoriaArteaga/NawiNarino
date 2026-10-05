"""Create language, vocabulary, and cultural content tables.

Revision ID: 20261005_0001
Revises:
Create Date: 2026-10-05
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = "20261005_0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.create_table(
        "languages",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=120), nullable=False),
        sa.Column("short_description", sa.Text(), nullable=False),
        sa.Column("cultural_description", sa.Text(), nullable=False),
        sa.Column("is_mock", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )
    op.create_index("ix_languages_name", "languages", ["name"], unique=True)
    op.create_table(
        "vocabulary",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("language_id", sa.Integer(), nullable=False),
        sa.Column("word", sa.String(length=160), nullable=False),
        sa.Column("translation", sa.String(length=200), nullable=False),
        sa.Column("category", sa.String(length=100), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("audio_url", sa.String(length=500), nullable=True),
        sa.Column("is_mock", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.ForeignKeyConstraint(["language_id"], ["languages.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_vocabulary_language_id", "vocabulary", ["language_id"])
    op.create_table(
        "cultural_content",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("language_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=180), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("image_url", sa.String(length=500), nullable=True),
        sa.Column("is_mock", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.ForeignKeyConstraint(["language_id"], ["languages.id"], ondelete="CASCADE"),
    )
    op.create_index(
        "ix_cultural_content_language_id",
        "cultural_content",
        ["language_id"],
    )


def downgrade() -> None:
    op.drop_index("ix_cultural_content_language_id", table_name="cultural_content")
    op.drop_table("cultural_content")
    op.drop_index("ix_vocabulary_language_id", table_name="vocabulary")
    op.drop_table("vocabulary")
    op.drop_index("ix_languages_name", table_name="languages")
    op.drop_table("languages")

