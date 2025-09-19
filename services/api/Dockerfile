FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1 \
    PORT=8080

WORKDIR /app

# System deps for psycopg2
RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install
COPY services/api/requirements.txt /app/services/api/requirements.txt
RUN pip install -r /app/services/api/requirements.txt

# Copy project
COPY . /app

EXPOSE 8080

CMD ["uvicorn", "services.api.main:app", "--host", "0.0.0.0", "--port", "8080"]


