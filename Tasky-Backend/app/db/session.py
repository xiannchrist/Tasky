"""
Tasky Backend — Session Management

Async session dependency for FastAPI.
"""

from typing import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.database import AsyncSessionLocal


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    """Provide a transactional async database session."""
    async with AsyncSessionLocal() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise
        finally:
            await session.close()
