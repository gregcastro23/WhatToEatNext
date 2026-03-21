"""add_image_url_to_recipes

Revision ID: 0002
Revises: 0001
Create Date: 2026-03-21 16:30:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '0002'
down_revision = '0001'
branch_labels = None
depends_on = None

def upgrade():
    op.add_column('recipes', sa.Column('image_url', sa.String(length=1024), nullable=True))

def downgrade():
    op.drop_column('recipes', 'image_url')
