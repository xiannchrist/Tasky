"""
Tasky Backend — Configuration Module Export
Re-exports settings from app.core.config for flexible import paths.
"""

from app.core.config import Settings, settings

__all__ = ["Settings", "settings"]
