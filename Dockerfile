FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    APP_HOME=/app \
    PATH="/app/.venv/bin:$PATH"

WORKDIR /app

RUN pip install --no-cache-dir uv

COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev --no-install-project

COPY . .

RUN sed -i 's/\r$//' /app/entrypoint.sh \
    && chmod +x /app/entrypoint.sh \
    && mkdir -p /data/static /data/media

ENTRYPOINT ["/app/entrypoint.sh"]
CMD ["gunicorn", "Voter_hak.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3", "--timeout", "120"]
