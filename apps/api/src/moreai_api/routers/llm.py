from __future__ import annotations

import re
from typing import Annotated

import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from moreai_api.auth import require_authenticated_user
from moreai_api.settings import settings

router = APIRouter(prefix="/llm", tags=["llm"])
MODEL_PATTERN = re.compile(r"^gemini-[a-zA-Z0-9._-]{1,80}$")


class GenerateRequest(BaseModel):
    prompt: str = Field(min_length=1, max_length=12_000)
    model: str | None = Field(default=None, max_length=90)
    max_output_tokens: int = Field(default=2048, ge=1, le=4096)


class GenerateResponse(BaseModel):
    text: str
    model: str
    provider: str = "google"


@router.post("/generate", response_model=GenerateResponse)
async def generate(
    payload: GenerateRequest,
    claims: Annotated[dict, Depends(require_authenticated_user)],
) -> GenerateResponse:
    del claims  # The verified subject is available for future usage metering and ownership checks.
    api_key = settings.llm_provider_api_key
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail={"code": "LLM_PROVIDER_NOT_CONFIGURED", "message": "LLM service is not configured"},
        )
    model = payload.model or "gemini-2.5-flash"
    if not MODEL_PATTERN.fullmatch(model):
        raise HTTPException(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, detail="Unsupported model identifier")

    url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
    body = {
        "contents": [{"role": "user", "parts": [{"text": payload.prompt}]}],
        "generationConfig": {"maxOutputTokens": payload.max_output_tokens},
    }
    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(45.0, connect=5.0)) as client:
            response = await client.post(url, headers={"x-goog-api-key": api_key}, json=body)
            response.raise_for_status()
            data = response.json()
    except httpx.TimeoutException as exc:
        raise HTTPException(status_code=504, detail={"code": "LLM_TIMEOUT", "message": "Model request timed out"}) from exc
    except httpx.HTTPStatusError as exc:
        raise HTTPException(status_code=502, detail={"code": "LLM_PROVIDER_ERROR", "message": "Model provider request failed"}) from exc
    except (httpx.HTTPError, ValueError) as exc:
        raise HTTPException(status_code=502, detail={"code": "LLM_PROVIDER_UNAVAILABLE", "message": "Model provider unavailable"}) from exc

    try:
        text = "".join(
            part["text"]
            for candidate in data["candidates"][:1]
            for part in candidate["content"]["parts"]
            if isinstance(part.get("text"), str)
        )
    except (KeyError, TypeError):
        text = ""
    if not text:
        raise HTTPException(status_code=502, detail={"code": "LLM_EMPTY_RESPONSE", "message": "Model returned no text"})
    return GenerateResponse(text=text, model=model)
