"""init

Revision ID: 0001_init
Revises:
Create Date: 2026-02-18
"""
from alembic import op
import sqlalchemy as sa

revision = "0001_init"
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table(
        "users",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("email", sa.String(length=320), nullable=False, unique=True),
        sa.Column("password_hash", sa.String(length=255), nullable=False),
        sa.Column("plan", sa.String(length=50), nullable=False, server_default="free"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_users_email", "users", ["email"], unique=True)

    op.create_table(
        "credit_ledger",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("type", sa.String(length=50), nullable=False),
        sa.Column("amount", sa.Integer(), nullable=False),
        sa.Column("reference_type", sa.String(length=50), nullable=True),
        sa.Column("reference_id", sa.String(length=64), nullable=True),
        sa.Column("note", sa.String(length=255), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_credit_ledger_user_id", "credit_ledger", ["user_id"])

    op.create_table(
        "translation_jobs",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("source_lang", sa.String(length=16), nullable=False),
        sa.Column("target_lang", sa.String(length=16), nullable=False),
        sa.Column("input_uri", sa.String(length=1024), nullable=False),
        sa.Column("output_docx_uri", sa.String(length=1024), nullable=True),
        sa.Column("output_pdf_uri", sa.String(length=1024), nullable=True),
        sa.Column("status", sa.String(length=32), nullable=False, server_default="PENDING"),
        sa.Column("total_chunks", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("processed_chunks", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("token_est_in", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("token_est_out", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("token_act_in", sa.Integer(), nullable=True),
        sa.Column("token_act_out", sa.Integer(), nullable=True),
        sa.Column("debit_ledger_id", sa.String(length=64), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("error_message", sa.String(length=1024), nullable=True),
    )
    op.create_index("ix_translation_jobs_user_id", "translation_jobs", ["user_id"])

    op.create_table(
        "discovery_searches",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("query", sa.Text(), nullable=False),
        sa.Column("estimated_tokens", sa.Integer(), nullable=False, server_default="0"),
        sa.Column("debit_ledger_id", sa.String(length=64), nullable=True),
        sa.Column("result_json", sa.Text(), nullable=True),
        sa.Column("synthesis_text", sa.Text(), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_discovery_searches_user_id", "discovery_searches", ["user_id"])

    op.create_table(
        "library_items",
        sa.Column("id", sa.Uuid(), primary_key=True),
        sa.Column("user_id", sa.Uuid(), sa.ForeignKey("users.id"), nullable=False),
        sa.Column("type", sa.String(length=50), nullable=False),
        sa.Column("title", sa.String(length=255), nullable=False),
        sa.Column("metadata_json", sa.Text(), nullable=True),
        sa.Column("file_docx_uri", sa.String(length=1024), nullable=True),
        sa.Column("file_pdf_uri", sa.String(length=1024), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=True),
    )
    op.create_index("ix_library_items_user_id", "library_items", ["user_id"])

def downgrade():
    op.drop_table("library_items")
    op.drop_table("discovery_searches")
    op.drop_table("translation_jobs")
    op.drop_table("credit_ledger")
    op.drop_table("users")
