"""
Tasky Backend — Security Headers Middleware

Enforces enterprise-grade HTTP security response headers across all endpoints.
"""

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """
    Injects standard security headers to defend against clickjacking,
    MIME-sniffing, XSS, and unauthorized cross-origin framing.
    """

    async def dispatch(self, request: Request, call_next) -> Response:
        response: Response = await call_next(request)

        # Anti-Clickjacking: Disallow embedding API/docs in external iframes
        response.headers["X-Frame-Options"] = "DENY"

        # Anti-MIME-Sniffing: Force browsers to adhere to declared Content-Type
        response.headers["X-Content-Type-Options"] = "nosniff"

        # Anti-XSS: Enable browser XSS filtering
        response.headers["X-XSS-Protection"] = "1; mode=block"

        # Referrer Policy: Send full referrer on same origin, only origin on cross-origin
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"

        # Permissions Policy: Restrict unnecessary browser hardware access
        response.headers["Permissions-Policy"] = (
            "geolocation=(), camera=(), microphone=(), payment=()"
        )

        # Enforce HTTPS HSTS if request was made over HTTPS
        if request.url.scheme == "https":
            response.headers["Strict-Transport-Security"] = (
                "max-age=31536000; includeSubDomains; preload"
            )

        return response
