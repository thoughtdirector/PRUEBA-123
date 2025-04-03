"""add

Revision ID: 379d4906a0c5
Revises: c83f9085db26
Create Date: 2025-04-03 10:17:29.435799

"""
from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision = '379d4906a0c5'
down_revision = 'c83f9085db26'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('qrcode', sa.Column('state', sqlmodel.sql.sqltypes.AutoString(), nullable=True))
    op.drop_column('qrcode', 'is_used')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('qrcode', sa.Column('is_used', sa.BOOLEAN(), autoincrement=False, nullable=True))
    op.drop_column('qrcode', 'state')
    # ### end Alembic commands ###
