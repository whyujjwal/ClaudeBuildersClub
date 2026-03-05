# AI Agent Deployment Guide

## Overview

This guide covers how to take your AI agent from local development to production.

## Table of Contents

1. [Project Structure](#project-structure)
2. [Environment & Secrets](#environment--secrets)
3. [Docker](#docker)
4. [Cloud Deployment](#cloud-deployment)
5. [API Server](#api-server)
6. [Monitoring](#monitoring)
7. [Cost Management](#cost-management)

---

## Project Structure

```
my-agent/
├── src/
│   ├── agent.py          # Agent logic
│   ├── tools.py          # Tool definitions
│   └── config.py         # Settings
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

## Environment & Secrets

Never commit API keys. Use environment variables or a secrets manager.

### .env.example

```bash
# Copy to .env and fill in values
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
DATABASE_URL=
```

### config.py

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    openai_api_key: str = ""
    anthropic_api_key: str = ""
    database_url: str = "sqlite:///agent.db"
    max_tokens: int = 4096
    model: str = "gpt-4o"

    class Config:
        env_file = ".env"

settings = Settings()
```

## Docker

### Dockerfile

```dockerfile
FROM python:3.12-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ ./src/

EXPOSE 8000

CMD ["uvicorn", "src.server:app", "--host", "0.0.0.0", "--port", "8000"]
```

### docker-compose.yml

```yaml
services:
  agent:
    build: .
    ports:
      - "8000:8000"
    env_file:
      - .env
    restart: unless-stopped
```

### Build & Run

```bash
docker compose up --build -d
```

## Cloud Deployment

### Option 1: Railway

Easiest path to production.

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

Set environment variables in the Railway dashboard.

### Option 2: Google Cloud Run

```bash
# Build and push
gcloud builds submit --tag gcr.io/PROJECT_ID/my-agent

# Deploy
gcloud run deploy my-agent \
  --image gcr.io/PROJECT_ID/my-agent \
  --platform managed \
  --region us-central1 \
  --set-env-vars "MODEL=gpt-4o" \
  --set-secrets "OPENAI_API_KEY=openai-key:latest"
```

### Option 3: AWS (ECS/Fargate)

```bash
# Create ECR repo
aws ecr create-repository --repository-name my-agent

# Build, tag, push
docker build -t my-agent .
docker tag my-agent:latest <account>.dkr.ecr.<region>.amazonaws.com/my-agent:latest
docker push <account>.dkr.ecr.<region>.amazonaws.com/my-agent:latest

# Deploy with Fargate (use AWS console or CDK for full setup)
```

### Option 4: Fly.io

```bash
# Install and deploy
curl -L https://fly.io/install.sh | sh
fly launch
fly secrets set OPENAI_API_KEY=your-key
fly deploy
```

## API Server

Wrap your agent in a FastAPI server for production use.

### server.py

```python
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import asyncio

app = FastAPI(title="AI Agent API")

class AgentRequest(BaseModel):
    message: str
    session_id: str | None = None

class AgentResponse(BaseModel):
    response: str
    session_id: str

@app.post("/chat", response_model=AgentResponse)
async def chat(req: AgentRequest):
    try:
        # Run your agent here
        result = await run_agent(req.message, req.session_id)
        return AgentResponse(response=result, session_id=req.session_id or "new")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health():
    return {"status": "ok"}
```

### Run

```bash
uvicorn src.server:app --host 0.0.0.0 --port 8000
```

## Monitoring

### Logging

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s"
)
logger = logging.getLogger(__name__)

# Log agent actions
logger.info(f"Agent invoked: model={model}, tokens={usage.total_tokens}")
logger.warning(f"Rate limit approaching: {remaining} requests left")
logger.error(f"Agent failed: {error}")
```

### Token Tracking

```python
class TokenTracker:
    def __init__(self):
        self.total_input = 0
        self.total_output = 0

    def track(self, usage):
        self.total_input += usage.input_tokens
        self.total_output += usage.output_tokens

    @property
    def estimated_cost(self):
        # Adjust rates per model
        return (self.total_input * 0.003 + self.total_output * 0.015) / 1000

tracker = TokenTracker()
```

### LangSmith (for LangChain agents)

```bash
export LANGCHAIN_TRACING_V2=true
export LANGCHAIN_API_KEY="your-langsmith-key"
```

## Cost Management

### Best Practices

1. **Use the right model** -- don't use GPT-4o for simple tasks where Mini works fine
2. **Cache responses** -- store results for identical queries
3. **Set token limits** -- always set `max_tokens` to prevent runaway costs
4. **Rate limiting** -- limit requests per user per minute
5. **Monitor daily spend** -- set alerts in your provider's dashboard

### Simple Cache

```python
import hashlib
import json

cache = {}

def cached_completion(messages, model="gpt-4o"):
    key = hashlib.md5(json.dumps(messages).encode()).hexdigest()

    if key in cache:
        return cache[key]

    response = client.chat.completions.create(model=model, messages=messages)
    cache[key] = response.choices[0].message.content
    return cache[key]
```

### Rate Limiting (FastAPI)

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@app.post("/chat")
@limiter.limit("10/minute")
async def chat(request: Request, req: AgentRequest):
    ...
```

## Production Checklist

- [ ] API keys stored in environment variables or secrets manager
- [ ] Health check endpoint (`/health`) configured
- [ ] Logging and error tracking set up
- [ ] Token usage monitoring in place
- [ ] Rate limiting enabled
- [ ] CORS configured for your frontend domain
- [ ] HTTPS enforced
- [ ] Graceful shutdown handling
- [ ] Retry logic with exponential backoff for API calls
- [ ] Input validation and sanitization
