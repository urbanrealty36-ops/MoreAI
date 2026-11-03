from urllib.parse import urlparse
from uuid import uuid4

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel

from moreai_api.settings import settings
from moreai_api.routers.credits import router as credits_router
from moreai_api.routers.llm import router as llm_router, internal_router as llm_internal_router
from moreai_api.routers.partner import router as partner_router
from moreai_api.routers.network import router as network_router
from moreai_api.routers.admin import router as admin_router
from moreai_api.routers.workspace import router as workspace_router
from moreai_api.routers.agents import (
    router as agents_router,
    internal_router as agents_internal_router,
)


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str


def resolve_cors_origins(environment: str, configured: str) -> list[str]:
    origins = [item.strip().rstrip("/") for item in configured.split(",") if item.strip()]
    if not origins:
        if environment.lower() in {"production", "prod"}:
            raise RuntimeError("CORS_ALLOWED_ORIGINS must be configured in production.")
        return [
            "http://localhost:3000",
            "http://localhost:3001",
            "http://localhost:3002",
            "http://localhost:3003",
        ]
    for origin in origins:
        parsed = urlparse(origin)
        if (
            origin == "*"
            or parsed.scheme not in {"http", "https"}
            or not parsed.netloc
            or parsed.path
            or parsed.query
            or parsed.fragment
            or (environment.lower() in {"production", "prod"} and parsed.scheme != "https")
        ):
            raise RuntimeError("CORS_ALLOWED_ORIGINS contains an invalid or insecure origin.")
    return origins


app = FastAPI(title="MoreAI API", version="0.1.0", description="Versioned business API boundary.")
app.add_middleware(
    CORSMiddleware,
    allow_origins=resolve_cors_origins(settings.moreai_env, settings.cors_allowed_origins),
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Correlation-ID", "Idempotency-Key"],
)
app.include_router(llm_router, prefix="/api/v1")
app.include_router(llm_internal_router, prefix="/api/v1")
app.include_router(credits_router, prefix="/api/v1")
app.include_router(partner_router, prefix="/api/v1")
app.include_router(network_router, prefix="/api/v1")
app.include_router(admin_router, prefix="/api/v1")
app.include_router(agents_router, prefix="/api/v1")
app.include_router(workspace_router, prefix="/api/v1")
app.include_router(agents_internal_router, prefix="/api/v1")


@app.middleware("http")
async def correlation_id(request: Request, call_next):
    correlation = request.headers.get("X-Correlation-ID") or str(uuid4())
    response = await call_next(request)
    response.headers["X-Correlation-ID"] = correlation
    return response


@app.exception_handler(Exception)
async def unhandled_exception(_: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={"code": "INTERNAL_ERROR", "message": "An unexpected error occurred."},
    )


@app.get("/health", response_model=HealthResponse, tags=["operations"])
async def health():
    return HealthResponse(status="ok", service="moreai-api", version=app.version)


@app.get("/ready", response_model=HealthResponse, tags=["operations"])
async def readiness():
    return HealthResponse(status="ok", service="moreai-api", version=app.version)


@app.get("/api/v1", tags=["meta"])
async def api_v1():
    return {"service": "moreai-api", "api_version": "v1", "status": "foundation"}
