"""Fully merged all branches

Revision ID: 225910a10bd6
Revises: 0c875b71e2d9, add_article_and_favorite_article_models, 6fa0144022b7
Create Date: 2025-04-24 10:15:18.864076

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '225910a10bd6'
down_revision = ('0c875b71e2d9', 'add_article_and_favorite_article_models', '6fa0144022b7')
branch_labels = None
depends_on = None


def upgrade():
    pass


def downgrade():
    pass
