from uuid import uuid4

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str
    service: str
    version: str


app = FastAPI(title="MoreAI API", version="0.1.0", description="Versioned business API boundary.")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3003",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type", "X-Correlation-ID", "Idempotency-Key"],
)


@app.middleware("http")
async def correlation_id(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Correlation-ID"] = request.headers.get("X-Correlation-ID") or str(uuid4())
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
