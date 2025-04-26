"""Add Article and FavoriteArticle models

Revision ID: add_article_and_favorite_article_models
Revises: 880beff74388
Create Date: 2024-04-07 23:30:00.000000

"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime
from sqlalchemy import inspect


# revision identifiers, used by Alembic.
revision = 'add_article_and_favorite_article_models'
down_revision = '880beff74388'
branch_labels = None
depends_on = None

bind = op.get_bind()
inspector = inspect(bind)

def upgrade():
    if 'article' not in inspector.get_table_names():
        # Create article table
        op.create_table('article',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('uuid', sa.String(length=100), nullable=False),
            sa.Column('title', sa.String(length=500), nullable=False),
            sa.Column('description', sa.Text(), nullable=True),
            sa.Column('keywords', sa.String(length=500), nullable=True),
            sa.Column('snippet', sa.Text(), nullable=True),
            sa.Column('url', sa.String(length=500), nullable=False),
            sa.Column('image_url', sa.String(length=500), nullable=True),
            sa.Column('language', sa.String(length=10), nullable=True),
            sa.Column('source', sa.String(length=100), nullable=True),
            sa.Column('categories', sa.String(length=200), nullable=True),
            sa.Column('locale', sa.String(length=10), nullable=True),
            sa.Column('published_at', sa.DateTime(), nullable=True),
            sa.Column('created_at', sa.DateTime(), nullable=False, default=datetime.utcnow),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('uuid')
        )
    
    if 'favorite_article' not in inspector.get_table_names():

        # Create favorite_article table
        op.create_table('favorite_article',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('article_id', sa.Integer(), nullable=False),
            sa.Column('user_id', sa.Integer(), nullable=False),
            sa.Column('created_at', sa.DateTime(), nullable=False, default=datetime.utcnow),
            sa.ForeignKeyConstraint(['article_id'], ['article.id'], ),
            sa.ForeignKeyConstraint(['user_id'], ['user.id'], ),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('user_id', 'article_id', name='unique_user_article')
        )

def downgrade():
    op.drop_table('favorite_article')
    op.drop_table('article') 