FROM ghcr.io/astral-sh/uv:0.13.6 AS uv

FROM python:3.12-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    UV_LINK_MODE=copy \
    OPENMANUS_SOURCE_PATH=/app/vendor/openmanusweb

COPY --from=uv /uv /uvx /bin/

WORKDIR /app

# Copy all workspace manifests so uv can resolve the committed workspace lock.
COPY pyproject.toml uv.lock ./
COPY apps/api/pyproject.toml apps/api/pyproject.toml
COPY apps/worker/pyproject.toml apps/worker/pyproject.toml
COPY apps/sandbox/pyproject.toml apps/sandbox/pyproject.toml

# The worker uses the immutable upstream source snapshot at runtime.
COPY apps/worker/src apps/worker/src
COPY vendor/openmanusweb vendor/openmanusweb

RUN uv sync --locked --package moreai-worker --extra openmanus --no-dev \
    && useradd --uid 10001 --create-home --shell /usr/sbin/nologin moreai \
    && chown -R moreai:moreai /app \
    && chmod -R a-w /app

USER 10001:10001

ENTRYPOINT ["uv", "run", "--frozen", "--no-sync", "--package", "moreai-worker", "moreai-worker"]
