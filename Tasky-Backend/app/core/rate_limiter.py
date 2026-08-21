"""
Tasky Backend — Rate Limiter & Anti-Brute-Force Protection

In-memory sliding window rate limiter for protecting sensitive authentication
and sync endpoints against brute force, credential stuffing, and DoS attacks.
"""

import time
from collections import defaultdict
from typing import Dict, List
from fastapi import HTTPException, Request, status


class SlidingWindowRateLimiter:
    """Sliding window rate limiter tracked by IP address."""

    def __init__(self):
        # Maps key -> list of request timestamps (epoch seconds)
        self._history: Dict[str, List[float]] = defaultdict(list)

    def check(
        self,
        key: str,
        max_requests: int = 10,
        window_seconds: int = 60,
    ) -> None:
        """
        Check if the key has exceeded max_requests within window_seconds.
        Raises 429 Too Many Requests if limit is exceeded.
        """
        now = time.time()
        window_start = now - window_seconds

        # Filter out timestamps older than the window
        timestamps = self._history[key]
        valid_timestamps = [ts for ts in timestamps if ts > window_start]

        if len(valid_timestamps) >= max_requests:
            retry_after = int(window_seconds - (now - valid_timestamps[0]))
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail=f"Too many requests. Please wait {max(1, retry_after)}s before retrying.",
                headers={"Retry-After": str(max(1, retry_after))},
            )

        valid_timestamps.append(now)
        self._history[key] = valid_timestamps

    def cleanup(self, max_idle_seconds: int = 3600) -> None:
        """Periodically clean up stale keys to prevent memory growth."""
        now = time.time()
        stale_threshold = now - max_idle_seconds
        keys_to_delete = [
            k for k, timestamps in self._history.items()
            if not timestamps or timestamps[-1] < stale_threshold
        ]
        for k in keys_to_delete:
            del self._history[k]


rate_limiter = SlidingWindowRateLimiter()


def rate_limit_auth(request: Request) -> None:
    """Dependency: Rate limit login/register attempts (max 10 requests per minute per IP)."""
    client_ip = request.client.host if request.client else "unknown"
    rate_limiter.check(
        key=f"auth:{client_ip}",
        max_requests=10,
        window_seconds=60,
    )
