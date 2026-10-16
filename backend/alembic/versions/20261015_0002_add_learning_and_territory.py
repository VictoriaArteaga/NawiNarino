"""Add learning, progress, territory, heritage, toponym, and source tables.

Revision ID: 20261015_0002
Revises: 20261005_0001
Create Date: 2026-10-15
"""
from collections.abc import Sequence

from alembic import op
import sqlalchemy as sa

revision: str = "20261015_0002"
down_revision: str | None = "20261005_0001"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def _timestamps() -> list[sa.Column]:
    return [
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
    ]


def upgrade() -> None:
    op.create_table(
        "lessons",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("language_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=180), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("order", sa.Integer(), nullable=False),
        sa.Column("is_mock", sa.Boolean(), nullable=False, server_default=sa.true()),
        *_timestamps(),
        sa.ForeignKeyConstraint(["language_id"], ["languages.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_lessons_language_id", "lessons", ["language_id"])

    op.create_table(
        "activities",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("lesson_id", sa.Integer(), nullable=False),
        sa.Column("title", sa.String(length=180), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("type", sa.String(length=40), nullable=False),
        sa.Column("order", sa.Integer(), nullable=False),
        sa.Column("is_mock", sa.Boolean(), nullable=False, server_default=sa.true()),
        *_timestamps(),
        sa.ForeignKeyConstraint(["lesson_id"], ["lessons.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_activities_lesson_id", "activities", ["lesson_id"])

    op.create_table(
        "activity_questions",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("activity_id", sa.Integer(), nullable=False),
        sa.Column("prompt", sa.Text(), nullable=False),
        sa.Column(
            "type",
            sa.String(length=40),
            nullable=False,
            server_default="multiple_choice",
        ),
        sa.Column("order", sa.Integer(), nullable=False),
        sa.Column("is_mock", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.ForeignKeyConstraint(
            ["activity_id"], ["activities.id"], ondelete="CASCADE"
        ),
    )
    op.create_index(
        "ix_activity_questions_activity_id",
        "activity_questions",
        ["activity_id"],
    )

    op.create_table(
        "activity_options",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("question_id", sa.Integer(), nullable=False),
        sa.Column("label", sa.String(length=240), nullable=False),
        sa.Column("is_correct", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("is_mock", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.ForeignKeyConstraint(
            ["question_id"], ["activity_questions.id"], ondelete="CASCADE"
        ),
    )
    op.create_index(
        "ix_activity_options_question_id",
        "activity_options",
        ["question_id"],
    )

    op.create_table(
        "progress",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column(
            "user_id",
            sa.String(length=100),
            nullable=False,
            server_default="local-demo-user",
        ),
        sa.Column("activity_id", sa.Integer(), nullable=False),
        sa.Column(
            "status", sa.String(length=30), nullable=False, server_default="completed"
        ),
        sa.Column("score", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("attempts", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        *_timestamps(),
        sa.ForeignKeyConstraint(
            ["activity_id"], ["activities.id"], ondelete="CASCADE"
        ),
        sa.UniqueConstraint("user_id", "activity_id", name="uq_progress_user_activity"),
    )
    op.create_index("ix_progress_user_id", "progress", ["user_id"])
    op.create_index("ix_progress_activity_id", "progress", ["activity_id"])

    op.create_table(
        "territories",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=180), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("latitude", sa.Float(), nullable=True),
        sa.Column("longitude", sa.Float(), nullable=True),
        sa.Column("region", sa.String(length=180), nullable=False),
        sa.Column("language_id", sa.Integer(), nullable=True),
        sa.Column("is_mock", sa.Boolean(), nullable=False, server_default=sa.true()),
        *_timestamps(),
        sa.ForeignKeyConstraint(
            ["language_id"], ["languages.id"], ondelete="SET NULL"
        ),
    )
    op.create_index("ix_territories_language_id", "territories", ["language_id"])

    op.create_table(
        "sources",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title", sa.String(length=240), nullable=False),
        sa.Column("author", sa.String(length=180), nullable=False),
        sa.Column("year", sa.Integer(), nullable=True),
        sa.Column("type", sa.String(length=80), nullable=False),
        sa.Column("reference", sa.Text(), nullable=False),
        sa.Column("url", sa.String(length=500), nullable=True),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("is_mock", sa.Boolean(), nullable=False, server_default=sa.true()),
        *_timestamps(),
    )

    op.create_table(
        "heritage",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("title", sa.String(length=240), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("category", sa.String(length=40), nullable=False),
        sa.Column("date_label", sa.String(length=120), nullable=True),
        sa.Column("image_url", sa.String(length=500), nullable=True),
        sa.Column("source_id", sa.Integer(), nullable=True),
        sa.Column("territory_id", sa.Integer(), nullable=True),
        sa.Column("is_mock", sa.Boolean(), nullable=False, server_default=sa.true()),
        *_timestamps(),
        sa.ForeignKeyConstraint(["source_id"], ["sources.id"], ondelete="SET NULL"),
        sa.ForeignKeyConstraint(
            ["territory_id"], ["territories.id"], ondelete="SET NULL"
        ),
    )
    op.create_index("ix_heritage_category", "heritage", ["category"])
    op.create_index("ix_heritage_source_id", "heritage", ["source_id"])
    op.create_index("ix_heritage_territory_id", "heritage", ["territory_id"])

    op.create_table(
        "toponyms",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("name", sa.String(length=180), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("meaning", sa.Text(), nullable=False),
        sa.Column("historical_context", sa.Text(), nullable=False),
        sa.Column("territory_id", sa.Integer(), nullable=True),
        sa.Column("source_id", sa.Integer(), nullable=True),
        sa.Column("is_mock", sa.Boolean(), nullable=False, server_default=sa.true()),
        *_timestamps(),
        sa.ForeignKeyConstraint(
            ["territory_id"], ["territories.id"], ondelete="SET NULL"
        ),
        sa.ForeignKeyConstraint(["source_id"], ["sources.id"], ondelete="SET NULL"),
    )
    op.create_index("ix_toponyms_territory_id", "toponyms", ["territory_id"])
    op.create_index("ix_toponyms_source_id", "toponyms", ["source_id"])


def downgrade() -> None:
    op.drop_index("ix_toponyms_source_id", table_name="toponyms")
    op.drop_index("ix_toponyms_territory_id", table_name="toponyms")
    op.drop_table("toponyms")
    op.drop_index("ix_heritage_territory_id", table_name="heritage")
    op.drop_index("ix_heritage_source_id", table_name="heritage")
    op.drop_index("ix_heritage_category", table_name="heritage")
    op.drop_table("heritage")
    op.drop_table("sources")
    op.drop_index("ix_territories_language_id", table_name="territories")
    op.drop_table("territories")
    op.drop_index("ix_progress_activity_id", table_name="progress")
    op.drop_index("ix_progress_user_id", table_name="progress")
    op.drop_table("progress")
    op.drop_index("ix_activity_options_question_id", table_name="activity_options")
    op.drop_table("activity_options")
    op.drop_index("ix_activity_questions_activity_id", table_name="activity_questions")
    op.drop_table("activity_questions")
    op.drop_index("ix_activities_lesson_id", table_name="activities")
    op.drop_table("activities")
    op.drop_index("ix_lessons_language_id", table_name="lessons")
    op.drop_table("lessons")
